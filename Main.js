import { google } from "googleapis"

/** @import { ConnectionOptions } from "./types/Connection" */

export class SheetsDB {
    /** @param { ConnectionOptions } config */
    constructor(config) {
        this.config = config;
        
        if (!config || !config?.credentials || !config?.credentials.privateKey || !config?.sheetName || !config?.spreadsheetId) {
            throw new Error('Missing required config. Required: credentials.clientEmail, credentials.privateKey, sheetName, spreadsheetId');
        }

        this.spreadsheetId = config.spreadsheetId;
        this.sheetName = config.sheetName;

        this.connection = new google.auth.JWT({
            email: config.credentials.clientEmail,
            key: config.credentials.privateKey, // תוקן מ-apiKey ל-key
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        
        this.sheets = google.sheets({ version: 'v4', auth: this.connection });
    }

    async init() {
        await this.ensureTableExists(this.sheetName);
        return this; 
    }

    /**
     * @param {string} sheetName
     */
    async ensureTableExists(sheetName) {
        try {
            const response = await this.sheets.spreadsheets.get({ spreadsheetId: this.spreadsheetId });
            const sheets = response.data.sheets;
            
            if (sheets.some((sheet) => sheet.properties.title === sheetName)) return false;

            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: sheetName,
                                },
                            },
                        },
                    ],
                },
            });

            return true;
        } catch (err) {
            throw new Error(`Failed ensureTableExists: ${err}`);
        }
    }

    async getAll() {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${this.sheetName}!A:Z`
            });
            const rows = response.data.values;
            if (!rows || rows.length === 0) return [];
            
            const headers = rows[0];
            return rows.slice(1).map(row => {
                const obj = {};
                headers.forEach((header, i) => {
                    obj[header] = row[i];
                });
                return obj;
            });
        } catch (err) {
            throw new Error(`Failed getAll: ${err}`);
        }
    }
}