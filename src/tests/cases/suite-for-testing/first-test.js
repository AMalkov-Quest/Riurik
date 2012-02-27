asyncTest('first test', function() {
  riurik.sleep(1000).then(function() {
    ok(true, 'first check');
    ok(true, 'second check');
    start();
  });
});

test('second test', function() {

  ok(true, 'third check');
  ok(true, 'fourth check');
  
});