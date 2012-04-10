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
