/* Top level namespace for Riurik
   should be defined in testsLoader.html
*/
//var riurik = {}
window.$R = riurik;

/* Namespace for exposing api in the jQuery namespace */
riurik.exports = {}

riurik.trigger = function(event){
	var args = $.makeArray( arguments ).slice(1);
	//console.log( 'riurik.trigger', event, 'with args:', args );
	$(riurik).trigger.apply( $(riurik) , [event, args] );
};

riurik.on = function( event, handler ){
	//console.log( 'riurik.on', event, 'registering', handler );
	$(riurik).on.apply( $( riurik ), $.makeArray(arguments) );
}

riurik.on( "riurik.engine.loaded", function(){
	/* Wait until DOM.ready and init Ruirik */
	$(function() {
		riurik.init();
	});
});

riurik.init = function() {
	riurik.trigger( "riurik.initing" );

	//to simplify the context access from tests
	window.$context = clone(riurik.context);
	riurik.onerror();
	riurik.trigger( "riurik.inited" );
}

riurik.on("riurik.inited", function(){
	riurik.load_tests();
});

riurik.on("riurik.error", function(e, msg, url, line){
	riurik.matchers.fail( msg );
});

riurik.on("riurik.tests.begin", function(){
	riurik.log('tests are begun');
});

riurik.on("riurik.tests.end", function(){
	riurik.log('tests are done');
	return true;
});

riurik.on("riurik.tests.suite.start", function(e, suite){
	riurik.log("Suite '"+suite+"' started");
});

riurik.on("riurik.tests.suite.done", function(e, suite){
	riurik.log("Suite '"+suite+"' done");
});

riurik.on("riurik.tests.test.start", function(e, test){
	riurik.log("Test '"+test+"' started");
});

riurik.on("riurik.tests.test.done", function(e, test){
	riurik.log("Test '"+test+"' done");
});

riurik.load_tests = function(){
	riurik.trigger( "riurik.tests.loading" );
	console.log( "riurik.tests.loading" );
	if ( typeof riurik.context == 'undefined' ) {
		alert('Riurik context should be preliminary loaded');
		return;
	}

	var l = riurik.loader();
	$.each( riurik.context.libraries || [], function(i,url){
		l.queue( '/' + url, function(){ 
			riurik.trigger("riurik.tests.library.loaded", '/'+url);
		});
 	});
	
	if ( /\.js$/.test(riurik.args.path) ) {
		l.queue(riurik.args.path, function(){ 
			riurik.trigger("riurik.tests.test.loaded", riurik.args.path);
		});
	} else {
		if(typeof riurik.context.suite_setup != 'undefined'){
			l.queue( riurik.args.cwd + '/' + riurik.context.suite_setup, function(){ 
				riurik.trigger("riurik.tests.suite_setup.loaded", riurik.args.cwd+'/'+riurik.context.suite_setup);
			});
		}
		$.each(riurik.context.include || [],function(i,url){
			l.queue( riurik.args.cwd + '/' + url, function(){
				riurik.trigger("riurik.tests.include.loaded", riurik.args.cwd+'/'+url);
			});
		});
	};
	l.then(function(){
		console.log('tests load time:');
		console.log((new Date() - riurik.start)/1000);

		riurik.engine.run_tests();
	});
}

riurik.util = {}

riurik.util.log = function() {
	riurik.log(arguments);
}	

riurik.util.strip = function(s, c) {
	return s.replace(new RegExp('^' + c + '+'), '').replace(new RegExp(c + '+$'), '');
};

riurik.util.URI = function(env, path) {
	return 'http://' + env.host + ':' + env.port + '/' + path;
}
	
riurik.util.load_js = function(jsfile_src) {
	var scr = jsfile_src;
	riurik.log('Adding script '+jsfile_src+' to queue to load');
	var dfd = new $.Deferred();
		
	var script = document.createElement( 'script' );
	script.type = 'text/javascript';
	script.src = jsfile_src;
		
	var onload = function() {
		riurik.log(scr +' is loaded.');
		dfd.resolve(dfd);
	};
	
	if( $.browser.msie ) {
		script.onreadystatechange = function() {
			riurik.log('IE readyState is ' + script.readyState)
			if (script.readyState == 'loaded' ||
				script.readyState == 'complete') {
				script.onreadystatechange = null;
				onload();
			};
		}
	}else{
		script.onload = onload;
	}
	
	document.body.appendChild( script );
	
	return dfd.promise(dfd);
};

jQuery.extend(riurik.exports, riurik.util);

riurik.matchers = {}

riurik.matchers.pass = function(message) {
	alert('Test Engine pass is not implemented');
};

riurik.matchers.fail = function(message) {
	alert('Test Engine fail is not implemented');
};

riurik.matchers.substring = function(actual, expected, message) {
	alert('Test Engine substring is not implemented');
};

//this should be done in the engine
//jQuery.extend(riurik.exports, riurik.matchers);

/**
 * Waits is a class to wait for a certain condition to occur before proceeding 
 * further in the test code.
 */
riurik.Waits = function(timeout, checkEvery) { 

	this.timeout = timeout || 1000; //default timeout in milliseconds to stop waiting
	this.checkEvery = checkEvery || 100; //check condition every given milliseconds
};

riurik.Waits.prototype.checkEvery = function(time) { 

	this.checkEvery = time;			//check condition every given milliseconds
	return this;
};

