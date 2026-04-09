import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
/** @import { ConnectionConfig } from "./types/Connection" */

export class Connection {
    /** @param {ConnectionConfig} config */
    constructor(config) {
        this.config = config
        if(!config || !config?.clientEmail || !config?.privateKey || !config?.sheetId) {
            throw new Error('Missing required config. Required: clientEmail, privateKey, sheetId')
        }
        const serviceAccountAuth = new JWT({
            email: this.config.clientEmail,
            key: this.config.privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const doc = new GoogleSpreadsheet(this.config.sheetId, serviceAccountAuth);
        console.log()
        return doc
    }
}