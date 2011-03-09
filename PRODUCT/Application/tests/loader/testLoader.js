if ( typeof console == 'undefined' || typeof console.log == 'undefined' ) {
	alert('no console.log')
	var console = { log: function(){} };
}
var _CONSOLE = console;
var _CONSOLE_LOG = console.log;
var _CONSOLE_LOG_QUEUE = new Array();
var _CONSOLE_LOG_NEW = function() {
	var a = new Array();
	for ( i in arguments ) {
		a.push(arguments[i]);
	}
	var html = a.join(', ') + '<hr/>';
	if ( typeof _CONSOLE_LOG_QUEUE != 'undefined' ) {
		try {
			_CONSOLE_LOG_QUEUE.push(html);
			//_CONSOLE_LOG.apply(_CONSOLE, ['quueue not undefined']);
		} catch (ex) {
			//_CONSOLE_LOG.apply(_CONSOLE, ['queue undefind'])
			$('#javascript-console').append(html);
		}
	} else {
		//_CONSOLE_LOG.apply(_CONSOLE, ['queue undefind'])
		$('#javascript-console').append(html);
	}
	_CONSOLE_LOG.apply(_CONSOLE, a);
}
console.log = _CONSOLE_LOG_NEW;
$(document).ready(function(){
	console.log = _CONSOLE_LOG_NEW;
	//_CONSOLE_LOG.apply(_CONSOLE, _CONSOLE_LOG_QUEUE);
	for ( i in _CONSOLE_LOG_QUEUE ) {
		var html  = _CONSOLE_LOG_QUEUE[i];
		$('#javascript-console').append(html);
	}
	_CONSOLE_LOG_QUEUE = null;
	//_CONSOLE_LOG.apply(_CONSOLE, ['queue loaded'])
});

var frame = {
	
	go: function(url) {
	  var dfd = $.Deferred();
	  
	  $('#frame').attr('src', url);
	  $('#frame').load(function() {
			jqextend(window.frames[0].window.jQuery);
			dfd.resolve(window.frames[0].window.jQuery);
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
		$('#powershell-console').append(html);
		console.log(message);
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

var suite = {

	setup: function() {},
	teardown: function() {}

}

function jqextend( $ ) {
  var jq = $;	
  $.wait = function( lambda, timeout ){
    var dfd = jq.Deferred();
    var timeout = timeout || 10 * 1000; // 10 sec by default
    var time = 0;
    (function f(){
		if ( lambda() === true ) {
			console.log('resolve wait')
			return dfd.resolve();
		}
		time += 100;
		if ( time < timeout ) {
			setTimeout(f, 100)
		} else {
			console.log('wait timeout');
		}
    })();
    jq.extend( dfd, {
		wait: jq.wait 
    });
	
    return dfd.promise(dfd);
  };
  $.seq = function() {
    // Execute a sequense of functions supplied by arguments and wait until them are not finished.
    // One function executes at time;
    //
    var dfd = new $.Deferred();
    var funcs = new Array();
    $( arguments ).each(function(i,e){ funcs.push(e); });
    var busy = false;
    var a = null;
    (function f(){
        if ( funcs.length == 0 && ! busy ) {
            console.log('all done',dfd)
            return dfd.resolve();
        }
        if ( ! busy ) {
            a = funcs.shift();
            console.log('a', a, busy, funcs)
            var k = function(){
                busy = true;
                console.log('stack busy now');
                console.log('calling a function');
                var ret = null;
                if ( typeof a == "function" ) {
                    ret = a();
                } else {
                    ret = a;
                }
                if ( typeof ret != "undefined" && typeof ret.then == "function" ) {
                    console.log( 'function returned a deffered object. waiting for resolving.' , ret)
                    ret.then(function(){
                        console.log( 'function resoled a deferred object')
                        busy = false;
                        console.log('stack is free now (deferred)')
                    });
                } else {
                    busy = false;
					console.log('function call ended, no deferred')
                    console.log('stack is free now')
                }
            };
            k();
        };
        setTimeout(f, 100);
    })();
    return dfd.promise(dfd);
  };
  $.fn.extend({ 
    sameAs : function(checks){
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
     }
  });

};

jQuery.extend(QUnit, {
  rowEqual: function(actual, expected, message) {
    QUnit.rowPush(
		actual.map(function(i, e) {
			if ( typeof e == 'object' ) return jQuery(e).text();
			return i;
		}).splice(0, expected.length), 
		expected, 
		message
	);
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

function PowerShell(server) {
	
	this.server = server;
	
	this.exec = function(name, args, cmd) {
		var dfd = $.Deferred();
		var script = document.createElement('script');
		
		frame.println('queue up ' + name + '( ' + args + ' )\n');
		
		var random = Math.floor( Math.random() * 1000000000 ).toString();
		var callback = name + random;
		
		window[callback] = function(result) {
			frame.println(name + '( ' + args + ' ) is done whis result:\n');
			frame.println(result?result:'OK\n');
			dfd.resolve();
		};
		
		//script.src = "http://" + this.server + ":35/?cmd=" + escape(cmd) + "&callback=" + callback;
		script.src = "http://" + this.server + ":35/?cmd=" + escape(cmd) + "&callback=" + callback + "&_=" + Math.floor( Math.random() * 1000000000 ).toString();
		window.document.body.appendChild( script );
	  
		return dfd.promise();
	};
	
	this.functionName = function(func) {
		return func.toString().match(/^[\s\(]*function\s*([^(]*?)\([^)]*?\)/)[1];
	};
	
	this.argumentNames = function(func) {
		var names = func.toString().match(/^[\s\(]*function[^(]*\(([^)]*?)\)/)[1]
			.replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
			.replace(/\s+/g, '').split(',');
		
		return names.length == 1 && !names[0] ? [] : names;
	};
	
	this.extractScript = function(fragment) {
		var pattert = '\\/\\*([\\S\\s]*?)\\*\\/';
		var matchAll = new RegExp(pattert, 'img');
		var matchOne = new RegExp(pattert, 'im');

		return (fragment.toString().match(matchAll) || []).map(function(scriptTag) {
			return (scriptTag.match(matchOne) || ['', ''])[1];
		});
	};
	
	this.invoke = function(func) {
		var args = {};
	  
		var fnName = this.functionName(func);
		var names = this.argumentNames(func);
		for (var i = 1; i < arguments.length; i++) {
			args[names[i-1]] = arguments[i];
		}
	  
		var script = this.extractScript(func);
		
		var cmd = '';
		for (var i = 0; i < script.length; i++) {
			var line = script[i];
			for (arg in args) {
				var regexp = new RegExp('\\{' + arg + '\\}', 'gi');
				line = line.replace(regexp, args[arg]);
			}
			cmd += line;
		}
		
		return this.exec(fnName, $(arguments).splice(1), cmd);
	};

    this.invokeLambda = function(){
		var t = this; var a = arguments;
        return function() { return t.invoke.apply(t, a); };
    };
}

var contexter = {
	
	webAppUrl: function(host, port) {
		return 'http://' + host + ':' + port;
	},

	SCUrl: function(host, port, title) {
		var waUrl = contexter.webAppUrl(host, port);
		return waUrl + '/sites/' + title;
	},
	
	full_url: function(url) {
		return context.url + url;
	}
};

jqextend($);
