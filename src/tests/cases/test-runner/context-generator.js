module('context generator');

QUnit.setup(function() {
  context.setup_value = 10;
  context.hidden_file = '.context.js';
  context.suite_path = context.root.concat('/suite-for-testing');
  var path = 'actions/suite/run/?path=/' + context.suite_path + '&context=localhost';
  context.url = contexter.URL(context, path);
});

test('context is generated', function() {
  ok( typeof context != 'undefined', 'context is generated' );
  ok( context.host != 'localhost', 'localhost is translated into local machine name' );
  equal( context.var1, 'value2', 'variable value corresponds to context' );
  equal( context.setup_value, 10, 'value from setup is available' );
  equal( library1.method1(20), 20, 'method from library 1 is available' );
  equal( library2.method2(40), 40, 'method from library 2 is available' );
  equal( library3.method3(60), 60, 'method from library 3 is available' );
  notEqual( context.test_start_time, 'undefined', 'context include test start time');
});

test('context is generated including global settings', function() {
  with(context) {
    equal( global_var, 'GLOBAL', 'GLOBAL_VAR is from .settings.ini default section' );
    equal( localhost_var, 'LOCALHOST', 'LOCALHOST_VAR is from .settings.ini localhost section' );
    equal( localhost_var_rewrite, 'REWRITTEN', 'var from global context should be rewritten by value from local context' );
    equal( compound_var, global_var1 + '-' + global_var2, 'global vars can be used to interpolate local compound var' );
  }
});


asyncTest('hidden file is not included into suite', function() {
  $.when( frame.go( context.url ) ).then(function(_$) {
    $.wait(function() { return typeof frame.window().context != 'undefined'}).then(function() {
      $.each( frame.window().context.include, function(index, value){ 
        ok( value != context.hidden_file, value );
      });
    
      start();
    });
  });
});