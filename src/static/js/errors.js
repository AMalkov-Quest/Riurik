(function(){ 
	function onErrorHandler(msg, url, line) {
		riurik.log("error(" + url + ": " +  line + "): " + msg);
		riurik.trigger( "riurik.error", msg, url, line );
		return true;
	};

	function ajaxError(event, jqXHR, ajaxSettings, exception) { 
		riurik.log("ajax error:" + jqXHR.responseText);
		riurik.log(jqXHR);
		onErrorHandler( exception, ajaxSettings.url, 0 )
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
				func.apply(func, arguments);	
			};
		}
	};

	riurik.ajaxError = ajaxError;
	riurik.wrapErrorHandler = wrapErrorHandler;
	riurik.onErrorHandler = onErrorHandler;
	$(function() {
		window.onerror = wrapErrorHandler(window.onerror, onErrorHandler);
		$(document).ajaxError( riurik.ajaxError );
	});
})();
