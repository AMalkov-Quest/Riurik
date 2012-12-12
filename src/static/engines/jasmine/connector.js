riurik.engine = {}

riurik.engine.init = function( next ){
	riurik.trigger( "riurik.engine.initing" );
	
	$('#frame-container').remove();
	riurik.engine.config();
	riurik.trigger( "riurik.engine.inited" );
	next();

	load_remote_style('/static/engines/jasmine/jasmine.css');
};

riurik.engine.run_tests = function() {
	console.log('start jasmine tests...');
	riurik.engine.jasmineEnv.execute();
};

riurik.engine.config = function() {
    riurik.engine.jasmineEnv = jasmine.getEnv();
	riurik.engine.jasmineEnv.updateInterval = 1000;

	//var reporter = new jasmine.TrivialReporter();
	var reporter = new jasmine.HtmlReporter();
	riurik.engine.jasmineEnv.addReporter(reporter);
	riurik.engine.jasmineEnv.specFilter = function(spec) {
		return reporter.specFilter(spec);
	};
};

riurik.matchers.pass = function(message) {
	expect(false).toBeFalsy();
};

riurik.matchers.fail = function(message) {
	expect(true).toBeFalsy();
};

$.extend(riurik.exports, riurik.matchers);

$.extend(riurik.exports);
