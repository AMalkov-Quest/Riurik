module('all libraries');

test('should be included if context does not contain the libraries option', function() {
  equal( library1.method1(20), 20, 'global library 1 is available' );
  equal( library2.method2(40), 40, 'global library 2 is available' );
  equal( library3.method3(80), 80, 'local library is available' );
});