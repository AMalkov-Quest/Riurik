module('window title');

QUnit.setup(function() {
  context.current_folder = 'other-tests';
  context.suite_name = 'first-suite';
  context.suite_path = context.current_folder + '/' + context.suite_name;
  context.test_name = 'first-test.js';
});

asyncTest('title for folder', function() {
  $.when( frame.go( contexter.URL(context, context.current_folder) ) ).then(function(_$) {
    equal(frame.document().title, context.current_folder);
    start();
    
  });
});

asyncTest('title for suite', function() {
  create_folder(context.suite_name, context.current_folder);
  $.when( frame.go( contexter.URL(context, context.suite_path) ) ).then(function(_$) {
    equal(frame.document().title, context.suite_name);
    start();
    
  });
});

asyncTest('title for test', function() {
  write_test(context.suite_path + '/' + context.test_name, "test('first test', function(){ok(true)});");
  $.when( frame.go( contexter.URL(context, context.suite_path + '/' + context.test_name + '?editor') ) ).then(function(_$) {
    equal(frame.document().title, context.test_name);
    start();
    
  });
});

QUnit.teardown(function() {
  delete_folder(context.suite_path);
});