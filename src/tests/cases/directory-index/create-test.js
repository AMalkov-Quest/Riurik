module('creat test'); 

QUnit.asyncSetup(function(){
  context.test_name = 'test-for-test';
  context.suite_name = 'first-suite';
  context.suite_path = context.root.concat('/', context.suite_name);
  
  $.when( frame.go(contexter.URL(context, context.root)) ).then(function(_$) {
    
    $.when( _$('a#new-suite').click() ).then(function() {
      
      _$('#object-name').val(context.suite_name);
      _$('#create-folder-btn').click();
      
      $.when( frame.load() ).then(function(_$) {
        equal(_$('li#'+ context.suite_name + '.folder').length, 1, 'new folder for suite has been created');
        window.frames[0].dirIndexActions.edit(context.suite_name);        
        start();
      });
    });
  });
});

asyncTest('check created', function() { 
   
  $.when( frame.go(contexter.URL(context, context.suite_path)) ).then(function(_$) {
    
    $.when( _$('a#new-test').click() ).then(function() {
      
      equal(_$('#create-dir-index-dialog').is(":visible"), true, 'dialog is visible');      
      equal(_$('.ui-dialog-title').text(), _$('a#new-test').text(), 'dialog has right title');
      _$('#object-name').val(context.test_name.concat('.js'));
      _$('button :contains(create)').click()
       
      $.when( frame.load() ).then(function(_$) {
        equal(_$('#create-dir-index-dialog').is(":visible"), false, 'dialog is invisible');
        
        $.wait( function() { return typeof frame.window().editor != 'undefined'  } ).then( function(){
          var editor = frame.window().editor; 
  
          editor.setValue("content")          
                          
          var evObj = document.createEvent('MouseEvents');
          evObj.initEvent( 'click', true, true );
          
          window.frames[0].document.getElementById('save').dispatchEvent(evObj);
              
          $.when( frame.load() ).then(function(_$) {
            
          start();
         });
        });        
      });
    });
  });  
});

QUnit.teardown(function() {
  delete_folder(context.suite_path);
});