/* this test require one more riurik instance on the 8001 port
*  that will allow to test of saving test content in the editor
*  to remote file system where test will be loaded
*/
module('save test remote', {
  module_setup: function() {
    stop();
    
    context.test_name = 'first-example';
    context.test_path = 'tests/remote-tests';
    context.test_context = 'save-remote';
    context.test_content = "ok(true, 'test is run');";
    context.time_now = new Date().getTime();
    
    var path = 'actions/test/run/?path='+context.test_path+'/'+context.test_name+'.js&context='+context.test_context;
    context.url = contexter.URL(context, path + "&content=" + escape(context.test_content));
    
    $.seq(
      function(){ delete_test( context.test_name, context.test_path, function(){}, function(){} ); },
      function(){ create_test( context.test_name, context.test_path, function(){}, function(){} ); },
      function() { start(); }
    );
  },
  teardown: function() {
    delete_test( context.test_name, context.test_path, function(){}, function(){} );
  }
});

asyncTest('test is saved', function() {
  QUnit.log('loading frame: ', context.url);
    
  expect(2);
  $('#frame').attr('src', context.url);
  $('#frame').load(function() {
    $.ajax('/'+context.test_path+'/'+context.test_name+'.js', 
    { 
      async: false, 
      success: function(data) {
        equals(data, context.test_content, 'test content is OK');
        $.get(contexter.URL(context, 'logger/records/recv/?from=' + context.time_now), function(data) {
          QUnit.log(data);
          start();
        }).error(function(data) {
          QUnit.log(data);
          start();
        });
        //start();
      } 
    }).error(function(){
      ok(false, 'something wrong with tests');
    });
  });
});