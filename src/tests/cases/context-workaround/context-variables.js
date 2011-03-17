function upload_context(ctx) {

  //stop();
  $.get( context.test_url, function( test_code ){
    console.log('do post')
      $.post(
        context.run_test_url,
        {
          'context': ctx,
          'path':context.test_url,
          'url':context.test_url,
          'content': test_code
        },
        function(){
          console.log('post done');
          
          start();
        }
      );
  });

}

module('test-context-first', {
  setup: function(){
    //upload_context('test-context-first');
  }
});
asyncTest('check context variables', function() {
  upload_context('test-context-first');
  ok(true, 'ok')
  start();
});
/*
asyncTest('check context variables', function() {
  $.when( frame.go( '/' ) ).then(function(_$){
    
  });
  start();
});
*/