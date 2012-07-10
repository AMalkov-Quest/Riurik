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

riurik.pass = function() {
	ok(true)
};

riurik.fail = function() {
	ok(false)
};


riurik.__log_storage = new Array(); // storage for riurik.log messages
riurik.__log = function() {
	/* Private log function. 
	 * It gets messages from riurik message storage and put to riurik-console tab
	 * */
	if ( riurik.__log_storage.length > 0 && $('#qunit-console').length > 0 ) {
		while ( riurik.__log_storage.length > 0 ) {
			var o = riurik.__log_storage.shift();
			$('#qunit-console').prepend( o.toString()+'<hr/>' );
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


