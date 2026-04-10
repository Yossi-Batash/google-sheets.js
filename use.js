import { SheetsDB } from "./Main.js";
import creds from "./creds.json" with { type: 'json' }
const usersDB = new SheetsDB({
    credentials: { clientEmail: creds.client_email, privateKey: creds.private_key },
    sheetName: "users",
    spreadsheetId: "1g64fOACIThrA7OHBoA6jyLMXm88Yse4Jx3l_4f3bphg"
})
await usersDB.init()

usersDB.getAll().then((data) => {
    console.log(data)
})