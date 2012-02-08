module('run test');

var test_content = " \
asyncTest('test', function() { \
  $.when( frame.go( contexter.URL(context, 'hello') )).then(function(_$) { \
    equal($.trim(_$('body').text()), 'Hello world!'); \
    start(); \
  }); \
});";

QUnit.setup(function() {
  with(context) {
    context.test_name = 'first-example.js';
    context.suite_name = 'remote-tests';
    context.suite_path = root.concat('/', suite_name);
    context.test_path = suite_path.concat('/',  test_name);
    context.test_context = 'django-app';
    context.test_content = test_content;
    context.start = getLogs('last');
    
    var path = 'actions/test/run/?path='.concat(test_path, '&context=', test_context);
    context.URL = contexter.URL(context, path.concat("&content=", escape(test_content)));
    
    create_test( test_name, context.suite_path );
  }
});

asyncTest('test is pushed to run on remote server', function() {
  $('#frame').attr('src', context.URL);
  $('#frame').unbind('load');
  $('#frame').load(function() {
    var logs = getLogs(context.start);
    
    var regex = new RegExp('run test '.concat(context.test_path, ' with context ', context.test_context));    
    ok(regex.test(logs), regex);
    
    regex = new RegExp('save '.concat(context.suite_name, ' context'));
    ok(regex.test(logs), regex);
    
    start();
  });
});

asyncTest('test is executed on remote server', function() {
  riurik.sleep(100).then(function() {
    var logs = getLogs(context.start, 'django-app');
    
    var regex = new RegExp('save script '.concat(context.suite_path.strip(context.root).strip('/'), '/.context.js'));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('save script '.concat(context.test_path.strip(context.root).strip('/')));
    ok(regex.test(logs), regex);
    
    regex = new RegExp('execute test '.concat(context.test_path.strip(context.root).strip('/')));
    ok(regex.test(logs), regex);
    
    start();
  })
});

QUnit.teardown(function() {
  delete_test( context.test_path );
});