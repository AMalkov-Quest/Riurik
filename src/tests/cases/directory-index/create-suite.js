module('create suite');

QUnit.setup(function() {
  context.folder_name = 'first-folder';
  context.suite_name = 'first-suite';
  context.suite_path = context.folder_name + '/' + context.suite_name;
  create_folder(context.folder_name, '/');
});

asyncTest('check created', function() {
  $.when( frame.go(contexter.URL(context, context.folder_name)) ).then(function(_$) {
    
    $.when( _$('a#new-suite').click() ).then(function() {
      
      _$('#object-name').val(context.suite_name);
      _$('#create-folder-btn').click();
      
      $.when( frame.load() ).then(function(_$) {
        equal(_$('li#'+ context.suite_name + '.folder').length, 1, 'new suite has been created');
                
        start();
      });
    });
  });
});

asyncTest('setup context', function() {
  
  $.when( frame.go(contexter.URL(context, context.folder_name)) ).then(function(_$) {
    
    window.frames[0].dirIndexActions.edit(context.suite_name);
    $.when( frame.load() ).then(function(_$) {
      equal(_$('.editbox').length, 1)
      start();
    });
    
  });
});

QUnit.teardown(function() {
  delete_folder(context.folder_name);
});