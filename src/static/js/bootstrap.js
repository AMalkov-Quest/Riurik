if ( typeof console == 'undefined' || typeof console.log == 'undefined' ) {
	var console = { log: function(){} };
}

riurikldr.loader = function() {
	var queue = [];
	var callbacks = [];
	var running = false;
	var execute = function(){
		running = true;
		if ( queue.length > 0 ) {
			var task = queue.shift();
			riurikldr.LoadScript( 
				task.url, 
				function(){
					if ( typeof task.callback == 'function' ) 
						task.callback();
					setTimeout( execute, 0 );
				}
			);
			return;	
		} 
		if ( callbacks.length > 0 ) {
			var callback = callbacks.shift();
			callback();
			setTimeout( execute, 0 );
			return;
		}
		running = false;
	};
	this.queue = function( url, step_callback ){
		if ( typeof step_callback != 'function' ) step_callback = function(){};
		queue.push({ 'url': url, 'callback': step_callback });
		if ( ! running ) execute();
		return this;
	};

	this.then = function( callback ) {
		callbacks.push( callback );
		if ( ! running ) { console.log('execute from THEN'); setTimeout( execute, 0 ); }
		return this;
	};

	return this;
};
var load_remote_style = function(url){
	var style = document.createElement( 'link' );
	style.type = 'text/css';
	style.rel = 'stylesheet';
	style.href = riurikldr.BuildHttpUri(url)+'?_='+Math.random().toString();
	document.body.appendChild( style );
};

riurikldr.loader().queue('/static/js/jquery.min.js', function(){
	document.title = /\/([^\/]*)\/*$/.exec(riurikldr.args.path)[1];
	riurikldr.loader()
	.queue('/static/js/tools.js')
	.queue('/static/js/jquery.json.min.js')
	.queue('/static/jquery-ui/js/jquery-ui.custom.min.js')
	.queue('/static/js/dates.js')
	.queue(riurikldr.args.cwd + '/.context.js')
	.queue('/static/js/riurik.js')
	.queue('/static/engines/engines.js')
	.queue('/static/js/reporting.js')
	.queue('/static/js/frame.js')
	.queue('/static/js/errors.js')
	.then(function() {
		var engine = 'qunit';
		riurik.load_test_engine( engine );
	});

	load_remote_style('/static/css/loader.css');
	load_remote_style('/static/jquery-ui/css/redmond/jquery-ui.custom.css');
});
