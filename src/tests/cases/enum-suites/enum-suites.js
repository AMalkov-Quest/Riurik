module('enumirate suites');

QUnit.setup(function() {
  context.URL = contexter.URL(context, 'actions/suite/enumerate/?context=' + context.suite + '&target=' + context.root);
  var content = '[' + context.suite + ']';
  context.suites_list = '';
  
  $.each(context.suites, function(i, value) {
    create_suite(value, context.root, content);
  });
});

function enum_suites(URL, checker) {
  $.ajax({
    type: 'GET',
    async: true,
    url: URL,
    success: function(data) {
      $.each(context.suites, function(i, suite) {
        checker(data, suite);
      });
      start();
    },
    error: function() {
      ok(false, URL);
      start();
    }
  });
};
         
asyncTest('should return suites as string', function() {
  var URL = context.URL;
  enum_suites(URL, function(actual, given){
    QUnit.substring(actual, given, given + ' is in ' + actual);
  });
});

asyncTest('should return suites as json', function() {
  var URL = context.URL.concat('&json=true');
  enum_suites(URL, function(actual, given){
    ok($.inArray(given, actual != -1), given + ' is in ' + actual);
  });
});

QUnit.teardown(function() {
  $.each(context.suites, function(i, value) {
    delete_folder(context.root.concat('/', value));
  });
});
