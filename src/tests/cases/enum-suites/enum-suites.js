module('enumirate suites');

asyncTest('should return appropriate suite', function() {
  var URL = contexter.URL(context, 'actions/suite/enumerate/?context=' + context.suite + '&target=' + context.root);
  $.ajax({
    type: 'GET',
    async: true,
    url: URL,
    success: function(data) {
      equal(data, context.suite, URL);
      start();
    },
    error: function() {
      ok(false, URL);
      start();
    }
  });
});