/**
 * Main wait method that accepts different coditions to occure.
 *
 * Note: Do <b>not</b> call wait directly - use specialized methods, such as
 * condition, event, etc.
 *
 * @param {Function} condition to occur before proceeding to the next block
 * @param {Number} timeout milliseconds to wait
 */
riurik.Waits.prototype.wait = function(condition, timeout, getArgs) {
	var dfd = $.Deferred();
	var timeout = timeout || this.timeout;

	riurik.util.log('waiting for ' + condition + ' timeout: ' + timeout );

	(function check(checkEvery){
		if ( condition() === true ) {
			riurik.util.log('waiting for ' + condition + ' is resolved');
			if(getArgs) {
				var args = getArgs();
				dfd.resolve.apply(this, $.makeArray(args));
			}else{
				dfd.resolve();
			}
			return;
		}
		
		if ( timeout > 0 ) {
			timeout -= checkEvery;
			setTimeout(function() { check(checkEvery) }, checkEvery)
		} else {
			riurik.util.log('wait timeout for ' + condition + ' is exceeded');
			dfd.reject();
		}
	})(this.checkEvery);

	this.promise = dfd.promise(dfd);
	return this;
};

/**
 * Delays execution for give period of time 
 *
 * Note: <b>It's bad idea</b> to use sleep in tests. But it can be very usefull during the
 * developing phase. So just get rid of the sleep calls in your tests ASAP.
 *
 * @param {Number} milliseconds to delay
 */
riurik.Waits.prototype.sleep = function(msec) {
	var dfd = new $.Deferred();
	var timeout = msec || this.timeout;
	setTimeout( function() {
		dfd.resolve(dfd);
	}, timeout);
		
	return dfd.promise(dfd);
};

/**
 * Waits for given condition to occure
 *
 * @example
 * wait.condition((-> $(element).length > 10), 1000).then ->
 *
 * @param {Function} condition to occur before proceeding to the next block
 * @param {Number} timeout milliseconds to wait
 */
riurik.Waits.prototype.condition = function(condition, timeout) {
	this.timeoutMessage = 'wait timeout for ' + condition + ' is exceeded';
	return this.wait(condition, timeout);
};
	
/**
 * Waits for given event to occure
 *
 * @example 
 * wait.event('eventName', $(window.document), 1000).then ->
 *
 * @param {String} name of event to occur before proceeding to the next block
 * @param {jQuery Object} element that the event is bound on
 * @param {Number} timeout milliseconds to wait
 * 
 * Note: as far as in tests it's necessary to wait for events those happen inside
 * a system under test, particularly for riurik in most cases element that the event
 * is bound on is $(frame.window()) 
 */
riurik.Waits.prototype.event = function(event_name, target, timeout) {
	this.timeoutMessage = 'wait timeout for the ' + event_name + ' event is exceeded';
	var eventTriggered = false;
	var eventArgs = null;

	target.on(event_name, function() {
		eventArgs = arguments;
		eventTriggered = true;
	});

	var condition = function() {
		return eventTriggered;
	};

	var getEventArgs = function() {
		return eventArgs;
	};

	return this.wait(condition, timeout, getEventArgs);
};

riurik.Waits.prototype.frame = function(timeout) {
	this.timeoutMessage = 'wait timeout for the frame loading is exceeded';
	var frameLoaded = false;
	var frameJQuery = null;

	$('#frame').unbind('load');
	$('#frame').load(function() {
		frame.init(function(_$) {
			frameJQuery = _$;
			frameLoaded = true;
		});
	});

	var condition = function() {
		return frameLoaded;
	};
	
	var getFrameJQuery = function() {
		return frameJQuery;
	};

	return this.wait(condition, timeout, getFrameJQuery);
};

riurik.Waits.prototype.then = function(doneCallback, failCallback) {
	
	if(typeof failCallback === 'undefined') {
		var message = this.timeoutMessage;
		failCallback = function() {
			riurik.matchers.fail(message);
		};
	}
	return this.promise.then(doneCallback, failCallback);
};

riurik.Waits.prototype.done = function(callback) {
	return this.promise.done(callback);
};

riurik.Waits.prototype.fail = function(callback) {
	return this.promise.fail(callback);
};

/*
 * Instantiate the Waits class and make it visible in the global namespace.
 * The context.timeout value is used in order to provide generic way to
 * manage timeouts in tests.
 * */
riurik.exports.waitFor = new riurik.Waits(riurik.context.timeout, riurik.context.check_every);

//this should be done in appropriate engine
//$.extend(riurik.exports);


riurik.__log_storage = new Array(); // storage for riurik.log messages
riurik.__log = function() {
	/* Private log function. 
	 * It gets messages from riurik message storage and put to riurik-console tab
	 * */
	if ( riurik.__log_storage.length > 0 && $('#riurik-console').length > 0 ) {
		while ( riurik.__log_storage.length > 0 ) {
			var o = riurik.__log_storage.shift();
			$('#riurik-console').prepend( o.toString()+'<hr/>' );
            $('#status-text').text( o.toString() );
		}
	}
};
setInterval( riurik.__log, 500 );
riurik.log = function(){
	/* riurik.log interface
	 * Put message into Riurik message storage
	 * */
	var args = new Array();
	$( arguments ).each(function(i, e){
		var o = e;
		try {
			if ( typeof e == 'object' ) {
				o = $.toJSON(e);
			}
			if ( typeof e == 'function' ) {
				o = e.toString();
			}
		} catch (ex) {
			o = e.toString();
			args.push('Riurik.log raised a error during formatting: ' + ex.toString());
		}
		args.push(o);
	});
	riurik.__log_storage.push(args);
};
