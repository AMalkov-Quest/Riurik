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
	.queue('/static/js/jquery.json.min.js')
	.queue('/static/jquery-ui/js/jquery-ui.custom.min.js')
	.queue('/static/js/qunit.js')
	.queue('/static/js/dates.js')
	.queue('/static/js/riurik.js')
	.queue('/static/js/reporting.js')
	.queue('/static/js/testLoader.js')
	.queue(riurikldr.args.cwd + '/.context.js')
	.then(function(){
		$(document).ready(function() {
			riurik.init();
			$("#tabs").tabs();
			riurik.QUnit.context = clone(context);
			var l = riurikldr.loader();
			$.each(context.libraries || [],function(i,url){l.queue( '/' + url );});
			
			if ( /\.js$/.test(riurikldr.args.path) ) {
				l.queue(riurikldr.args.path);
			} else {
				if(typeof context.suite_setup != 'undefined'){
					l.queue( riurikldr.args.cwd + '/' + context.suite_setup );
				}
				$.each(context.include || [],function(i,url){l.queue( riurikldr.args.cwd + '/' + url );});
			};
			l.then(function(){
				QUnit.config.autorun = false;
				QUnit.load();
			});
			setTimeout(function force_qunit_to_start() {
				if( QUnit.config.autostart != true ) {
					QUnit.log('scripts load timeout, forcing tests to start ...');
				}	
			}, 10000);
		});
	});

	load_remote_style('/static/css/loader.css');
	load_remote_style('/static/css/qunit.css');
	load_remote_style('/static/jquery-ui/css/redmond/jquery-ui.custom.css');
});
