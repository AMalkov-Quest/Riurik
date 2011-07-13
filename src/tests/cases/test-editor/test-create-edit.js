module('test create and edit', {
  setup: function() {
    context.test_path = 'tests/test-editor';
    context.test_name = 'first-example.js';
  }
});

asyncTest('post to create', function(){
  
  $.post(
    contexter.URL(context, 'actions/test/create/'),
    { 'object-name': context.test_name, 'path': context.test_path },
    function(data) {
      start();
    })
    .error(function() {
      QUnit.log('create test is failed', arguments);
      start();
    });
  
  $.when( frame.go( contexter.URL(context, 'tests/test-editor/' + context.test_name + '?editor') ) ).then(function(_$){
    //ok(_$('#run').length == 1, 'run button exists');
    //ok(_$('select[name=context]').length == 1, 'context select exists');
    //ok(_$('select[name=context] option[value=test-context]').length == 1, 'test context option exists');
    start();
  });
  
});

QUnit.teardown(function() {
  delete_test( context.test_path + '/' + context.test_name);
});