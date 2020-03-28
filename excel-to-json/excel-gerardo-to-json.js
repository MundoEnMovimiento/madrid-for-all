console.log("Processing Locations sheet...");
convertExcel = require('excel-as-json').processFile;
convertExcel("DatosMadridForAll.xlsx", "locations-ger.json", {sheet: '1', omitEmptyFields: true}, null);

console.log("Processing Services sheet...");
convertExcel("DatosMadridForAll.xlsx", "services-ger.json", {sheet: '2', omitEmptyFields: true}, null);

console.log("Processing LocationServices sheet...");
convertExcel("DatosMadridForAll.xlsx", "locationServices-ger.json", {sheet: '3', omitEmptyFields: true}, null);

console.log("Processing Languages sheet...");
convertExcel("DatosMadridForAll.xlsx", "languages-ger.json", {sheet: '4', omitEmptyFields: true}, null);

console.log("Processing ServiceTypes sheet...");
convertExcel("DatosMadridForAll.xlsx", "serviceTypes-ger.json", {sheet: '5', omitEmptyFields: true}, null);

console.log("Processing WaysOfContact sheet...");
convertExcel("DatosMadridForAll.xlsx", "waysOfContact-ger.json", {sheet: '6', omitEmptyFields: true}, null);

console.log("Finished!");