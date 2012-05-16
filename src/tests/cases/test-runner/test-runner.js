module('test runner', {
  setup: function() {
    var path = 'actions/test/run/?path=' + context.root +'/suite-for-testing/first-test.js&context=localhost';
    context.url = contexter.URL(context, path);
  }
});

asyncTest('test is executed', function() {
  $.when( frame.go( context.url ) ).then(function(_$) {
    $.wait.condition(function() { return typeof frame.window().context != 'undefined'}).done( function() {
      $.wait.condition(function() { return frameTestsAreDone() }).then( function(module) {
        ok( _$('#qunit-testresult').length == 1, 'test result is present');
        equal( _$('.test-name').length, 2, 'all tests are ran' );
    
        start();
      });
    }).fail( function() {
      $.fail('context is not generated');
      start();
    });
  });
});