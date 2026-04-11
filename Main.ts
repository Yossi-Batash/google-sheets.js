import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';

/**
 * Credentials for the Google Cloud Service Account.
 */
export interface ConnectionCredentials {
    /** The service account client email.
     * The spreadsheet must be shared to this email with **"Edit"** permission!
     */
    clientEmail: string;
    /** The service account private key. */
    privateKey: string;
}

/**
 * Configuration options for initializing the Google Sheets database.
 */
export interface DBOptions {
    /** Authentication credentials. */
    credentials: ConnectionCredentials;
    /** The ID of the Google Spreadsheet (can be found in the URL). */
    spreadsheetId: string;
    /** The name of the specific sheet to use. Will create a new one if not exist.. */
    sheetName: string;
    /** An array of strings representing the column headers. */
    schema: string[];
}

/**
 * Create a new table in the spreadsheet.
 */
export class SheetsDB {
    /** The current database configuration options. */
    public config: DBOptions;
    
    private spreadsheetId: string;
    private sheetName: string;
    private connection: JWT;
    private sheets: sheets_v4.Sheets;
    private schema: string[];

    /**
     * Initializes a new instance of the SheetsDB class and sets up the Google auth client.
     * * @param options - The database configuration options.
     * @throws Will throw an error if any required option is missing.
     */
    constructor(options: DBOptions) {
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
        this.schema = options.schema
        this.sheets = google.sheets({ version: 'v4', auth: this.connection });
    }

    /**
     * Bootstraps the database connection.
     * Ensures that the target sheet and schema headers exist before proceeding.
     * * @returns The initialized instance of SheetsDB.
     */
    public async init(): Promise<this> {
        await this.ensureTableExists();
        return this;
    }

    /**
     * Verifies if the target sheet exists and creates it if not.
     * It also verifies and applies the schema headers to the first row if missing.
     * * @returns A promise that resolves to true once the table is ready.
     * @throws Will throw an error if the API request fails.
     */
    public async ensureTableExists(): Promise<boolean> {
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
        } catch (err) {
            throw new Error(`Failed ensureTableExists: ${err}`);
        }
    }

    /**
     * Retrieves all rows from the sheet and maps them to an array of objects
     * using the first row as the keys.
     * * @returns A promise that resolves to an array of key-value records.
     * @throws Will throw an error if the API request fails.
     */
    public async getAll(): Promise<Record<string, any>[]> {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${this.sheetName}!A:Z`
            });

            const rows = response.data.values;
            if (!rows || rows.length === 0) return [];

            const headers = rows[0] as string[];

            return rows.slice(1).map((row: any[]) => {
                const obj: Record<string, any> = {};
                headers.forEach((header: string, i: number) => {
                    obj[header] = row[i];
                });
                return obj;
            });
        } catch (err) {
            throw new Error(`Failed in getAll(): ${err}`);
        }
    }
}