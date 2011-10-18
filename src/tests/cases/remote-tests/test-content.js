module('test content');

QUnit.setup(function() {
  context.test_name = 'second-example.js';
  context.suite_path = context.root.concat('/remote-tests/');
  context.test_path = context.suite_path + '/' + context.test_name;
  context.test_context = 'django-app';
  context.test_content = "test('test', function() { ok(true, 'test is run'); })";
    
  context.run_test = 'actions/test/run/?path=' + context.test_path + '&context=' + context.test_context;
    
  delete_test( context.test_path );
  create_test( context.test_name, context.suite_path );
});

asyncTest('is presaved locally befor run', function() {
  var URL = contexter.URL(context, context.run_test.concat("&content=", escape(context.test_content)));
  $('#frame').attr('src', URL);
  $('#frame').unbind('load');
  $('#frame').load(function() {
    $.ajax(contexter.URL(context, context.test_path),
    { 
      async: false, 
      success: function(data) {
        equals(data, context.test_content, 'test content is OK');
        start();
      } 
    }).error(function(){
      ok(false, 'something wrong with test');
      start();
    });
  });
});

asyncTest('is kept if run URL does not contain content', function() {
  var URL = contexter.URL(context, context.run_test);
  $('#frame').attr('src', URL);
  $('#frame').unbind('load');
  $('#frame').load(function() {
    $.ajax(contexter.URL(context, context.test_path),
    { 
      async: false, 
      success: function(data) {
        equals(data, context.test_content, 'test content is OK');
        start();
      } 
    }).error(function(){
      ok(false, 'something wrong with test');
      start();
    });
  });
});

QUnit.teardown(function() {
  delete_test( context.test_path );
});