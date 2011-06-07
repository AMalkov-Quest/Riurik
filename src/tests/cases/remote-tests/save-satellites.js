module('save satellite scripts');

QUnit.setup(function() {
  context.suite_name = 'second-suite';
  context.suite_path = 'tests/' + context.suite_name;
  var test_name = 'first-test.js';
  var context_name = 'satellites';
  var satellite_name = 'library-1.js';
  var non_satellite_name = 'library-2.js';
  context.satellite_path = context.suite_name + '/' + satellite_name;
  context.non_satellite_path = context.suite_name + '/' + non_satellite_name;
  var test_content = "test('first test', function(){ok(true, 'is run')});";
  var path = 'actions/test/run/?path=' + context.suite_path + '/' + test_name + '.js&context=' + context_name;
  context.url = contexter.URL(context, path + "&content=" + escape(test_content));
  var context_content = 'run=remote\nhost=localhost\nport=8001\nlibraries=["' + context.satellite_path + '"]';
  context.start = getLogs('last');
  
  $.seq(
    function(){ delete_suite(context.suite_path); },
    function(){ create_suite(context.suite_name, 'tests'); },
    function(){ create_test(satellite_name, context.suite_path + '/' +  satellite_name); },
    function(){ set_context(context.suite_path, '[' + context_name + ']\n' + context_content); },
    function(){ stubFile(context.satellite_path); },
    function(){ stubFile(context.non_satellite_path); }
  ).then(function() {
    context.start = getLogs('last');
    start();
  });
});

asyncTest('test is run', function() {
  $('#frame').attr('src', context.url);
  $('#frame').unbind('load');
  $('#frame').load(function() {
    var logs = getLogs(context.start);
    var regex = new RegExp("Save satellite script " + context.satellite_path + " is done: OK");
    ok(regex.test(logs), context.satellite_path + ' should be coppied');
    regex = new RegExp("Save satellite script " + context.non_satellite_path + " is done: OK");
    QUnit.assertFalse(regex.test(logs), context.non_satellite_path + ' should not be coppied');
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