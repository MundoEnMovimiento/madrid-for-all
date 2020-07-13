convertExcel = require('excel-as-json').processFile;

console.log("Processing Locations sheet...");
convertExcel("data.xlsx", ".\\data\\locations.json", {sheet: '1', omitEmptyFields: true}, null);

console.log("Processing Services sheet...");
convertExcel("data.xlsx", ".\\data\\services.json", {sheet: '2', omitEmptyFields: true}, null);

console.log("Processing LocationServices sheet...");
convertExcel("data.xlsx", ".\\data\\locationServices.json", {sheet: '3', omitEmptyFields: true}, null);

console.log("Processing Languages sheet...");
convertExcel("data.xlsx", ".\\data\\languages.json", {sheet: '4', omitEmptyFields: true}, null);

console.log("Processing ServiceTypes sheet...");
convertExcel("data.xlsx", ".\\data\\serviceTypes.json", {sheet: '5', omitEmptyFields: true}, null);

console.log("Processing WaysOfContact sheet...");
convertExcel("data.xlsx", ".\\data\\waysOfContact.json", {sheet: '6', omitEmptyFields: true}, null);

console.log("Finished!");