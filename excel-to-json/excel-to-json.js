console.log("Processing Locations sheet...");
convertExcel = require('excel-as-json').processFile;
convertExcel("data.v5.xlsx", "locations.json", {sheet: '1', omitEmptyFields: true}, null);

console.log("Processing Services sheet...");
convertExcel("data.v5.xlsx", "services.json", {sheet: '2', omitEmptyFields: true}, null);

console.log("Processing LocationServices sheet...");
convertExcel("data.v5.xlsx", "locationServices.json", {sheet: '3', omitEmptyFields: true}, null);

console.log("Processing Languages sheet...");
convertExcel("data.v5.xlsx", "languages.json", {sheet: '4', omitEmptyFields: true}, null);

console.log("Processing ServiceTypes sheet...");
convertExcel("data.v5.xlsx", "serviceTypes.json", {sheet: '5', omitEmptyFields: true}, null);

console.log("Processing WaysOfContact sheet...");
convertExcel("data.v5.xlsx", "waysOfContact.json", {sheet: '6', omitEmptyFields: true}, null);

console.log("Finished!");