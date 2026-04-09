export interface ConnectionConfig {
    clientEmail: string;
    privateKey: string;
    sheetId: string;
}

export declare class Connection {
    private clientEmail: string;
    private privateKey: string;
    private sheetId: string;

    constructor(options: ConnectionConfig);

    findRowByColumn(columnName: string, value: string): Object | null;
}