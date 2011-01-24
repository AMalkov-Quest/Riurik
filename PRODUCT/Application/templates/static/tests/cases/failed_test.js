failed = function(url) {
	this.testname = 'SAMPLE Test';
	this.url = url || /http:\/\/.*?\//.exec(window.location.href || document.url)[0];
	this.run = function() { 
        /*Test = this;
        next(function(){
            return Test.import('contrib.pbrowser');
        }).
        next(function(){
            return Test.import('contrib.selenium2');
        }).
        next(function(){
            return Test.make('instance', 'Browser');
        }).
        next(function(){
            return Test.call('instance', 'go', Test.url);
        }).
        next(function(){
            return Test.call('instance', 'shut_down');
        });
        */
	};
}
failed.prototype = new BaseTest();
failed.prototype.constructor = failed;
failed.superClass = BaseTest.prototype;
var failed_test = new failed();

TestRunner.addTest(failed_test);

