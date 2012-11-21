riurik.onErrorHandler = function(msg, url, line) {
	riurik.log("error(" + url + ": " +  line + "): " + msg);
	riurik.trigger( "riurik.error", msg, url, line );
	return true;
};

riurik.ajaxError = function(event, jqXHR, ajaxSettings, exception) { 
	riurik.log("ajax error:" + jqXHR.responseText);
	riurik.log(jqXHR);
	riurik.onErrorHandler( exception, ajaxSettings.url, 0 )
};

riurik.wrapErrorHandler = function(handler, func) {
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

riurik.onerror = function() {
	window.onerror = riurik.onErrorHandler;
	$(document).ajaxError( riurik.ajaxError );
};
