if ( typeof console == 'undefined' || typeof console.log == 'undefined' ) {
	var console = { log: function(){} };
}

riurikldr.LoadScript = function(scriptName, callback, target){
	if( typeof target == 'undefined') {
		target = document;
	}
	var url = riurikldr.BuildHttpUri( scriptName );
	var script = target.createElement( 'script' );
	script.type = 'text/javascript';
	script.src = url + '?_=' + Math.random().toString();
	var timeout = setTimeout(function(){
		onload(true);
	}, 10000);
	var onload = function(failed) {
		if ( typeof callback == 'function' ) callback();
		callback = function(){};
		clearTimeout(timeout);
	};
	if ((typeof jQuery != 'undefined' && jQuery.browser.msie)||(/msie/i.exec(navigator.userAgent))) {
		script.onreadystatechange = function() {
			if (script.readyState == 'loaded' || script.readyState == 'complete') {
				script.onreadystatechange = null;
				onload();
			};
		};
	}else{
		script.onload = onload;
	}
	//target.head.appendChild( script );
	target.body.appendChild( script );
	//$('head').append( $(script) );
};

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

riurikldr.loader().queue(riurikldr.args.cwd + '/.context.js', function(){
	riurikldr.start = new Date();
	document.title = /\/([^\/]*)\/*$/.exec(riurikldr.args.path)[1];
	var engine = riurikldr.TryGetArgument('engine') || 'qunit';

	riurikldr.loader()
	.queue('/static/'+engine+'.testLoader.js')
	.then(function() {
		riurik.engine.init(function(){
			riurik.trigger( "riurik.engine.loaded" );
			$('#frame-container').show();
			$('#gif-loader').hide();

			console.log('riurik load time:');
			console.log((new Date() - riurikldr.start)/1000);
		});
	});

	load_remote_style('/static/css/loader.css');
});

