module('create folder');

QUnit.setup(function() {
  context.folder_name = 'first-test-dir';
  context.full_folder_path = context.root.concat('/', context.folder_name);
});

asyncTest('check created', function() {
  $.when( frame.go(contexter.URL(context, context.root)) ).then(function(_$) {
    _$('a#new-suite').click();
    equal(_$('#create-dir-index-dialog').is(":visible"), true, 'dialog is visible');
    equal(_$('.ui-dialog-title').text(), _$('a#new-suite').text(), 'dialog has right title');
    
    _$('#object-name').val(context.folder_name);
    _$('#create-folder-btn').click();
    
    $.when( frame.load() ).then(function(_$) {
      equal(_$('li#'+ context.folder_name + '.folder').length, 1, 'new folder has been created');
      var folder_link = _$('li#'+ context.folder_name + ' > a');
      ok(folder_link.is(":visible"), 'link to the folder is visible');
      equal(folder_link.attr('href'), context.folder_name + '/', 'link to the folder has right href');
      
      start();
    });
  });
});

asyncTest('error reporting', function() {
  $.when( frame.go(contexter.URL(context, context.root)) ).then(function(_$) {
    _$('a#new-suite').click()
    _$('#object-name').val(context.folder_name);
    _$('#create-folder-btn').click();
    
    $.wait( function() { return _$('#operationResult').is(":visible") }, 1000 ).then(function() {
      QUnit.substring( _$('#operationResult').text(), 'file already exists', 'dialog with error is visible');
      start();
    });
  });
});

QUnit.teardown(function() {
  delete_folder( context.full_folder_path );
});