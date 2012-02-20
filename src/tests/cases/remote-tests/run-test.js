module('run test');

var test_name = 'first remote test';
var test_content = "";
var _test_content = " \
asyncTest('" + test_name + "', function() { \
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
    
    var path = 'actions/test/run/?path='.concat(test_path, '&context=', test_context);
    context.URL = contexter.URL(context, path.concat("&content=", escape(test_content)));
    
    create_test( test_name, context.suite_path );
  }
});

asyncTest('test is pushed to run on remote server', function() {
  $.when( frame.go( context.URL ) ).then(function(_$) {
    $.wait(function() { return typeof frame.window().riurik != 'undefined'}).then(function() {
      frame.window().QUnit.done = function(module) {
        ok( _$('#qunit-testresult').length == 1, 'test result is present');
        equal( _$('.test-name:first').text(), test_name );
        start();
      }
    });
  });
});

QUnit.teardown(function() {
  delete_test( context.test_path );
});