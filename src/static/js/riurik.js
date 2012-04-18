/**
 * Top level namespace for Riurik
 */
var riurik = {}

jQuery.extend(true, riurik, riurikldr);

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
	ok(true, message || '');
};

riurik.matchers.fail = function(message) {
	ok(false, message || '');
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
riurik.Waits.prototype.wait = function(condition, timeout) {
	var dfd = $.Deferred();
	var timeout = timeout || this.timeout;

	riurik.util.log('waiting for ' + condition + ' timeout: ' + timeout );

	(function f(){
		if ( condition() === true ) {
			riurik.util.log('waiting for ' + condition + ' is resolved');
			dfd.resolve();
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

riurik.Waits.prototype.sleep = function(msec) {
	var dfd = new $.Deferred();
	var timeout = msec || this.timeout;
	setTimeout( function() {
		dfd.resolve(dfd);
	}, timeout);
		
	return dfd.promise(dfd);
};

riurik.Waits.prototype.condition = function(condition, timeout) {
	this.timeoutMessage = 'wait timeout for ' + condition + ' is exceeded';
	return this.wait(condition, timeout);
};

riurik.Waits.prototype.then = function(doneCallback, failCallback) {
	
	if(typeof failCallback === 'undefined') {
		var message = this.timeoutMessage;
		failCallback = function() {
			riurik.matchers.fail(message);
			start();
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
