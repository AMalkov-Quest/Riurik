riurik.engine = {}

riurik.engine.init = function( next ){
	riurik.trigger( "riurik.engine.initing" );
	
	$('#frame-container').remove();
	
	riurik.loader()
	.queue('/static/engines/daspec/daspec-web.js')
	.queue('/static/engines/daspec/daspec.html.js')
	.then(function() {
		riurik.engine.config();
		load_remote_style('/static/engines/daspec/daspec.css');
		riurik.trigger( "riurik.engine.inited" );
		next();
	});
};

riurik.engine.run_tests = function() {
	console.log('start daspec tests...');
	//riurik.engine.jasmineEnv.execute();
};

riurik.engine.config = function() {
	
};

$.extend(riurik.exports);
