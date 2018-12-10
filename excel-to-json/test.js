convertExcel = require('excel-as-json').processFile;
 
convertExcel('row.xlsx', 'row.json', false, (err, data) ->
    if err then console.log "JSON conversion failure: #{err}");