convertExcel = require('excel-as-json').processFile;
convertExcel ('lostinmadrid_data.xlsx', 'lostinmadrid_data.json', false, null);
console.log("Finished!");