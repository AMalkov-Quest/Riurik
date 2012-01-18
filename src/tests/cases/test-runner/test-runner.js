module('test runner', {
  setup: function() {
    var path = 'actions/test/run/?path=' + context.root +'/suite-for-testing/first-test.js&context=localhost';
    context.url = contexter.URL(context, path);
  }
});

asyncTest('test is executed', function() {
  $.when( frame.go( context.url ) ).then(function(_$) {
    $.wait(function() { return typeof frame.window().context != 'undefined'}).then(function() {
      ok( 'context is generated' );
      frame.window().QUnit.done = function(module) {
        ok( _$('#qunit-testresult').length == 1, 'test result is present');
        equal( _$('.test-name').length, 2, 'all tests are ran' );
    
        start();
      };
    });
  });
});