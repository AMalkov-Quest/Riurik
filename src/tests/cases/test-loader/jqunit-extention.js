var url = 'http://spb0281:8000/'; 

$.extend(QUnit, {
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

asyncTest('qunit extension', function() {
  $.when( frame.go(url) ).then(function(_$) {

    
    equal(1, 1, 'test 1');
    equal(2, 1, 'test 2');
    
    QUnit.equalExt([1,2,3,4,5], [1,2,3,8,7,6,5], 'as')
    
    start();
    
  });
});