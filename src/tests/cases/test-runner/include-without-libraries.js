module('libraries');

test('should be included', function() {
  equal( library1.method1(20), 20, 'method from library 1 is available' );
  equal( library2.method2(40), 40, 'method from library 2 is available' );
  //equal( library3.method3(60), 60, 'method from library 3 is available' );
  equal( library4.method4(80), 80, 'method from library 4 is available' );
});