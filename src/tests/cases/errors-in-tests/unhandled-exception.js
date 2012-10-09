module('unhandled exception');

asyncTest('should not hang a suite', function() {
  $.when(frame.go('')).then(function(_$) {
    _$('').trim();
    
    start();
  });
});

asyncTest('should not hang a suite', function() {
  $.when(frame.go('')).then(function(_$) {
    setTimeout(function () {
      _$('').trim();
      start();
    }, 100);
  });
});