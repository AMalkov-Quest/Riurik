module('if context contains the libraries option');

test('given libraries are included ', function() {
  equal( library2.method2(40), 40, 'global library 2 is available' );
  equal( library3.method3(80), 80, 'local library is available' );
});

test('libraries those are not listed in the context are skipped', function() {
  ok( typeof library1 == 'undefined', 'library 1 is not available' );
});