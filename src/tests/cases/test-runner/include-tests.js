module('include tests', {
  setup: function() {
    var path = 'actions/suite/run/?path=/' + context.root +'/suite-for-testing&context=test-include';
    context.url = contexter.URL(context, path);
  }
});

asyncTest('runs only given tests', function() {
  $.when( frame.go( context.url ) ).then(function(_$) {
    
    frame.window().QUnit.done = function(module) {
      equal( _$('.test-name').length, 3, 'only given tests are ran' );
      equal( _$('.test-name').first().text(), 'first test');
      equal( _$('.test-name').last().text(), 'fifth test');

      start();
    }
  });
});