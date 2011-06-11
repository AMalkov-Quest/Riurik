module('create folder');

QUnit.setup(function() {
  context.folder_name = 'first-test-dir';
});

asyncTest('check created', function() {
  $.when( frame.go(contexter.URL(context, '/')) ).then(function(_$) {
    
    $.when( _$('a#new-suite').click() ).then(function() {
      
      equal(_$('#create-dir-index-dialog').is(":visible"), true, 'dialog is visible');
      equal(_$('.ui-dialog-title').text(), _$('a#new-suite').text(), 'dialog has right title');
      
      _$('#object-name').val(context.folder_name);
      _$('#create-folder-btn').click();
      
      $.when( frame.load() ).then(function(_$) {
        equal(_$('li#'+ context.folder_name + '.folder').length, 1, 'new folder has been created');
        var folder_link = _$('li#'+ context.folder_name + ' > a');
        ok(folder_link.is(":visible"), 'link to the folder is visible');
        equal(folder_link.attr('href'), context.folder_name+"/", 'link to the folder has right href');
        
        start();
      });
    });
  });
});

QUnit.teardown(function() {
  frame.window().dirIndexActions.remove(context.folder_name);
});