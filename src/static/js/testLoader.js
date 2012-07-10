if ( typeof console == 'undefined' || typeof console.log == 'undefined' ) {
	var console = { log: function(){} };
}

function jQExtend( $ ) {

	$.sleep = function(msec) {
		var dfd = new $.Deferred();
		riurik.log('sleeping for ' + msec + ' msec' );
		setTimeout( function() {
			riurik.log('sleeping for ' + msec + ' msec is resolved');
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
				riurik.log('resolve wait');
				dfd.resolve();
				return;
			}
			time += 100;
			if ( time < timeout ) {
				setTimeout(f, 100)
			} else {
				riurik.log('wait timeout');
				dfd.reject();
			}
		})();

		return dfd.promise(dfd);
	};
	
	$.wait = function( lambda, timeout ){
		var dfd = $.Deferred();
		var timeout = timeout || context.timeout || 10 * 1000;
		riurik.log('waiting for ' + lambda + ' timeout: ' + timeout );
		var time = 0;
		(function f(){
			if ( lambda() === true ) {
				riurik.log('waiting for ' + lambda + ' is resolved');
				dfd.resolve();
				return;
			}
			time += 100;
			if ( time < timeout ) {
				setTimeout(f, 100)
			} else {
				riurik.log('wait timeout for ' + lambda + 'exceeded');
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
				riurik.log('resolve the ' + event_name + ' event wait');
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
				riurik.log('the ' + event_name + ' event wait timeout');
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

		riurik.log(details);

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

jQExtend($);


