module('multisession locks', {
  module_setup: function(){
  }
});

asyncTest('open file first time ', function(){
  $.when( frame.go( context.example_url ) ).then(function(_$){
    
    ok(_$('.CodeMirror-wrapping').length === 1, 'CodeMirror frame editor exists')
    
    start();
  });
});

asyncTest('open file first time ', function(){
  $.wait( function(){ return typeof jQuery.cookie != 'undefined'; } ).then(function(){
    QUnit.log('before', jQuery.cookie('sessionid'));
    jQuery.cookie('sessionid', '1', { 'path': '/' });
    QUnit.log('after', jQuery.cookie('sessionid'))
    $.when( frame.go( context.example_url ) ).then(function(_$){
    
      ok(_$('.CodeMirror-wrapping').length === 0, 'CodeMirror frame editor not exists')
    
      start();
    });
  });
});