module('main menu');

QUnit.setup( function() {
  context.folder_name = 'first-folder';
  context.suite_path = context.root.concat('/', context.folder_name);
  context.test_name = 'first-example.js';
  context.name = 'localhost'
  context.URL = contexter.URL(context, context.suite_path.concat('/', context.test_name, '?editor'));
  
  create_folder(context.folder_name, context.root);
  set_context(context.suite_path, '[' + context.name + ']\nhost=localhost\nport=8000');
});

asyncTest('is available', function() {
  
  $.post(
    contexter.URL(context, 'actions/test/create/'),
    { 'object-name': context.test_name, 'path': context.suite_path },
    function(data) {
      $.when( frame.go( context.URL )).then(function(_$){
        ok( _$('#run').length == 1, 'run button exists');
        ok(_$('select[name=context]').length == 1, 'context selector exists');
        ok(_$('select[name=context] option[value=' + context.name + ']').length == 1, context.name + ' option is available');
        
        start();
      });
    })
    .error(function() {
      QUnit.log('create test is failed', arguments);
      start();
    });
});

QUnit.teardown(function() {
  delete_folder( '/'.concat(context.root, '/', context.folder_name) );
});