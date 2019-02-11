console.log("Processing locations sheet...");
convertExcel = require('excel-as-json').processFile;
convertExcel("data.xlsx", "locations.json", {sheet: '1', omitEmptyFields: true}, null);

console.log("Processing categories sheet...");
convertExcel("data.xlsx", "categories.json", {sheet: '2', omitEmptyFields: true}, null);

console.log("Processing services sheet...");
convertExcel("data.xlsx", "services.json", {sheet: '3', omitEmptyFields: true}, null);

console.log("Processing specialities sheet...");
convertExcel("data.xlsx", "specialities.json", {sheet: '4', omitEmptyFields: true}, null);

console.log("Finished!");