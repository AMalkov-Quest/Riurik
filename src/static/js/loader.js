var loader = function( load_script_fn ){
	var queue = [];
	var callbacks = [];
	var running = false;
	var execute = function(){
		running = true;
		if ( queue.length > 0 ) {
			var task = queue.shift();
			load_script_fn( 
				task.url, 
				function(){
					if ( typeof task.callback == 'function' ) 
						task.callback;
					setTimeout( execute, 0 );
				}
			);
			return;	
		} 
		if ( callbacks.length > 0 ) {
			var callback = callback.shift();
			callback();	
			setTimeout( execute, 0 );
			return;
		}
		running = false;
	};
	this.queue = function( url, step_callback ){
		if ( typeof step_callback != 'function' ) step_callback = function(){};
		queue.push( { 'url': url, 'callback': step_callback );
		if ( ! running ) execute();
		return this;
	};

	this.then = function( callback ) {
		callbacks.push( callback );
		if ( ! running ) execute();
		return this;
	};

	return this;
};
var load_remote_style = function(url){
	var style = document.createElement( 'style' );
	style.type = 'text/css';
	style.rel = 'stylesheet';
	style.src = url+'?_='+Math.random().toString();
	document.head.appendChild( style );
};

loader( load_remote_script )
	.queue('/static/js/jquery.min.js')
	.queue('/static/jqueryui/js/jquery-ui.custom.min.js',function(){$("#tabs").tabs();})
	.queue('/static/js/qunit.js')
	.queue('/static/js/testLoader.js')
	.queue(context_path)
	.then(function(){
		QUnit.riurik.context = clone(context);
		QUnit.config.autostart = false;
		var l = loader( load_remote_script );
		$.each( 
			(context.libraries || []).concat(context.include || []), 
			function(i, url){
				l.queue( url );		
			}
		);
		l.then(function(){
			QUnit.config.autostart = true;
			QUnit.start();
		});
		setTimeout(function force_qunit_to_start() {
			if( QUnit.config.autostart != true ) {
				QUnit.log('scripts load timeout, forcing tests to start ...');
				QUnit.start();	
			}	
		}, 10000);
	});
load_remote_style(make_remote_url('/static/css/loader.css'));
load_remote_style(make_remote_url('/static/css/qunit.css'));
load_remote_style(make_remote_url('/static/queryui/redmond/jquery-ui-custom.css'));

