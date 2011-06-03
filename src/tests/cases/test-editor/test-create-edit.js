module('create test', {
  setup: function() {
    context.test_name = 'first-example';
    var path = 'tests/run-test/example1.js?editor';
    context.url = contexter.URL(context, path);
  }
});

asyncTest('create test', function(){
  
  $.post(
    contexter.URL(context, 'actions/test/create/'),
    { 'object-name': context.test_name, 'path': 'tests/test-editor' },
    function(data) {
      QUnit.log(data);
      start();
    })
    .error(function() {
      QUnit.log('create test is failed', arguments);
      start();
    });
  
  $.when( frame.go( contexter.URL(context, 'tests/test-editor/' + context.test_name + '.js?editor') ) ).then(function(_$){
    //ok(_$('#run').length == 1, 'run button exists');
    //ok(_$('select[name=context]').length == 1, 'context select exists');
    //ok(_$('select[name=context] option[value=test-context]').length == 1, 'test context option exists');
    start();
  });
  
});