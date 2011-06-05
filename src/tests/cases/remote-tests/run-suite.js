module('run suite remote');

QUnit.setup(function() {
  context.suite_name = 'first-suite';
  context.suite_path = 'tests/' + context.suite_name;
  var context_name = 'remote-suite';
  var path = 'actions/suite/run/?path=/' + context.suite_path  + '&context=' + context_name;
  context.url = contexter.URL(context, path);
  
  $.seq(
    function(){ delete_suite(context.suite_path); },
    function(){ create_suite(context.suite_name, 'tests'); },
    function(){ set_context(context.suite_path, '[' + context_name + ']\nrun=remote\nhost=localhost\nport=8001'); },
    function(){ create_test( 'first-test', context.suite_path); },
    function(){ write_test(context.suite_path + '/first-test.js', "test('first test', function(){ok(true, 'is run')});"); },
    function(){ create_test( 'second-test', context.suite_path); },
    function(){ write_test(context.suite_path + '/second-test.js', "test('second test', function(){ok(true, 'is run')});"); }
  ).then(function() {
    context.start = getLogs('last');
    start();
  });
});

asyncTest('suite is executed', function() {
  $('#frame').attr('src', context.url);
  $('#frame').load(function() {
    var logs = getLogs(context.start);
    var regex = new RegExp("Run suite " + context.suite_name);
    ok(regex.test(logs), regex);
    start();
  });
});

asyncTest('context is saved', function() {
  $.ajax('/' + context.suite_path + '/' + '.context.js', 
  { 
    async: false, 
    success: function(data) {
      QUnit.log(context);
      equals(context.include[0], "first-test.js", 'fists test is included');
      equals(context.include[1], "second-test.js", 'second test is included');
      start();
    } 
  }).error(function(){
    ok(false, 'something wrong with suite context');
    start();
  });
});

QUnit.teardown(function() {
  $.seq(
    function(){ delete_suite('tests/first-suite'); }
  ).then(function() {
    start();
  });
});