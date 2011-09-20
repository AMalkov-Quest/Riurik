module('Using Unicode characters', {
  
  setup: function() {
    context.content = 'Все прошло ОК!';
    var test_content = '\n\
      test(\'Unicode content\', function() {\n\
        ok(true, \''+context.content+'\');\n\
      });';
    context.suite_path = context.root+'/suite-for-testing';
    context.test_name = 'unicode-content.js';
    context.test_path = context.suite_path + '/' + context.test_name;
    create_test(context.test_name, context.suite_path);
    write_test(context.test_path, test_content);
    var path = 'actions/test/run/?path=' + context.test_path + '&context=localhost';
    context.url = contexter.URL(context, path);
  },
  
  teardown: function() {
    delete_test(context.test_path);
  }

});

asyncTest('Unicode content sent and executed successfuly', function() {
  $.when( frame.go( context.url ) ).then(function(_$) {
    frame.window().QUnit.done = function(module) {
      QUnit.substring( _$('#qunit-tests').text(), context.content, 'Unicode string "Все прошло ОК!" is present');
      equal( _$('.test-name').length, 1, 'all tests are ran' );
      start();
    }
  });
});
