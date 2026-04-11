# 📊 google-sheets.js

![NPM Version](https://img.shields.io/npm/v/gsheets-db.js?style=flat-square)
![License](https://img.shields.io/npm/l/gsheets-db.js?style=flat-square)
![Node Version](https://img.shields.io/node/v/gsheets-db.js?style=flat-square)

**gsheets-db.js** is a lightweight and fast wrapper for using Google Sheets as a database in your Node.js projects. Built with TypeScript for maximum type-safety and full Intellisense support (Not official Google NPM package!).

## 📦 Installation

You can install the library via NPM:

```bash
npm install gsheets-db.js
```

---

## 🛠 Initial Setup

Before using the library, ensure you have a `creds.json` file from a Google Cloud Service Account.

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Google Sheets API**.
3. Create a **Service Account** and download the JSON key.
4. Share your Google Sheet with the email address of the service account.

---

## Example

```typescript
import { SheetsDB } from "gsheets-db.js";
import creds from "./creds.json" with { type: "json" };

// Configure the database.
const usersDB = new SheetsDB({
    credentials: { clientEmail: creds.client_email, privateKey: creds.private_key },
    sheetName: "users",
    // sheetNamt is the sheet in the spreadsheet.
    spreadsheetId: "spreadsheet id, can be found by the url of the spreadsheet",
    schema: ["id", "name", "email"]
});

// Initialize the database
await usersDB.init();

// Get all the data in the table
const all = await usersDB.getAll();
console.log(all);
```

---

## Documentation

The full documentation is available at:
[https://yossi-batash.github.io/gsheets-db.js/](https://yossi-batash.github.io/gsheets-db.js/)

---

## 📜 License

Distributed under the **ISC** License. See `LICENSE` for more information.

---
**Developed with ❤️ by [Yossi Batash](https://github.com/Yossi-Batash)**