module('suite', {  
  setup: function() {
    context.test_name = 'test-for-test';
  },
  
  teardown: function() {
    stop()

    $.when( frame.go(context.url) ).then(function(_$) {
      //frame.window().dirIndexActions.remove(context.test_name);
      start()
    })
  } 
}); 

asyncTest('create new', function() { 
   
  $.when( frame.go(context.url) ).then(function(_$) {
    
    $.when( _$('a#new-test').click() ).then(function() {
      
      equal(_$('#create-dir-index-dialog').is(":visible"), true, 'dialog is visible');
            
      equal(_$('.ui-dialog-title').text(), _$('a#new-test').text(), 'dialog has right title');
      
      _$('#object-name').val(context.test_name);

      _$('button :contains(create)').click()
       
      $.when( frame.load() ).then(function(_$) {
        equal(_$('#create-dir-index-dialog').is(":visible"), false, 'dialog is invisible');
        
        $.wait( function() { return typeof frame.window().editor != 'undefined'  } ).then( function(){
          var editor = frame.window().editor; 
  
          editor.setCode("content")          
                          
          var evObj = document.createEvent('MouseEvents');
          evObj.initEvent( 'click', true, true );
          
          window.frames[0].document.getElementById('save').dispatchEvent(evObj);
               
          $.when( frame.load() ).then(function(_$) {
            var evObj = document.createEvent('MouseEvents');
            evObj.initEvent( 'click', true, true );
            window.frames[0].document.getElementById('close').dispatchEvent(evObj);  
          
           $.when( frame.load() ).then(function(_$) {             
             console.log(frame.window().editor)
  
             equal(frame.window().location.pathname,"/tests/",'editor was closed')
                              
             $.when( frame.go("/tests/"+context.test_name+".js?editor") ).then(function(_$) {               
             equal(frame.window().editor.getCode(),"content",'saved content is valid');

             start();              
            })
          })
         })
        });        
      });
    });
  });  
});