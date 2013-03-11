riurik.engine = {}

riurik.engine.init = function( next ){
	riurik.trigger( "riurik.engine.initing" );
			
	riurik.engine.config();
	riurik.trigger( "riurik.engine.inited" );
	next();

	load_remote_style('/static/engines/mocha/mocha.css');
};

riurik.engine.run_tests = function() {
	console.log('start mocha tests ...');
	riurik.trigger("riurik.tests.begin");
	runner = mocha.run();
	riurik.reporter.mocha(runner);
};

riurik.engine.config = function() {
	//using chai
	window.expect = chai.expect
	chai.should()

	mocha.setup({
		ui: 'tdd',
		globals: ['hasCert'],	// switch off the global leak detection mechanism
		ignoreLeaks: true,
		timeout: 10000			// the test-case timeout
	});

};

riurik.reporter.engine = 'mocha';

riurik.reporter.mocha = function(runner) {

	runner.on('start', function() {
		console.log('Mocha START');
	});

	runner.on('suite start', function(suite) {
		console.log('Mocha suite START:');
		console.log(suite);
	});

	runner.on('test start', function(test) {
		console.log('Mocha test START:');
		console.log(test);
	});

	runner.on('test end', function(test) {
		console.log('Mocha test END:');
		console.log(test);
		if(test.state == 'passed') {
			test.passed = 1;
			test.failed = 0;
			test.total = 1;
		}else{
			test.passed = 0;
			test.failed = 1;
			test.total = 1;
		}
		riurik.trigger("riurik.tests.test.done", test.title, test.passed, test.failed, test.total);
	});

	runner.on('suite end', function(suite) {
		console.log('Mocha suite END:');
		console.log(suite);
	});

	runner.on('end', function() {
		console.log('Mocha END');
		riurik.trigger("riurik.tests.end");
	});

}

riurik.reporter.getTestDuration = function () {
	return 0;
};

riurik.reporter.getHtmlTestResults = function () {
	return '';
};

riurik.matchers.pass = function(message) {
	
};

riurik.matchers.fail = function(message) {
	
};

$.extend(riurik.exports, riurik.matchers);

$.extend(riurik.exports);
