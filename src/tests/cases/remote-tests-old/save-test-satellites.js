module('save test satellite scripts');

var test_content = " \
asyncTest('test', function() { \
  $.when( frame.go( contexter.URL(context, 'hello') )).then(function(_$) { \
    equal($.trim(_$('body').text()), 'Hello world!'); \
    start(); \
  }); \
});";

QUnit.setup(function() {
  with(context) {
    context.test_name = 'second-example.js';
    context.suite_name = 'remote-tests';
    context.suite_path = root.concat('/', suite_name);
    context.test_path = suite_path.concat('/',  test_name);
    context.test_context = 'django-app-satellite';
    context.test_content = test_content;
    context.start = getLogs('last');
    
    var path = 'actions/test/run/?path='.concat(test_path, '&context=', test_context);
    context.URL = contexter.URL(context, path.concat("&content=", escape(test_content)));
    
    create_test( test_name, context.suite_path );
  }
});

asyncTest('satellite scripts are pushed to save on remote server', function() {
  $('#frame').attr('src', context.URL);
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
    
    regex = new RegExp('save script '.concat(context.test_path.strip(context.root).strip('/')));
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
  delete_test( context.test_path );
});