module('edit test without context');

QUnit.setup(function() {
  with(context) {
    context.suite_name = 'new-suite';
    context.suite_path = root.concat('/', suite_name);
    context.test_name = 'new-test.js';
    context.test_path = suite_path.concat('/', test_name);
    
    create_folder(suite_name, root);
    create_test(test_name, context.suite_path);
  }
});

asyncTest('should propose creating context', function() {
  $.when(frame.go(context.test_path + '?editor')).then(function(_$) {
    equal( _$('#create-context').text().trim(), 'Create context' );
    equal( _$('#create-context').attr('title').trim(), 'To execute the test you have to define cotext' );
    
    start();
  });
});