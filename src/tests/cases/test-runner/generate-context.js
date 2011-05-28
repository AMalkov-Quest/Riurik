module('generate context', {
  setup: function() {
    context.url = full_url(context, 'actions/test/run/?path=tests/suite-for-testing/first-test.js&context=localhost');
  }
});

asyncTest('first', function() {
  $.when( frame.go( context.url ) ).then(function(_$) {
    QUnit.log(frame.window().context);
    ok( typeof frame.window().context != 'undefined', 'context is generated' );
    with(frame.window().context) {
      
      ok( host != 'localhost', 'localhost is translated into local machine name' );
      equal( var1, 'value2', 'variable value corresponds to context' );
      
    }
    start();
  });
});