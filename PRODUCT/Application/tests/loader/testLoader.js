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
	}
};

function jqextend( $ ) {
	
	$.fn.wait = function( lambda, timeout ){
		var dfd = $.Deferred();
		var timeout = timeout || 10 * 1000; // 10 sec by default
		var time = 0;
		(function f(){
			if ( lambda() === true ) {
				return dfd.resolve();
			}
			time += 1000;
			if ( time < timeout ) {
				setTimeout(f, 1000)
			}
		})();
		$.extend( dfd, {
			wait: $.wait 
		})
		
		return dfd.promise(dfd);
	};
	
	$.fn.areSameAs = function() {
		this.each( function() {
			console.log($(this).text());
		});
	};
	
}

$.wait = function( lambda, timeout ){
    var dfd = $.Deferred();
    var timeout = timeout || 10 * 1000; // 10 sec by default
    var time = 0;
    (function f(){
		if ( lambda() === true ) {
			return dfd.resolve();
		}
		time += 1000;
		if ( time < timeout ) {
			setTimeout(f, 1000)
		}
    })();
    $.extend( dfd, {
		wait: $.wait 
    });
	
    return dfd.promise(dfd);
};

jQuery.fn.extend({ 
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


jQuery.extend(QUnit, {
  equalExt: function(actual, expected, message) {
    QUnit.pushExt(actual, expected, message);
  },
  pushExt: function(actual, expected, message) {
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
      if ( actual[i] === expected[i] ) {
        output += '<td><pre><del> ' + actual[i] + ' </del>,</pre></td>';
      } else {
        result = false;
        output += '<td><pre><ins> ' + actual[i] + ' </ins>,</pre></td>';
      }
    }
    for (i=i; i < actual.length; i++) {
      if ( actual[i] === expected[i] ) {
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


function extractScript(fragment) {
	var pattert = '\\/\\*([\\S\\s]*?)\\*\\/';
	var matchAll = new RegExp(pattert, 'img');
	var matchOne = new RegExp(pattert, 'im');

	return (fragment.toString().match(matchAll) || []).map(function(scriptTag) {
		return (scriptTag.match(matchOne) || ['', ''])[1];
    });
}

function out(message) {
	var regexp = new RegExp('\\n', 'gi');
	html = message.replace(regexp, '<br>');
	
	var frame = window.frames[0];
	frame.document.open();
    frame.document.write(html);
    frame.document.close();
	  
	console.log( message );
	
}

function argumentNames(func) {
	var names = func.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
		.replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
		.replace(/\s+/g, '').split(',');
    
	return names.length == 1 && !names[0] ? [] : names;
}

var ps = {}

ps.exec = function(cmd) {    
	var script = document.createElement('script');    
    
    script.src = "http://" + ps.server + ":35/?cmd=" + escape(cmd) + "&callback=out&_=" + Math.floor( Math.random() * 1000000000 ).toString(); 
    window.document.body.appendChild( script );
    
    return "Running...";
}

ps.eval = function(func) {
	var args = {};
  
	names = argumentNames(func);
	for (var i = 1; i < arguments.length; i++) {
		args[names[i-1]] = arguments[i];
	}
  
	//var re = /(?!\/\*)[^\/\*]*(?=\*\/)/m;
	//script = re.exec(func.toString())[0];
	script = extractScript(func);
	
	var cmd = '';
	for (var i = 0; i < script.length; i++) {
		var line = script[i];
		for (arg in args) {
			var regexp = new RegExp('\\{' + arg + '\\}', 'gi');
			line = line.replace(regexp, args[arg]);
		}
		cmd += line;
	}
	
	ps.exec(cmd);
}

function _NewSPSite(url, name) {
	/*
  	$spSite = Get-SPSite {url};
  	$spWeb = $spSite.OpenWeb();
  	$spWeb.Webs.Add("{name}");
	*/
}