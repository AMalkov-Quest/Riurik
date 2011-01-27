login_as_different_user_backend = function(url) {
	this.testname = 'login_as_different_user_back-end';
	this.url = url || 'http://atimiskov-w2k3:3141/';
	this.run = function() { 
		this.check(true, true);
	};
}
login_as_different_user_backend.prototype = new BaseTest();
login_as_different_user_backend.prototype.constructor = login_as_different_user_backend;
login_as_different_user_backend.superClass = BaseTest.prototype;
var login_as_different_user_backend_test = new login_as_different_user_backend();

TestRunner.addTest(login_as_different_user_backend_test);

