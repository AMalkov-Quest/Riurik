
riurik.engine = {}

riurik.engine.init = function(){
	alert('No engine assigned to init');
}

/* This should be implemented in appropriate engine */
riurik.engine.config = function(message) {
	alert('Test Engine config is not implemented');
};

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
