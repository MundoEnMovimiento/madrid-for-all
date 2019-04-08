console.log("Processing locations sheet...");
convertExcel = require('excel-as-json').processFile;
convertExcel("data.v2.xlsx", "locations.json", {sheet: '1', omitEmptyFields: true}, null);

console.log("Processing categories sheet...");
convertExcel("data.v2.xlsx", "categories.json", {sheet: '2', omitEmptyFields: true}, null);

console.log("Processing services sheet...");
convertExcel("data.v2.xlsx", "services.json", {sheet: '3', omitEmptyFields: true}, null);

console.log("Processing waysOfContact sheet...");
convertExcel("data.v2.xlsx", "waysOfContact.json", {sheet: '4', omitEmptyFields: true}, null);

console.log("Processing languages sheet...");
convertExcel("data.v2.xlsx", "languages.json", {sheet: '5', omitEmptyFields: true}, null);

console.log("Processing targettedOrigins sheet...");
convertExcel("data.v2.xlsx", "targettedOrigins.json", {sheet: '5', omitEmptyFields: true}, null);

console.log("Finished!");