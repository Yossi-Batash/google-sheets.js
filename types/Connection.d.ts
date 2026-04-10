import { JWT } from "google-auth-library"
import { sheets_v4 } from "googleapis";

export interface ConnectionCredentials {
    clientEmail: string;
    privateKey: string;
}

export interface ConnectionOptions {
    credentials: ConnectionCredentials;
    spreadsheetId: string;
    sheetName: string;
}

export declare class Connection {
    private clientEmail: string;
    private privateKey: string;
    private spreadsheetId: string;
    private sheetName: string;
    private connection: JWT;
    private sheets: sheets_v4.Sheets

    constructor(options: ConnectionOptions);

    async init(): Promise<this>;
    async ensureTableExists(): Promise<boolean>;
    async getAll(): Promise<any[][]>;
}