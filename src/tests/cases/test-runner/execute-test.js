module('run test', {
  setup: function() {
    context.url = full_url(context, 'actions/test/run/?path=tests/suite-for-testing/first-test.js&context=localhost');
  }
});

asyncTest('first', function() {
  $.when( frame.go( context.url ) ).then(function(_$) {
    
    start();
  });
});