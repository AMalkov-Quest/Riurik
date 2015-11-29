defineStep(/The right way to greet the (.*) is "(.*)"/, function (subject, expectedGreeting) {
    var edge = require('edge');
    
    var hello = edge.func('ps', function () {/*
        "PowerShell welcomes $inputFromJS on $(Get-Date)"
    */});
    
    promise = new Promise(function (resolve, reject) {
		var actualResult = hello(subject, function (error, result) {
            if (error) throw error;
            resolve(result[0]);
        });
	});
    
    promise.then(function (result) {
        expect(result).toEqual(expectedGreeting);
	});
	
	return promise;
});