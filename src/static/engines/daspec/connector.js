riurik.engine = {}

riurik.engine.init = function( next ){
	riurik.trigger( "riurik.engine.initing" );
	
	$('#frame-container').remove();
	riurik.engine.config();
	riurik.trigger( "riurik.engine.inited" );
	
	load_remote_style('/static/engines/daspec/daspec.css');
	next();
};

riurik.engine.run_tests = function() {
	console.log('start daspec tests...');
	//riurik.engine.jasmineEnv.execute();
};

riurik.engine.config = function() {
    
};

$.extend(riurik.exports);
