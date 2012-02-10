if ( typeof console == 'undefined' || typeof console.log == 'undefined' ) {
	var console = { log: function(){} };
}

function onErrorHandler(msg, url, line) {
	QUnit.log("error(" + url + ": " +  line + "): " + msg);
	QUnit.start();
	return true;
};

function ajaxError(event, jqXHR, ajaxSettings, exception) { 
	QUnit.log("ajax error:" + jqXHR.responseText);
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

var frame = {

		go: function(path) {
			var dfd = $.Deferred();
			var url = path;
			var regex = new RegExp('^http://[a-zA-Z0-9]');
			if(!regex.test(url)) {
				url = 'http://' + context.host + ':' + context.port + '/' + path;
			}

			if (url.indexOf('?') != -1) {
				url += '&_=' + Math.random().toString();
			}else{
				url += '?_=' + Math.random().toString();
			}
			if( window.frames[0].window ) {
				window.frames[0].window.onerror = function(){};
			}
			$('#frame').attr('src', url);
			$('#frame-url').html('<a href="'+url+'">'+url+'</a>');
			$('#frame').unbind('load');
			$('#frame').load(function() {
				var __frame = window.frames[0];
				__frame.window.onerror = wrapErrorHandler( __frame.window.onerror, onErrorHandler );

				if( ! __frame.window.jQuery ) {
					// inject one
					var d = __frame.document;
					var j = d.createElement('script');
					j.type='text/javascript';
					j.src = /^(.*?)[^\/]*\?/.exec(window.location)[1] + $("head script[src*='jquery.min.js']").attr('src');
					d.head.appendChild(j);
				}

				$.wait( function () { return typeof __frame.window.jQuery != 'undefined'; } , 5*1000)
				.then(function(){
					window._$ = __frame.window.jQuery;
					if( __frame.window.jQuery ) {
						jQExtend(__frame.window.jQuery);
					} else {
						QUnit.ok(false, 'there is no JQuery and it\'s not injected');
					}
					dfd.resolve(__frame.window.jQuery);
				});
			});

			return dfd.promise();
		},

		load: function() {
			var dfd = $.Deferred();

			$('#frame').load(function() {
				dfd.resolve(window.frames[0].window.jQuery);
			});

			return dfd.promise();
		},

		println: function(message) {
			var regexp = new RegExp('\\n', 'gi');
			var html = message.replace(regexp, '<br>')+'<hr/>';
			$('#powershell-console').prepend(html);
			
		},

		console_complete: function(){
			frame.__console_timeout = setTimeout(function(){
				$('#tabs-2-loading').hide();
			}, 500);
			$('#tabs-2').parent().attr('title', '');
		},

		console_working: function(title){
			if ( frame.__console_timeout ) { clearTimeout(frame.__console_timeout) }
			$('#tabs-2').parent().attr('title', title);
			$('#tabs-2-loading').show();
		},

		jQuery: function() {
			return window.frames[0].window.jQuery;
		},
		document: function(){
			return window.frames[0].document;
		},
		window: function(){
			return window.frames[0].window;
		}

};

function jQExtend( $ ) {

	$.sleep = function(msec) {
		var dfd = new $.Deferred();
		QUnit.log('sleeping for ' + msec + ' msec' );
		setTimeout( function() {
			QUnit.log('sleeping for ' + msec + ' msec is resolved');
			dfd.resolve(dfd);
		}, msec);
		
		return dfd.promise(dfd);
	};
	
	$.defer = function( lambda, timeout ){
		var dfd = $.Deferred();
		var timeout = timeout || context.timeout || 10 * 1000; // 10 sec by default
		var time = 0;
		(function f(){
			if ( lambda() === true ) {
				QUnit.log('resolve wait');
				dfd.resolve();
				return;
			}
			time += 100;
			if ( time < timeout ) {
				setTimeout(f, 100)
			} else {
				QUnit.log('wait timeout');
				dfd.reject();
			}
		})();

		return dfd.promise(dfd);
	};
	
	$.wait = function( lambda, timeout ){
		var dfd = $.Deferred();
		var timeout = timeout || context.timeout || 10 * 1000;
		QUnit.log('waiting for ' + lambda + ' timeout: ' + timeout );
		var time = 0;
		(function f(){
			if ( lambda() === true ) {
				QUnit.log('waiting for ' + lambda + ' is resolved');
				dfd.resolve();
				return;
			}
			time += 100;
			if ( time < timeout ) {
				setTimeout(f, 100)
			} else {
				QUnit.log('wait timeout for ' + lambda + 'exceeded');
				dfd.resolve();
			}
		})();

		return dfd.promise(dfd);
	};

	$.wait_event = function( target, event_name, timeout ){
		var dfd = $.Deferred();
		var timeout = timeout || context.timeout || 10 * 1000; // 10 sec by default
		var time = 0;
		var resolved = false;

		target.bind(event_name, function() {
			var args = arguments;	
			resolved = true;
			setTimeout(function(){
				QUnit.log('resolve the ' + event_name + ' event wait');
				dfd.resolve.apply(true, args); 
			}, 1);
		});

		(function f(){
			if ( resolved ) {
				return;
			}
			time += 100;
			if ( time < timeout ) {
				setTimeout(f, 100)
			} else {
				QUnit.log('the ' + event_name + ' event wait timeout');
				dfd.resolve(false);
				return;
			}
		})();

		return dfd.promise();
	};

	$.fn.extend({ 
		sameAs : function(checks) {
			console.log('check', this, arguments)
			var options = {
				checks: checks
			}
			return this.each(function(i,el){
				var value = options['checks'][i];
				if ( value != null ) {
					equals(_$(el).html(), value, 'test');
				};
			});
		},

		strip: function(c) {
			return this.replace(new RegExp('^' + c + '+'), '').replace(new RegExp(c + '+$'), '');
		},
		outerHTML: function(s) {
			return (s) 
			? this.before(s).remove() 
					: $('<p>').append(this.eq(0).clone()).html();
		}
	});
	
	String.prototype.strip = function(c) {
		return this.replace(new RegExp('^' + c + '+'), '').replace(new RegExp(c + '+$'), '');
	};

	String.prototype.format = function(__silent) { 
		/*
			Extending string usage as a template with local variables

			Arguments:
				silent - If true, then no errors throws when variable is undefined

			Example:
				var name = 'Anton', 
				answer = 'fine'; 

				"-Hi, ${name}! How are you?\n-${answer}".format()

			Result is:
				"-Hi, Anton! How are you?
				-fine"
		*/

		var __reg = new RegExp('\\$\\{([^\}]*?)\\}', 'g'); 
		var __match = true, 
			__vars = {}; 
		while ( __match != null ) { 
			__match = __reg.exec(this); 
			if ( __match != null ) {
				__vars[__match[1]] = null; 
			}
		}; 
		for (__name in __vars) { 
			try { 
				__vars[__name] = eval(__name); 
			} catch (e) { 
				if ( __silent !== true ) {
					throw __name+' variable not found in context while  formatting'; 
				} else {
					__vars[__name] = '';	
				} 
			} 
		} 
		var result = this; 
		for ( __name in __vars ) { 
			var old_str = '', 
				new_str = result; 
			while ( old_str != new_str ) { 
				old_str = new_str; 
				new_str = new_str.replace('${'+__name+'}', __vars[__name].toString());
			} 
			result = new_str; 
		} 
		return result.toString(); 
	}
};

jQuery.extend(QUnit, {
	error: function(message) {
		ok(false, message);
	},
	assertFalse: function(actual, message) {
		ok(!actual, message);
	},
	substring: function(actual, expected, message) {
		//replace non-breaking space(&nbsp;) with just space
		actual = actual.replace(/\xA0/g, ' ');
		expected = expected.replace(/\xA0/g, ' ');
		var i = actual.indexOf(expected);
		if( i >= 0 ) {
			actual = actual.substring(i, i + expected.length);
		}
		QUnit.push(i >= 0, actual, expected, message);
	},
	rowEqual: function(actual, expected, message) {

		if( actual )  {
			var actual = jQuery.map(actual, function(e, i) {
				if ( typeof e == 'object' ) return jQuery(e).text();
				return e;
			}).splice(0, expected.length)
		}else{
			var actual = [];
		}	
		QUnit.rowPush(actual, expected, message);
	},
	rowPush: function(actual, expected, message) {
		// 
		var result = true;
		messageI = QUnit.escapeHtml(message) || (result ? "okay" : "failed");
		messageI = '<span class="test-message">' + messageI + "</span>";
		var i = 0;
		var output = messageI + '<table><tr class="test-expected"><th>Expected: </th>';
		for (i=0;i < expected.length; i++) {
			output += '<td><pre><del> ' + expected[i] + ' </del>,</pre></td>';
		}
		for (i=i; i < actual.length; i++) {
			output += '<td><pre><ins>null</ins></pre></td>';
		}
		output += '</tr><tr class="test-diff"><th>Diff:</th>';
		var cols = i;
		for (i=0;i < expected.length; i++) {
			if ( actual[i] == expected[i] ) {
				output += '<td><pre><del> ' + actual[i] + ' </del>,</pre></td>';
			} else {
				result = false;
				output += '<td><pre><ins> ' + actual[i] + ' </ins>,</pre></td>';
			}
		}
		for (i=i; i < actual.length; i++) {
			if ( actual[i] == expected[i] ) {
				output += '<td><pre><del> ' + actual[i] + ' </del>,</pre></td>';
			} else {
				result = false;        
				output += '<td><pre><ins> ' + actual[i] + ' </ins>,</pre></td>';
			}
		}
		output += '</tr></table>';

		var details = {
				result: result,
				message: message,
				actual: actual,
				expected: expected
		};

		if (!result) {
			var source = QUnit.sourceFromStacktrace();
			if (source) {
				details.source = source;
				output += '<table><tr class="test-source"><th>Source: </th><td><pre>' + source +'</pre></td></tr></table>';
			}
		}
		output += "</table>";

		QUnit.log(details);

		QUnit.config.current.assertions.push({
			result: !!result,
			message: output
		});
	},
	escapeHtml: function(s) {
		// simple HTML espacing mechanism
		if (!s) {
			return "";
		}
		s = s + "";
		return s.replace(/[\&"<>\\]/g, function(s) {
			switch(s) {
			case "&": return "&amp;";
			case "\\": return "\\\\";
			case '"': return '\"';
			case "<": return "&lt;";
			case ">": return "&gt;";
			default: return s;
			}
		});
	},
	sourceFromStacktrace : function() {
		// so far supports only Firefox, Chrome and Opera (buggy)
		// could be extended in the future to use something like https://github.com/csnover/TraceKit
		try {
			throw new Error();
		} catch ( e ) {
			if (e.stacktrace) {
				// Opera
				return e.stacktrace.split("\n")[6];
			} else if (e.stack) {
				// Firefox, Chrome
				return e.stack.split("\n")[4];
			}
		}
	}
});

var riurik = {

	sleep: function(msec) {
		var dfd = new $.Deferred();
		setTimeout( function() {
			dfd.resolve(dfd);
		}, msec);
		
		return dfd.promise(dfd);
	},

	strip: function(s, c) {
		return s.replace(new RegExp('^' + c + '+'), '').replace(new RegExp(c + '+$'), '');
	},
	
	load_js: function(jsfile_src) {
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
	},

	pass: function() {
		ok(true)
	}
};

var contexter = {

	webAppUrl: function(host, port) {
		return 'http://' + host + ':' + port;
	},

	SCUrl: function(host, port, title) {
		var waUrl = contexter.webAppUrl(host, port);
		return waUrl + '/sites/' + title;
	},

	full_url: function(url) {
		return context.url + '/' + riurik.strip(url, '/');
	},

	URL: function(context, path) {
		return 'http://' + context.host + ':' + context.port + '/' + path;
	}
};

function clone(o) {
	if(!o || 'object' !== typeof o)  {
		return o;
	}
 
	var c = 'function' === typeof o.pop ? [] : {};
	var p, v;
	for(p in o) {
		if(o.hasOwnProperty(p)) {
			v = o[p];
			if(v && 'object' === typeof v) {
				c[p] = clone(v);
			} else {
				c[p] = v;
			}
		}
	}
	
	return c;
}

riurik.init = function() {
	QUnit.__tests_result_storage = new Array();
	QUnit.riurik = {};
	QUnit.riurik.current = { 'module': {}, 'test': '' };
	QUnit.riurik.status = 'started';
	//QUnit.riurik.context = clone(context)
}

QUnit.begin = function() {
	QUnit.config.autostart = false;
	QUnit.config.reorder = false;
	QUnit.log('tests are begun');
	riurik.init();
	riurik.load();
}

QUnit.done = function(result) {
	QUnit.log('tests are done');
	QUnit.riurik.status = 'done';
	if( result.total == 0 ) {
		document.title = [
			("\u2716"),
			document.title.replace(/^[\u2714\u2716] /i, "")
		].join(" ");
	}
}

QUnit.moduleStart = function(module) {
	QUnit.riurik.current.module.name = module.name;
	QUnit.riurik.current.module.status = 'started';
	QUnit.riurik.current.module.started = new Date();
	QUnit.log('the "' + module.name + '" module is started ', QUnit.riurik.current.module.started);
	context = clone(QUnit.riurik.context)
}

QUnit.moduleDone = function(module) {
	QUnit.log('the "' + module.name + '" module is done');
	QUnit.riurik.current.module.status = 'done';
	QUnit.riurik.current.module.finished = new Date();

	function getTestResultDivs(moduleName) {
		var html = '<html><head><link rel="stylesheet" type="text/css" href="qunit.css"></head><body>'
			html += '<ol class="qunit-tests" id="qunit-tests">';
		$('#qunit-tests li').each(function(i, el){
			if ( $('.module-name',el).text() == moduleName ) {
				html += $(el).outerHTML();
			};
		});
		html += '</ol></body></html>';
		html = html.replace(new RegExp('display: none', 'i'), 'display: block');
		//html = escape(html)
		return html;
	};

	var time = (QUnit.riurik.current.module.finished - QUnit.riurik.current.module.started)/1000;
	if(isNaN(time)) {
		time = 0;
	}
	var module_results = {
			name: module.name,
			failed: module.failed,
			passed: module.passed,
			total: module.total,
			duration: time,
			results: getTestResultDivs(module.name)
	}
	QUnit.__tests_result_storage.push($.toJSON(module_results));
}

QUnit.testStart = function(test) {
	QUnit.log('the "' + test.name + '" test is started');
	QUnit.riurik.current.test = test.name;
	console.log('Test start: ', test);
}

QUnit.testDone = function(test) {
	QUnit.log('the "' + test.name + '" test is done');
	console.log('Test done: ', test);
}

QUnit.get_results = function() {
	if ( QUnit.__tests_result_storage != 'undefined' && QUnit.__tests_result_storage.length > 0 ) {
		return QUnit.__tests_result_storage.shift();
	}else{
		return '';
	}
};

QUnit._get_results_view = function() {
	var html = '<html><head><link rel="stylesheet" type="text/css" href="qunit.css"></head><body>'
		html += '<ol class="qunit-tests" id="qunit-tests">';
	$('#qunit-tests').each(function(i, el){
		var ohtml = $(el).outerHTML().replace(new RegExp('display: none', 'gi'), 'display: block');
		html += ohtml;
	});
	html += '</ol></body></html>';
	return html;
};

QUnit.get_results_view = function() {
	var html = '<html><head><link rel="stylesheet" type="text/css" href="qunit.css"></head><body>'
		html += '<ol class="qunit-tests" id="qunit-tests">';
	html += $('#qunit-tests').html().replace(new RegExp('display: none', 'gi'), 'display: block');
	html += '</ol></body></html>';
	return html;
};

QUnit.get_qunit_console = function() {
	return (function getConsoleDivs() {
		var html = '<html><head><title>QUnit console</title></head><body>'
			html += $('#qunit-console').html();
		html += '</body></html>';
		return html;
	})();
};

QUnit.get_tools_console = function() {
	return (function getConsoleDivs() {
		var html = '<html><head><title>PowerShell console</title></head><body>'
			html += $('#powershell-console').html();
		html += '</body></html>';
		return html;
	})();
};

QUnit.getCSS = function(){
	if ( QUnit.__css ) return QUnit.__css;
	var result = '';
	$.ajax('/testsrc/loader/qunit.css', {
		success: function(data){
			result = data;
		},
		async: false,
		cache: true
	});
	QUnit.__css = result;
	return result;
};

QUnit.__log_storage = new Array(); // storage for QUnit.log messages
QUnit.__log = function() {
	/* Private log function. 
	 * It gets messages from QUnit message storage and put to qunit-console tab
	 * */
	if ( QUnit.__log_storage.length > 0 && $('#qunit-console').length > 0 ) {
		while ( QUnit.__log_storage.length > 0 ) {
			var o = QUnit.__log_storage.shift();
			$('#qunit-console').prepend( o.toString()+'<hr/>' );
		}
	}
};
setInterval( QUnit.__log, 500 );
QUnit.log = function(){
	/* QUnit.log interface
	 * Put message into QUnit message storage
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
			args.push('QUnit.log raised a error during formatting: ' + ex.toString());
		}
		args.push(o);
	});
	QUnit.__log_storage.push(args);
}

QUnit.log('QUnit console: initialized');

QUnit.config.reorder = false;

QUnit.setup = function(callback) {
	QUnit.test('setup', null, callback, false);
}

QUnit.asyncSetup = function(callback) {
	QUnit.test('setup', null, callback, true);
}

QUnit.teardown = function(callback) {
	QUnit.test('teardown', null, callback, false);
}

QUnit.asyncTeardown = function(callback) {
	QUnit.test('teardown', null, callback, true);
}

jQExtend($);

$(document).ready(function() {
	window.onerror = wrapErrorHandler(window.onerror, onErrorHandler);
	$(document).ajaxError( ajaxError );

	QUnit.extend(window, riurik);
});
