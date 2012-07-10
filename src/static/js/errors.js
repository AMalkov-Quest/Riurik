(function(){ 
	function onErrorHandler(msg, url, line) {
		if( msg == 'Script error.') {
			ok(false, 'See the browser console for details');
		}
		riurik.log("error(" + url + ": " +  line + "): " + msg);
		QUnit.start();
		return true;
	};

	function ajaxError(event, jqXHR, ajaxSettings, exception) { 
		riurik.log("ajax error:" + jqXHR.responseText);
		console.log(jqXHR);
		QUnit.ok(false, exception); 
		QUnit.start();
	}

	function wrapErrorHandler(handler, func) {
		var l = handler;
		if ( typeof handler == 'function' ) {
			return function() {
				l.apply(l, arguments);
				func.apply(func, arguments);	
			};
		}else{
			return function() {
				ok(false, arguments[0]);
				func.apply(func, arguments);	
			};
		}
	};

	$(function() {
		window.onerror = wrapErrorHandler(window.onerror, onErrorHandler);
		$(document).ajaxError( ajaxError );

		QUnit.extend(window, riurik);
	});
})();
