module('delete');

QUnit.setup(function() {
  context.current_folder = context.root;
  context.folder_name = 'first-folder';
  context.suite_name = 'first-suite';
  context.folder_path = context.current_folder.concat('/', context.folder_name);
  
});

asyncTest('folder', function() {
  create_folder(context.folder_name, context.current_folder);
  
  $.when( frame.go( contexter.URL(context, context.current_folder) ) ).then(function(_$) {
    
    equal(_$('#' + context.folder_name).length, 1, 'the ' + context.folder_name + ' folder is exist');
    window.frames[0].dirIndexActions.remove(context.folder_name);
    $.when( frame.load() ).then(function(_$) {
      equal(_$('#' + context.folder_name).length, 0, 'the ' + context.folder_name + ' folder is deleted');
      start();
    });
    
  });
});

asyncTest('suite', function() {
  create_folder(context.folder_name, context.current_folder);
  create_folder(context.suite_name, context.folder_path);
  
  $.when( frame.go( contexter.URL(context, context.folder_path) ) ).then(function(_$) {
    
    equal(_$('#' + context.suite_name).length, 1, 'the ' + context.suite_name + ' suite is exist');
    window.frames[0].dirIndexActions.remove(context.suite_name);
    $.when( frame.load() ).then(function(_$) {
      equal(_$('#' + context.suite_name).length, 0, 'the ' + context.suite_name + ' suite is deleted');
      start();
    });
    
  });
});

asyncTest('test', function() {
  var test_name = 'first-test';
  var suite_path = context.folder_path + '/' + context.suite_name;
  
  create_folder(context.folder_name, context.current_folder);
  create_folder(context.suite_name, context.folder_path);
  write_test(suite_path + '/' + test_name, "test('first test', function(){ok(true)});");
  
  $.when( frame.go( contexter.URL(context, suite_path) ) ).then(function(_$) {
    
    equal(_$('#' + test_name).length, 1, 'the ' + test_name + ' test is exist');
    window.frames[0].dirIndexActions.remove(test_name);
    $.when( frame.load() ).then(function(_$) {
      equal(_$('#' + test_name).length, 0, 'the ' + test_name + ' test is deleted');
      start();
    });
    
  });
});
