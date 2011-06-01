module('create test', {
  setup: function() {
    var path = 'tests/run-test/example1.js?editor';
    context.url = contexter.URL(context, path);
  }
});

asyncTest('create test', function(){
  QUnit.log(contexter.URL(context, 'actions/test/create/'));
  $.post(
    contexter.URL(context, 'actions/test/create/'),
    { 'object-name': 'first-example' },
    function(data) {
      QUnit.log(data);
      start();
    })
    .error(function() {
      QUnit.log('create test is failed');
      start();
    });
  
  /*$.when( frame.go( context.url ) ).then(function(_$){
    ok(_$('#run').length == 1, 'run button exists');
    ok(_$('select[name=context]').length == 1, 'context select exists');
    ok(_$('select[name=context] option[value=test-context]').length == 1, 'test context option exists');
    start();
  });*/
});