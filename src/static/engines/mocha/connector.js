riurik.engine = {}

riurik.engine.init = function( next ){
	riurik.trigger( "riurik.engine.initing" );

	$('#frame-container').remove();			
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
    mocha.setup('bdd');
};

riurik.matchers.pass = function(message) {
	
};

riurik.matchers.fail = function(message) {
	
};

$.extend(riurik.exports, riurik.matchers);

$.extend(riurik.exports);
