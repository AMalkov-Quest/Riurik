module('create a suite');

QUnit.asyncSetup(function() {
  context.suite_name = 'first-suite';
  context.suite_path = context.root.concat('/', context.suite_name);
  
  $.when( frame.go(contexter.URL(context, context.root)) ).then(function(_$) {
    
    $.when( _$('a#new-suite').click() ).then(function() {
      
      _$('#object-name').val(context.suite_name);
      _$('#create-folder-btn').click();
      
      $.when( frame.load() ).then(function(_$) {
        equal(_$('li#'+ context.suite_name + '.folder').length, 1, 'new folder for suite has been created');
                
        start();
      });
    });
  });
});

asyncTest('setup context for the suite', function() {
  
  $.when( frame.go(contexter.URL(context, context.root)) ).then(function(_$) {
    
    window.frames[0].dirIndexActions.edit(context.suite_name);
    $.when( frame.load() ).then(function(_$) {
      console.log(_$("body", _$('iframe').get(0).contentDocument));
      equal(_$('body', _$('.CodeMirror-wrapping iframe').get(0).contentDocument).length, 1, 'editor is opened');
      start();
    });
    
  });
});

QUnit.teardown(function() {
  delete_folder(context.suite_path);
});