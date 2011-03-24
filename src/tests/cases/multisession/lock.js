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

asyncTest('open file second time ', function(){
  $.wait( function(){ return typeof jQuery.cookie != 'undefined'; } ).then(function(){
    var was = jQuery.cookie('sessionid');
    QUnit.log('before', was);
    jQuery.cookie('sessionid', '', { 'path': '/' });
    QUnit.log('after', jQuery.cookie('sessionid'))
    $.when( frame.go( context.example_url ) ).then(function(_$){
    
      ok(_$('.CodeMirror-wrapping').length === 0, 'CodeMirror frame editor not exists')
      
      $.cookie('sessionid', was, { 'path': '/' });
      QUnit.log('restoring sessionid', jQuery.cookie('sessionid'))
      start();
    });
  });
});