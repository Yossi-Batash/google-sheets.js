import { google } from 'googleapis';
/**
 * Create a new table in the spreadsheet.
 */
export class SheetsDB {
    /** The current database configuration options. */
    config;
    spreadsheetId;
    sheetName;
    connection;
    sheets;
    schema;
    /**
     * Initializes a new instance of the SheetsDB class and sets up the Google auth client.
     * * @param options - The database configuration options.
     * @throws Will throw an error if any required option is missing.
     */
    constructor(options) {
        this.config = options;
        if (!options || !options.credentials || !options.credentials.privateKey || !options.sheetName || !options.spreadsheetId || !options.schema) {
            throw new Error('Missing required options. Required: credentials.clientEmail, credentials.privateKey, sheetName, spreadsheetId, schema');
        }
        this.connection = new google.auth.JWT({
            email: options.credentials.clientEmail,
            key: options.credentials.privateKey,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        this.spreadsheetId = options.spreadsheetId;
        this.sheetName = options.sheetName;
        this.schema = options.schema;
        this.sheets = google.sheets({ version: 'v4', auth: this.connection });
    }
    /**
     * Bootstraps the database connection.
     * Ensures that the target sheet and schema headers exist before proceeding.
     * * @returns The initialized instance of SheetsDB.
     */
    async init() {
        await this.ensureTableExists();
        return this;
    }
    /**
     * Verifies if the target sheet exists and creates it if not.
     * It also verifies and applies the schema headers to the first row if missing.
     * * @returns A promise that resolves to true once the table is ready.
     * @throws Will throw an error if the API request fails.
     */
    async ensureTableExists() {
        try {
            const response = await this.sheets.spreadsheets.get({ spreadsheetId: this.spreadsheetId });
            const sheets = response.data.sheets || [];
            if (!sheets.some((sheet) => sheet.properties?.title === this.sheetName)) {
                await this.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: this.spreadsheetId,
                    requestBody: {
                        requests: [
                            {
                                addSheet: {
                                    properties: {
                                        title: this.sheetName,
                                    },
                                },
                            },
                        ],
                    },
                });
            }
            const headers = (await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${this.sheetName}!A1:Z1`
            })).data.values?.[0] || [];
            if (this.schema.length > 0 && !this.schema.every(header => headers.includes(header))) {
                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: this.spreadsheetId,
                    range: `${this.sheetName}!A1`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: [this.schema]
                    }
                });
            }
            return true;
        }
        catch (err) {
            throw new Error(`Failed ensureTableExists: ${err}`);
        }
    }
    /**
     * Retrieves all rows from the sheet and maps them to an array of objects
     * using the first row as the keys.
     * * @returns A promise that resolves to an array of key-value records.
     * @throws Will throw an error if the API request fails.
     */
    async getAll() {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${this.sheetName}!A:Z`
            });
            const rows = response.data.values;
            if (!rows || rows.length === 0)
                return [];
            const headers = rows[0];
            return rows.slice(1).map((row) => {
                const obj = {};
                headers.forEach((header, i) => {
                    obj[header] = row[i];
                });
                return obj;
            });
        }
        catch (err) {
            throw new Error(`Failed in getAll(): ${err}`);
        }
    }
}
