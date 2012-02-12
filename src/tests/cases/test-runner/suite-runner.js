module('suite runner', {
  setup: function() {
    var path = 'actions/suite/run/?path=/' + context.root +'/suite-for-testing&context=localhost';
    context.url = contexter.URL(context, path);
  }
});

asyncTest('suite is executed', function() {
  $.when( frame.go( context.url ) ).then(function(_$) {
    $.wait(function() { return _$("#test-output0").length == 1} ).then(function() {
      equal( _$("#test-output0 .test-name").text(), 'setup for this suite', 'suite setup is executed first');
      ok( typeof frame.window().context != 'undefined', 'context is generated' );
      frame.window().QUnit.done = function(module) {
        ok( _$('#qunit-testresult').length == 1, 'test result is present');
        equal( _$('.test-name').length, 6, 'all tests are ran' );
        equal( _$('.test-name:contains("setup for this suite")').length, 1 );
        
        start();
      }
    });
  });
});