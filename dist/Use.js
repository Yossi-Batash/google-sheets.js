import { SheetsDB } from "./Main.js";
// הערה לגבי השורה הזו למטה
import creds from "./creds.json" with { type: "json" };
const usersDB = new SheetsDB({
    credentials: { clientEmail: creds.client_email, privateKey: creds.private_key },
    sheetName: "users",
    spreadsheetId: "1g64fOACIThrA7OHBoA6jyLMXm88Yse4Jx3l_4f3bphg",
    schema: ["id", "name", "email"]
});
await usersDB.init();
const all = await usersDB.getAll();
console.log(all);
