module('Upload problems', {
  
  setup: function() {
    context.upload = 'testsrc/upload';
  },
  
  teardown: function() {}

});

asyncTest('No path specified for upload', function() {
  var path = '', content = 'abcd';
  $.when( frame.go( contexter.URL(context, context.upload+'?path='+path+'&content='+content) ) ).then(function(_$) {
    equal(_$('h1').text(), 'Error occured', 'Title is "Error occured"');
    equal(_$('.type').not('.header').text(), 'NoPathSpecifiedForUpload', 'Error type is "NoPathSpecifiedForUpload"');
    equal(_$('.message').not('.header').text(), '', 'Message argument is empty');
    equal(_$('.issue').not('.header').text(), 'No argument PATH specified in request.', 'No argument PATH specified in request.');
    equal(_$('.stack').not('.header').text(), '', 'Stack is empty');
    start();
  });
});

asyncTest('No test content specified for upload', function() {
  var path = '/', content = '';
  $.when( frame.go( contexter.URL(context, context.upload+'?path='+path+'&content='+content) ) ).then(function(_$) {
    equal(_$('h1').text(), 'Error occured', 'Title is "Error occured"');
    equal(_$('.type').not('.header').text(), 'NoContentSpecifiedForUpload', 'Error type is "NoContentSpecifiedForUpload"');
    equal(_$('.message').not('.header').text(), '', 'Message argument is empty');
    equal(_$('.issue').not('.header').text(), 'No content received from request POST.', 'No content received from request POST.');
    equal(_$('.stack').not('.header').text(), '', 'Stack is empty');
    start();
  });
});


asyncTest('Error while creating folders while uploading', function() {
  var folder = '/1234/567';
  var path = folder+'/1.js', content = 'abcd';
  $.when( frame.go( contexter.URL(context, context.upload+'?path='+path+'&content='+content) ) ).then(function(_$) {
    equal(_$('h1').text(), 'Error occured', 'Title is "Error occured"');
    equal(_$('.type').not('.header').text(), 'ErrorCreatingFolders', 'Error type is "ErrorCreatingFolders"');
    equal(_$('.message').not('.header').text(), folder, 'Message argument is "'+folder+'"');
    QUnit.substring(_$('.issue').not('.header').text(), 'Error while creating folders "'+folder+'". Failed with exception', 'Error while creating folders "'+folder+'". Failed with exception');
    QUnit.substring(_$('.issue').not('.header').text(), 'Permission denied', 'Permission denied');
    equal(_$('.stack').not('.header').text(), '', 'Stack is empty');
    start();
  });
});

asyncTest('Error writing test content while uploading', function() {
  var path = '/1.js', content = 'abcd';
  $.when( frame.go( contexter.URL(context, context.upload+'?path='+path+'&content='+content) ) ).then(function(_$) {
    equal(_$('h1').text(), 'Error occured', 'Title is "Error occured"');
    equal(_$('.type').not('.header').text(), 'ErrorWritingFile', 'Error type is "ErrorWritingFile"');
    equal(_$('.message').not('.header').text(), path, 'Message argument is "'+path+'"');
    QUnit.substring(_$('.issue').not('.header').text(), 'Error while writing test content to file "'+path+'". Failed with exception', 'Error while writing test content to file "'+path+'". Failed with exception');
    QUnit.substring(_$('.issue').not('.header').text(), 'Permission denied', 'Permission denied');
    equal(_$('.stack').not('.header').text(), '', 'Stack is empty');
    start();
  });
});

