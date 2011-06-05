/* this test require one more riurik instance on the 8001 port
*  that will allow to test of saving test content in the editor
*  to remote file system where test will be loaded
*/
module('save test remote');

// setup creates new empty test file on a file system
QUnit.setup(function() {
  context.test_name = 'first-example';
  context.test_path = 'tests/remote-tests';
  context.test_context = 'save-remote';
  context.test_content = "ok(true, 'test is run');";
  context.start = getLogs('last');
    
  var path = 'actions/test/run/?path='+context.test_path+'/'+context.test_name+'.js&context='+context.test_context;
  context.url = contexter.URL(context, path + "&content=" + escape(context.test_content));
    
  $.seq(
    function(){ delete_test( context.test_name, context.test_path, function(){}, function(){} ); },
    function(){ create_test( context.test_name, context.test_path, function(){}, function(){} ); }
  ).then(function() {
    start();
  });
});

/* this new empty test file is queried to be run with the given content in the frame
 * as a result it is saved and the test load it to check if it is
 * as soon as it is loaded qunit runs it in the test context (as soon as the content is given without the test() call)
 * so a count of expectaions is more then actual one in the test
*/
asyncTest('test is saved', function() {
  expect(3);
  $('#frame').attr('src', context.url);
  $('#frame').load(function() {
    $.ajax('/' + context.test_path + '/' + context.test_name + '.js',
    { 
      async: false, 
      success: function(data) {
        equals(data, context.test_content, 'test content is OK');
        var logs = getLogs(context.start);
        var regex = new RegExp("remote script remote-tests/" + context.test_name + ".js saving result: OK");
        ok(regex.test(logs), regex);
        start();
      } 
    }).error(function(){
      ok(false, 'something wrong with tests');
      start();
    });
  });
});

test('test context is saved', function() {
  var logs = getLogs(context.start);
  var regex = /remote script remote-tests\\\\.context.js saving result: OK/;
  ok(regex.test(logs), regex);
});

QUnit.teardown(function() {
  delete_test( context.test_name, context.test_path, function(){}, function(){} );
  start();
});