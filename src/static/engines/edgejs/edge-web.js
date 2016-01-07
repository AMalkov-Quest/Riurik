var edge = require('edge');
    
var hello = edge.func('ps', function () {/*
    C:\Riurik\TestsRoot\daspec-tests\Try-PowerShell.ps1
*/});
    
hello('Node.js', function (error, result) {
    if (error) throw error;
    console.log(result[0]);
});