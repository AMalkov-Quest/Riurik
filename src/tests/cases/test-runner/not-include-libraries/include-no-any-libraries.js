module('libraries');

test('not include any library if context libraries=[]', function() {
  ok( typeof library1 == 'undefined', 'library 1 is not loaded' );
  ok( typeof library2 == 'undefined', 'library 2 is not loaded' );
  ok( typeof library4 == 'undefined', 'library 4 is not loaded' );
  ok( typeof globalLibrary == 'undefined', 'global library is not loaded' );
});