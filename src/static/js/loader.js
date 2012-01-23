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
					console.log(task.url, task.callback);
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
	style.href = make_remote_url(url)+'?_='+Math.random().toString();
	document.body.appendChild( style );
};

$(document).ready(function() {
	loader( load_remote_script )
	.queue('/static/js/jquery.min.js', function(){
		//$('head title').text(test_path);
		document.title = test_path;
	})
	.queue('/static/js/jquery.json.min.js')
	.queue('/static/jquery-ui/js/jquery-ui.custom.min.js')
	//.queue('/static/js/qunit.js')
	.queue('/static/js/testLoader.js')
	.queue(test_location+'/.context.js')
	.then(function(){
		//riurik.load = function(){
		$(document).ready(function() {
			QUnit.config.autostart = false;
			riurik.init();
			$("#tabs").tabs();
			QUnit.riurik.context = clone(context);
			var l = loader( load_remote_script );
			$.each(context.libraries || [],function(i,url){l.queue( '/' + url );});
			if ( /\.js$/.test(test_path) ) {
				l.queue( test_path );
			} else {
				$.each(context.include || [],function(i,url){l.queue( test_location+'/'+url );});
			};
			l.then(function(){
				QUnit.config.autostart = true;
				QUnit.start();
				//QUnit.load();
			});
			setTimeout(function force_qunit_to_start() {
				if( QUnit.config.autostart != true ) {
					QUnit.log('scripts load timeout, forcing tests to start ...');
					//QUnit.start();	
				}	
			}, 10000);
		});
		//};
	});

	load_remote_style('/static/css/loader.css');
	//load_remote_style('/static/css/qunit.css');
	load_remote_style('/static/jquery-ui/css/redmond/jquery-ui.custom.css');
});

