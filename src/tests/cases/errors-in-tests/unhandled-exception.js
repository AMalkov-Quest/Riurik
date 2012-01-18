module('unhandled exception');

asyncTest('should not hang a suite', function() {
  $.when(frame.go('')).then(function(_$) {
    _$('').trim();
    
    start();
  });
});