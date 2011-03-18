function upload_context(ctx) {
  stop();
  $.get( context.test_url + '?_'+Math.random().toString(), function( test_code ){
      console.log('do post', test_code, ctx)
      $.post(
        context.submit_test_url,
        {
          'context': ctx,
          'path':context.test_url,
          'url':context.test_url,
          'content': test_code
        },
        function(){
          console.log('post done', ctx);
          
          start();
        }
      );
  });
};

module('test-context-first', {
  module_setup: function(){
    upload_context('test-context-first');
  }
});

asyncTest('check first context variables', function() {
  $.when( frame.go( context.run_test_url ) ).done(function(_$){
    var test_context = frame.window().context;
    console.log('check first context variables', test_context, ok);
    ok( test_context.first, 'it\'s a first context' );
    equal( test_context.value, 20, 'override variable default value' );
    console.log('equal( test_context.value, 20, "override variable default value" );', test_context.value == 20);
    start();
  }).fail(function(){
    ok( false, 'FAILED with arguments '+ arguments.toString() )
    start();
  });
});

module('test-context-second', {
  module_setup: function(){
    upload_context('test-context-second');
  }
});

asyncTest('check second context variables', function() {
  $.when( frame.go( context.run_test_url ) ).done(function(_$){
    var test_context = frame.window().context;
    console.log('check second context variables', test_context);
    ok( test_context.second, 'it\'s a second context' );
    equal( test_context.value, 140, 'override variable default value' );
    start();
  }).fail(function(){
    ok( false, 'FAILED with arguments '+ arguments.toString() )
  });
});

