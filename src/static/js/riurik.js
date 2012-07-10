/* Top level namespace for Riurik */
var riurik = {}

/* Namespace for exposing api in the jQuery namespace */
riurik.exports = {}

jQuery.extend(true, riurik, riurikldr);

riurik.trigger = function(event){
	var args = $.makeArray( arguments );
	console.log( 'riurik.trigger', event, 'with args:', args.slice(1) );
	$(riurik).trigger.apply( $(riurik) , args );
};

riurik.on = function( event, handler ){
	console.log( 'riurik.on', event, 'registering', handler );
	$(riurik).on.apply( $( riurik ), $.makeArray(arguments) );
}

riurik.getContext = function() {
	return context;
}

riurik.on( "riurik.engine.loaded", function(){
	/* Wait until DOM.ready and init Ruirik */
	$(function() {
		riurik.init();
	});
});

riurik.on( "riurik.inited", function(){
	riurik.load_tests();
});

riurik.init = function() {
	riurik.trigger( "riurik.initing" );

	$("#tabs").tabs();
	riurik.context = clone(context);

	riurik.trigger( "riurik.inited" );
}

riurik.on("riurik.inited", function(){
	/* context is object that holds environment for tests, so it should be preliminary loaded */
	if (!riurik.getContext()) {
		alert('context should be preliminary loaded');
		return;
	}
});

riurik.on("riurik.error", function(msg, url, line){
	riurik.matchers.fail( msg );
});

riurik.on("riurik.tests.begin", function(){
	riurik.log("Tests begins");
});

riurik.on("riurik.tests.end", function(){
	riurik.log("Tests ends");
});

riurik.on("riurik.tests.suite.start", function(suite){
	riurik.log("Suite '"+suite+"' started");
});

riurik.on("riurik.tests.suite.done", function(suite){
	riurik.log("Suite '"+suite+"' done");
});

riurik.on("riurik.tests.test.start", function(test, suite){
	context = clone(riurik.context)
	riurik.log("Test '"+suite+"."+test+"' started");
});

riurik.on("riurik.tests.test.done", function(test, suite){
	riurik.log("Test '"+suite+"."+test+"' done");
});

riurik.load_tests = function(){
	riurik.trigger( "riurik.tests.loading" );
	var l = riurikldr.loader();
	$.each(context.libraries || [],function(i,url){
		l.queue( '/' + url, function(){ 
			riurik.trigger("riurik.tests.library.loaded", '/'+url);
		});
 	});
	
	if ( /\.js$/.test(riurikldr.args.path) ) {
		l.queue(riurikldr.args.path, function(){ 
			riurik.trigger("riurik.tests.test.loaded", riurikldr.args.path);
		});
	} else {
		if(typeof context.suite_setup != 'undefined'){
			l.queue( riurikldr.args.cwd + '/' + context.suite_setup, function(){ 
				riurik.trigger("riurik.tests.suite_setup.loaded", riurikldr.args.cwd+'/'+context.suite_setup);
			});
		}
		$.each(context.include || [],function(i,url){
			l.queue( riurikldr.args.cwd + '/' + url, function(){
				riurik.trigger("riurik.tests.include.loaded", riurikldr.args.cwd+'/'+url);
			});
		});
	};
	l.then(function(){
		riurik.trigger( "riurik.tests.loaded" );
	});
}

riurik.util = {}

riurik.util.log = function() {
	riurik.log(arguments);
}	

riurik.util.strip = function(s, c) {
	return s.replace(new RegExp('^' + c + '+'), '').replace(new RegExp(c + '+$'), '');
};
	
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

jQuery.extend(riurik.exports, riurik.matchers);

/**
 * Waits is a class to wait for a certain condition to occur before proceeding 
 * further in the test code.
 */
riurik.Waits = function(timeout) { 

	this.timeout = timeout || 1000;	//default timeout in milliseconds to stop waiting
	this.checkEvery = 100;			//check condition every given milliseconds
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
				dfd.resolve.apply(true, args);
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
 * developing phase. So get rid of sleep in a test ASAP.
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
 */
riurik.Waits.prototype.event = function(event_name, target, timeout) {
	this.timeoutMessage = 'wait timeout for the ' + event_name + ' event is exceeded';
	var eventTriggered = false;
	var eventArgs = null;

	target.bind(event_name, function() {
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

riurik.exports.waitFor = new riurik.Waits(context.timeout);

$.extend(riurik.exports);


riurik.__log_storage = new Array(); // storage for riurik.log messages
riurik.__log = function() {
	/* Private log function. 
	 * It gets messages from riurik message storage and put to riurik-console tab
	 * */
	if ( riurik.__log_storage.length > 0 && $('#riurik-console').length > 0 ) {
		while ( riurik.__log_storage.length > 0 ) {
			var o = riurik.__log_storage.shift();
			$('#riurik-console').prepend( o.toString()+'<hr/>' );
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
}

riurik.log('Riurik console: initialized');


