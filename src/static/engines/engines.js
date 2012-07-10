
riurik.engine = {}

riurik.engine.init = function(){
	alert('No engine assigned to init');
}

riurik.load_test_engine = function( engine ){
	riurik.trigger( "riurik.engine.loading", engine );

	riurikldr.loader()
	.queue('/static/engines/'+engine+'/connector.js')
	.then(function() {
		riurik.engine.init(function(){
			riurik.trigger( "riurik.engine.loaded" );
		});
	});
}
