console.log("Processing row.xlsx...");
convertExcel = require('excel-as-json').processFile;
convertExcel("row.xlsx", "row.json", {sheet: '1', omitEmptyFields: true}, null);

console.log("Finished!");