console.log("Processing lostinmadrid_data.xlsx...");

convertExcel = require('excel-as-json').processFile;

convertExcel("data.xlsx", "data.json", false, null);

console.log("Finished!");