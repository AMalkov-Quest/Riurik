failed = function(url) {
	this.testname = 'login_as_different_user_back-end';
	this.url = url || 'http://atimiskov-w2k3:3141/';
	this.run = function() { 
		this.check(true, false);
	};
}
failed.prototype = new BaseTest();
failed.prototype.constructor = failed;
failed.superClass = BaseTest.prototype;
var failed_test = new failed();

TestRunner.addTest(failed_test);

