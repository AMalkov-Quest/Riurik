riurik.engine = {}

riurik.engine.init = function( next ){
	riurik.trigger( "riurik.engine.initing" );
			
	riurik.engine.config();
	riurik.trigger( "riurik.engine.inited" );
	next();

	load_remote_style('/static/engines/mocha/mocha.css');
};

riurik.engine.run_tests = function() {
	console.log('start mocha tests...');
	mocha.run();
};

riurik.engine.config = function() {
    //mocha.setup('bdd');
	mocha.setup({
		ui: 'bdd',
		globals: ['hasCert'],	// switch off the global leak detection mechanism
		timeout: 10000			// the test-case timeout
	});
};

riurik.matchers.pass = function(message) {
	
};

riurik.matchers.fail = function(message) {
	
};

$.extend(riurik.exports, riurik.matchers);

$.extend(riurik.exports);
