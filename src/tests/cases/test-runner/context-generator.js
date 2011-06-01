module('context generator', {
  setup: function() {
    context.setup_value = 10;
  }
});

test('context is generated', function() {
  QUnit.log(context);
  
  ok( typeof context != 'undefined', 'context is generated' );
  ok( context.host != 'localhost', 'localhost is translated into local machine name' );
  equal( context.var1, 'value2', 'variable value corresponds to context' );
  equal( context.setup_value, 10, 'value from setup is available' );
  equal( library1.method1(20), 20, 'method from library 1 is available' );
  equal( library2.method2(40), 40, 'method from library 2 is available' );
  equal( library3.method3(60), 60, 'method from library 3 is available' );
  
});