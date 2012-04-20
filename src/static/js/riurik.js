/**
 * Top level namespace for Riurik
 */
var riurik = {}

jQuery.extend(true, riurik, riurikldr);


/**
 * Riurik relies on QUnit, so it should be preliminary loaded
 */
if (!QUnit) {
	alert('QUnit should be preliminary loaded');
}

riurik.exports = {}

riurik.util = {}

riurik.util.log = function() {
	QUnit.log(arguments);
}	

riurik.util.strip = function(s, c) {
	return s.replace(new RegExp('^' + c + '+'), '').replace(new RegExp(c + '+$'), '');
};
	
riurik.util.load_js = function(jsfile_src) {
	var scr = jsfile_src;
	QUnit.log('Adding script '+jsfile_src+' to queue to load');
	var dfd = new $.Deferred();
		
	var script = document.createElement( 'script' );
	script.type = 'text/javascript';
	script.src = jsfile_src;
		
	var onload = function() {
		QUnit.log(scr +' is loaded.');
		dfd.resolve(dfd);
	};
	
	if( $.browser.msie ) {
		script.onreadystatechange = function() {
			QUnit.log('IE readyState is ' + script.readyState)
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
	QUnit.ok(true, message || '');
};

riurik.matchers.fail = function(message) {
	QUnit.ok(false, message || '');
};

riurik.matchers.substring = function(actual, expected, message) {
	//replace non-breaking space(&nbsp;) with just space
	actual = actual.replace(/\xA0/g, ' ');
	expected = expected.replace(/\xA0/g, ' ');

	var i = actual.indexOf(expected);
	if( i >= 0 ) {
		actual = actual.substring(i, i + expected.length);
	}

	QUnit.push(i >= 0, actual, expected, message);
};

jQuery.extend(riurik.exports, riurik.matchers);

/**
 * Waits is a class to wait for a certain condition to occur before proceeding 
 * further in the test code.
 */
riurik.Waits = function() { 

	this.timeout = 1000;	//default timeout in milliseconds to stop waiting
	this.checkEvery = 100;	//check condition every given milliseconds
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

	(function f(){
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
		timeout -= 100;
		if ( timeout > 0 ) {
			setTimeout(f, this.checkEvery)
		} else {
			riurik.util.log('wait timeout for ' + condition + ' is exceeded');
			dfd.reject();
		}
	})();

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
			QUnit.start();
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

riurik.exports.wait = new riurik.Waits();
