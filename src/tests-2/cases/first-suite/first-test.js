module('first');

asyncTest('test', function() {
  $.when( frame.go( contexter.URL(context, 'hello') )).then(function(_$) {
    start();
  });
});