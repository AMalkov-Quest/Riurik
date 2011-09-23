module('test with unicode characters');

asyncTest('should be uploaded and executed', function() {
  $.when( frame.go( contexter.URL(context, 'hello') )).then(function(_$) {
    ok(true, 'Все прошло ОК!');
    start();
  });
});