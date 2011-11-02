module('libraries');

test('include only global libraries if local ones were not defined', function() {
  equal( globalLibrary.method(20), 20, 'method from global library is available' );
});