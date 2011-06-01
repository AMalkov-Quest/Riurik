module('save test remote', {
  setup: function() {
    $.ajax('/tests/test-runner/first-example.js', 
      { 
        async: false, 
        success: function(data) {
          var path = 'actions/test/run/?path=tests/test-runner/first-example.js&context=save-remote&content='+data;
          context.url = contexter.URL(context, path);
      } 
    });
  }
});

asyncTest('test is saved', function() {
  console.log(context.url)
  $.when( frame.go( context.url ) ).then(function(_$) {
    
    start();
    
  });
});