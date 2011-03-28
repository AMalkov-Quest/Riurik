module('suite', {  
  setup: function() {
    context.suite_name = 'suite-for-test';
    console.log('module is started');
  },
  
  teardown: function() {
    stop()

    $.when( frame.go(context.url) ).then(function(_$) {
      frame.window().dirIndexActions.remove(context.suite_name);
      start()
    }                                                                                 )           
    console.log('module is done');
  }
});

asyncTest('create new', function() {
   
  console.log('test 1');
  $.when( frame.go(context.url) ).then(function(_$) {
    
    $.when( _$('a#new-suite').click() ).then(function() {
      
      equal(_$('#create-dir-index-dialog').is(":visible"), true, 'dialog is visible');
            
      equal(_$('.ui-dialog-title').text(), _$('a#new-suite').text(), 'dialog has right title');
      
      _$('#object-name').val(context.suite_name);

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
  
             equal(frame.window().location.pathname,"/tests/"+context.suite_name+"/","editor was closed")
                              
             $.when( frame.go("/tests/"+context.suite_name+"/.context.ini?editor") ).then(function(_$) {               
             equal(frame.window().editor.getCode(),"content","saved content is valid");

             start();              
            })
          })
         })
        });        
      });
    });
  });  
});