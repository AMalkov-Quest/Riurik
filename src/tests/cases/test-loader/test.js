module('test', {
  
  setup: function() {
    QUnit.log('setup');
  },
  
  teardown: function() {
    QUnit.log('teardown');
  }
});

test('test1', function() {
  ok(true);
});

test('test2', function() {
  ok(true);
});

test('test3', function() {
  ok(true);
});

teardown(function() {
  QUnit.log('main teardown');
});