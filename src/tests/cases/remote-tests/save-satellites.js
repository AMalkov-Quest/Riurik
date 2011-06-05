module('save satellite scripts');

QUnit.setup(function() {
  context.suite_name = 'second-suite';
  context.suite_path = 'tests/' + context.suite_name;
  var test_name = 'first-test.js';
  var context_name = 'satellites';
  var satellite_name = 'library';
  var satellite_path = context.suite_name + '/' + satellite_name + '.js';
  var test_content = "test('first test', function(){ok(true, 'is run')});";
  var path = 'actions/test/run/?path=' + context.suite_path + '/' + test_name + '.js&context=' + context_name;
  context.url = contexter.URL(context, path + "&content=" + escape(test_content));
  var context_content = 'run=remote\nhost=localhost\nport=8001\nlibraries=["' + satellite_path + '"]';
  
  $.seq(
    function(){ delete_suite(context.suite_path); },
    function(){ create_suite(context.suite_name, 'tests'); },
    function(){ create_test(satellite_name, context.suite_path + '/' +  satellite_name); },
    function(){ set_context(context.suite_path, '[' + context_name + ']\n' + context_content); }
  ).then(function() {
    context.start = getLogs('last');
    start();
  });
});

asyncTest('test is run', function() {
  $('#frame').attr('src', context.url);
  $('#frame').load(function() {
    //var logs = getLogs(context.start);
    //var regex = new RegExp("Run test remote-tests/" + context.test_name + ".js");
    //ok(regex.test(logs), regex);
    start();
  });
});

QUnit.teardown(function() {
  $.seq(
    function(){ delete_suite(context.suite_path); }
  ).then(function() {
    start();
  });
});