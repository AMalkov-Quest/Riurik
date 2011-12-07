module('run suite remote');

QUnit.setup(function() {
  context.suite_name = 'first-suite';
  context.suite_path = context.root.concat('/remote-tests/', context.suite_name);
  context.test1_name = 'first-test.js';
  context.test2_name = 'second-test.js';
  context.suite_context = 'remote-suite';
  var path = 'actions/suite/run/?path=/' + context.suite_path  + '&context=' + context.suite_context;
  context.url = contexter.URL(context, path);
  
  delete_folder(context.suite_path);
  set_context(context.suite_path, '[' + context.suite_context + ']\nrun=remote\nhost=localhost\nport=' + context.django_port);
  write_test(context.suite_path + '/' + context.test1_name, "test('first test', function(){ok(true, 'is run')});");
  write_test(context.suite_path + '/' + context.test2_name, "test('second test', function(){ok(true, 'is run')});");
  context.start = getLogs('last');
});

asyncTest('suite is pushed to run on remote server', function() {
  $('#frame').attr('src', context.url);
  $('#frame').unbind('load');
  $('#frame').load(function() {
    var logs = getLogs(context.start);
    
    var regex = new RegExp('run suite '.concat('/', context.suite_path, ' with context ', context.suite_context));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('save '.concat(context.suite_path.strip(context.root).strip('/'), ' context'));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('test '.concat('/', context.suite_path, '/', context.test1_name, ' is saved'));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('test '.concat('/', context.suite_path, '/', context.test2_name, ' is saved'));
    ok(regex.test(logs), regex);
    
    start();
  });
});

asyncTest('suite is executed on remote server', function() {
  riurik.sleep(100).then(function() {
    var logs = getLogs(context.start, 'django-app');
    
    var clean_suite_path = context.suite_path.strip(context.root).strip('/');
    var regex = new RegExp('save script '.concat(clean_suite_path, '/.context.js'));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('save script '.concat(clean_suite_path, '/', context.test1_name));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('save script '.concat(clean_suite_path, '/', context.test2_name));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('execute suite ' + clean_suite_path);
    ok(regex.test(logs), regex);

    start();
  })
});

QUnit.teardown(function() {
  delete_folder(context.suite_path);
});