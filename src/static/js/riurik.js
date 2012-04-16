/**
 * Top level namespace for Riurik
 */
if( typeof riurik == 'undefined' ) {
	var riurik = {}
}

riurik.sleep = function(msec) {
	var dfd = new $.Deferred();
	setTimeout( function() {
		dfd.resolve(dfd);
	}, msec);
		
	return dfd.promise(dfd);
};

riurik.strip = function(s, c) {
	return s.replace(new RegExp('^' + c + '+'), '').replace(new RegExp(c + '+$'), '');
};
	
riurik.load_js = function(jsfile_src) {
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

riurik.pass = function(message) {
	ok(true, message || '');
};

riurik.fail = function(message) {
	console.log('!!!!!!!!!!');
	ok(false, message || '');
};

riurik.util = {}

riurik.util.log = function() {
	QUnit.log(arguments);
}	

/**
 * Waits is a class to wait for a certain condition to occur before proceeding 
 * further in the test code.
 */
riurik.Waits = function() { 

	this.timeout = 10 * 1000;	//default timeout in milliseconds to stop waiting
	this.checkEvery = 100;		//check condition every given milliseconds
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
	var timeout = timeout || context.timeout || this.timeout;

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

riurik.Waits.prototype.condition = function(condition, timeout) {
	this.timeoutMessage = 'wait timeout for ' + condition + ' is exceeded';
	return this.wait(condition, timeout);
};

riurik.Waits.prototype.then = function(doneCallback, failCallback) {
	
	if(typeof failCallback === 'undefined') {
		var message = this.timeoutMessage;
		failCallback = function() {
			riurik.fail(message);
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

riurik.wait = new riurik.Waits();
