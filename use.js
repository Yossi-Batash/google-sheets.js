import { Connection } from "./Main.js";
import creds from "./creds.json" with { type: 'json' }
const connect = new Connection({
    clientEmail: creds.client_email,
    privateKey: creds.private_key,
    sheetId: creds.sheetId
});
console.log(connect)