module('exclude tests', {
  setup: function() {
    var path = 'actions/suite/run/?path=/' + context.root + '/suite-for-testing&context=test-exclude';
    context.url = contexter.URL(context, path);
  }
});

asyncTest('runs tests those were not given', function() {
  $.when( frame.go( context.url ) ).then(function(_$) {
    $.wait(function() { return typeof(frame.window().QUnit.riurik) != 'undefined' }).then(function() {
      frame.window().QUnit.done = function(module) {
        equal( _$('.test-name').length, 2, 'given tests are not ran' );
        equal( _$('.test-name').first().text(), 'first test');
        equal( _$('.test-name').last().text(), 'second test');

        start();
      };
    });
  });
});