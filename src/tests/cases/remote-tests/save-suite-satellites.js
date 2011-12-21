module('save suite satellite scripts');

QUnit.setup(function() {
  with(context) {
    context.suite_name = 'first-suite';
    context.suite_path = context.root.concat('/remote-tests/', context.suite_name);
    context.test1_name = 'first-test.js';
    context.test2_name = 'second-test.js';
    context.suite_context = 'django-app-satellite';
    var path = 'actions/suite/run/?path=/' + context.suite_path  + '&context=' + context.suite_context;
    context.url = contexter.URL(context, path);
    
    delete_folder(context.suite_path);
    var ctx_settings = '['.concat(context.suite_context, ']\nhost=localhost\nport=', context.django_port);
    var libs = 'libraries='.concat(libraries[1], ',', libraries[2], ',');
    set_context(context.suite_path, ctx_settings.concat('\n', libs) );
    write_test(context.suite_path + '/' + context.test1_name, "test('first test', function(){ok(true, 'is run')});");
    write_test(context.suite_path + '/' + context.test2_name, "test('second test', function(){ok(true, 'is run')});");
    context.start = getLogs('last');
  }
});

asyncTest('satellite scripts are pushed to save on remote server', function() {
  $('#frame').attr('src', context.url);
  $('#frame').unbind('load');
  $('#frame').load(function() {
    var logs = getLogs(context.start);
    
    regex = new RegExp('library '.concat(context.libraries[0], ' is saved'));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('library '.concat(context.libraries[1], ' is saved'));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('library '.concat(context.libraries[2], ' is saved'));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('tools script '.concat(context.root, '/', context.psscript_path, ' is saved'));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('tools script '.concat(context.root, '/', context.pyscript_path, ' is saved'));
    ok(regex.test(logs), regex);
    
    start();
  });
});

asyncTest('satellite scripts are saved on remote server', function() {
  riurik.sleep(100).then(function() {
    var logs = getLogs(context.start, 'django-app');
    
    var regex = new RegExp('save script '.concat(context.suite_path.strip(context.root).strip('/'), '/.context.js'));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('save script '.concat(context.libraries[0]));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('save script '.concat(context.libraries[1]));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('save script '.concat(context.libraries[2]));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('save script '.concat(context.psscript_path));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('save script '.concat(context.pyscript_path));
    ok(regex.test(logs), regex);

    start();
  })
});

QUnit.teardown(function() {
  delete_folder(context.suite_path);
});