var edge = require('edge');
    
var psPath = process.argv[2]

var psDef = new Function(`/*
${psPath}
*/`)

var runPS = edge.func('ps', psDef);
    
runPS(process.argv[3], function (error, result) {
    if (error) console.log(error);
    else console.log(result[0]);
});