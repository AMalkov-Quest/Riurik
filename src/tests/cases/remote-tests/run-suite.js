/* this test require one more riurik instance on the 8001 port
*  that will allow to test of saving test content in the editor
*  to remote file system where test will be loaded
*/
module('run suite remote');

QUnit.setup(function() {
  context.suite_name = 'first-suite';
  context.suite_path = context.root.concat('/', context.suite_name);
  context.test1_name = 'first-test.js';
  context.test2_name = 'second-test.js';
  var context_name = 'remote-suite';
  var path = 'actions/suite/run/?path=/' + context.suite_path  + '&context=' + context_name;
  context.url = contexter.URL(context, path);
  
  delete_folder(context.suite_path);
  create_folder(context.suite_name, 'tests');
  set_context(context.suite_path, '[' + context_name + ']\nrun=remote\nhost=localhost\nport=8001');
  write_test(context.suite_path + '/' + context.test1_name, "test('first test', function(){ok(true, 'is run')});");
  write_test(context.suite_path + '/' + context.test2_name, "test('second test', function(){ok(true, 'is run')});");
  context.start = getLogs('last');
});

asyncTest('suite is executed', function() {
  $('#frame').attr('src', context.url);
  $('#frame').unbind('load');
  $('#frame').load(function() {
    var logs = getLogs(context.start);
    var regex = new RegExp("Run suite " + context.suite_name);
    ok(regex.test(logs), regex);
    start();
  });
});

asyncTest('context is saved', function() {
  //context will be rewrited here, so preserve it
  var ctx = context;
  $.ajax('/' + ctx.suite_path + '/' + '.context.js', 
  { 
    async: false, 
    success: function(data) {
      QUnit.log(context);
      equals(context.include[0], ctx.test1_name, 'fists test is included');
      equals(context.include[1], ctx.test2_name, 'second test is included');
      context = ctx;
      start();
    } 
  }).error(function(){
    ok(false, 'something wrong with suite context');
    start();
  });
});

QUnit.teardown(function() {
  delete_folder(context.suite_path);
});