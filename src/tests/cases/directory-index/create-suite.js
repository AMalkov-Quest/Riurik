module('suite', {
  
  setup: function() {
    context.suite_name = 'first-test-suite';
    console.log('module is started');
  },
  
  teardown: function() {
    //frame.window().dirIndexActions.remove(context.suite_name);
    console.log('module is done');
  }
});

asyncTest('create new', function() {
  console.log('test 1');
  $.when( frame.go(context.url) ).then(function(_$) {
    
    $.when( _$('a#new-suite').click() ).then(function() {
      
      equal(_$('#create-dir-index-dialog').is(":visible"), true, 'dialog is visible');
      start();
            
      equal(_$('.ui-dialog-title').text(), _$('a#new-suite').text(), 'dialog has right title');
      
      _$('#object-name').val(context.suite_name);
      //_$('#create-folder-btn').click();
      _$('button :contains(create)').click()

        
        console.log('111111111');      
      $.when( frame.load() ).then(function(_$) {
        console.log('222222');        
        //equal(_$('li#'+ context.suite_name + '.suite').length, 16, 'new folder has been created');
        
        $.wait( function() { return typeof frame.window().editor != 'undefined'  } ).then( function(){
           var editor = frame.window().editor; 
                  console.log('4444444');   
           editor.setCode("content")
          
             console.log(_$("#close"))     
                          
          var evObj = document.createEvent('MouseEvents');
          evObj.initEvent( 'click', true, true );
          
          window.frames[0].document.getElementById('save').dispatchEvent(evObj);
               
           start();
        });        
        
        console.log('3333333333');        
        //var folder_link = _$('li#'+ context.suite_name + ' > a');
        //ok(folder_link.is(":visible"), 'link to the folder is visible');
        //equal(folder_link.attr('href'), context.folder_name, 'link to the folder has right href');
        

      });
      
      
    });
  });
});