module('demo');

asyncTest('first test', function() {
  $.when( frame.go('') ).then( function() {
    ok( _$('#configure').length > 0, 'the configure element exists' );
    start();
  });
});