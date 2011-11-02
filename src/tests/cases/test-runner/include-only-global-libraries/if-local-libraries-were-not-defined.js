module('libraries');

test('include only global libraries if local ones were not defined', function() {
  equal( context.libraries.length, 1, 'only one library is included' );
  equal( globalLibrary.method(20), 20, 'method from global library is available' );
});