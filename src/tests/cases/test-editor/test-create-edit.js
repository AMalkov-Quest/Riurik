module('test create and edit');

QUnit.setup( function() {
    context.folder_name = 'first-folder';
    context.test_path = context.root.concat('/', context.folder_name);
    context.test_name = 'first-example.js';
    create_folder(context.folder_name, context.root);
});

asyncTest('post to create', function() {
  
  $.post(
    contexter.URL(context, 'actions/test/create/'),
    { 'object-name': context.test_name, 'path': context.test_path },
    function(data) {
      var URL = contexter.URL(context, context.test_path.concat('/', context.test_name, '?editor'));
      $.when( frame.go( URL)).then(function(_$){
    ok( _$('#run').length == 1, 'run button exists');
    ok(_$('select[name=context]').length == 1, 'context select exists');
    //ok(_$('select[name=context] option[value=test-context]').length == 1, 'test context option exists');
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