module('demo');

asyncTest('create suite button', function() {
  $.when(frame.go('riurik-inner-tests')).then(function() {
    equal(_$('#new-suite').text(), 'Create Suite');
    _$('#new-suite').click();
    equal(_$('.ui-dialog-title').text(), 'Create Suite');
    equal(_$('#fsobject-tip').text(), 'Specify a suite name here');
    equal(_$('#create-folder-btn').text(), 'create');
    
    _$('#object-name').val('second-suite');
    _$('#create-folder-btn').click();
    
    $.when(frame.load()).then(function() {
      ok(_$('li#second-suite.folder').length > 0, 'new suite is created successfully');
      
      start();
    });
  });
});