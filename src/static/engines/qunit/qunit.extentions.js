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
	url = make_remote_url('/static/css/qunit.css');
	$.ajax(url, {
		success: function(data){
			result = data;
		},
		async: false,
		cache: true
	});
	QUnit.__css = result;
	return result;
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

