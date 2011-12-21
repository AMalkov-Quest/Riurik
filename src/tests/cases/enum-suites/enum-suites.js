module('enumirate suites');

QUnit.setup(function() {
  context.URL = contexter.URL(context, context.emum_url.concat(context.root, '&context=', context.suite));
  var content = '[' + context.suite + ']';
  context.suites_list = '';
  
  $.each(context.suites, function(i, value) {
    create_suite(value, context.root, content);
  });
  var suite_path = context.root.concat('/', context.suites[0]);
  QUnit.log(suite_path);
  set_context(suite_path, '[other-context]');
});

function enum_suites(URL, checker) {
  $.ajax({
    type: 'GET',
    async: true,
    url: URL,
    success: function(data) {
      checker(data);
    },
    error: function() {
      ok(false, URL);
      start();
    }
  });
};
         
asyncTest('should return suites as string', function() {
  enum_suites(context.URL, function(result){
    QUnit.substring(result, context.suites[1], context.suites[1] + ' is in ' + result);
    QUnit.substring(result, context.suites[2], context.suites[2] + ' is in ' + result);
    start();
  });
});

asyncTest('should return suites as json', function() {
  var URL = context.URL.concat('&json=true');
  enum_suites(URL, function(result){
    result = $.parseJSON(result);
    ok($.inArray(context.suites[0], result ) == -1, context.suites[0] + ' is not in ' + result);
    ok($.inArray(context.suites[1], result ) != -1, context.suites[1] + ' is in ' + result);
    ok($.inArray(context.suites[2], result ) != -1, context.suites[2] + ' is in ' + result);
    start();
  });
});

asyncTest('should return only suites those match with given context', function() {
  var URL = context.URL.concat('&json=true');
  enum_suites(URL, function(result){
    result = $.parseJSON(result);
    ok($.inArray(context.suites[0], result ) == -1, context.suites[0] + ' is not in ' + result);
    start();
  });
});

asyncTest('should not return suites if no context', function() {
  var URL = contexter.URL(context, context.emum_url.concat(context.root, '&json=true'));
  enum_suites(URL, function(result){
    result = $.parseJSON(result);
    equal(result.length, 0, 'result is empty');
    start();
  });
});

QUnit.teardown(function() {
  $.each(context.suites, function(i, value) {
    delete_folder(context.root.concat('/', value));
  });
});
