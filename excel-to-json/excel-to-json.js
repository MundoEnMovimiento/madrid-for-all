console.log("Processing data.xlsx...");
convertExcel = require('excel-as-json').processFile;
convertExcel("data.xlsx", "data.json", {omitEmptyFields: true}, null);

console.log("Processing categories.xlsx...");
convertExcel("categories.xlsx", "categories.json", {omitEmptyFields: true}, null);

console.log("Finished!");