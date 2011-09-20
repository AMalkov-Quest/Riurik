module('Execute problems', {
  
  setup: function() {
    context.execute = 'testsrc/execute';
  },
  
  teardown: function() {}

});

asyncTest('Test and suite are both not specified', function() {
  $.when( frame.go( contexter.URL(context, context.execute) ) ).then(function(_$) {
    equal(_$('h1').text(), 'Error occured', 'Title is "Error occured"');
    equal(_$('.type').not('.header').text(), 'TestFileNotSpecified', 'Error type is "TestFileNotSpecified"');
    equal(_$('.message').not('.header').text(), '/testsrc/execute', 'Message argument is "/testsrc/execute"');
    equal(_$('.issue').not('.header').text(), 'No file or suite specified for testing. It should be URL GET argument: "path" or "suite"', 'Issue is "No file or suite specified for testing. It should be URL GET argument: "path" or "suite""');
    equal(_$('.stack').not('.header').text(), '', 'Stack is empty');
    start();
  });
});

asyncTest('No test is specified', function() {
  $.when( frame.go( contexter.URL(context, context.execute+'?path=') ) ).then(function(_$) {
    equal(_$('h1').text(), 'Error occured', 'Title is "Error occured"');
    equal(_$('.type').not('.header').text(), 'NoTestSpecified', 'Error type is "NoTestSpecified"');
    equal(_$('.message').not('.header').text(), '', 'Message argument is empty');
    equal(_$('.issue').not('.header').text(), 'No test specified for running', 'Issue is "No test specified for running"');
    equal(_$('.stack').not('.header').text(), '', 'Stack is empty');
    start();
  });
});

asyncTest('No suite is specified', function() {
  $.when( frame.go( contexter.URL(context, context.execute+'?suite=') ) ).then(function(_$) {
    equal(_$('h1').text(), 'Error occured', 'Title is "Error occured"');
    equal(_$('.type').not('.header').text(), 'NoSuiteSpecified', 'Error type is "NoSuiteSpecified"');
    equal(_$('.message').not('.header').text(), '', 'Message argument is empty');
    equal(_$('.issue').not('.header').text(), 'No suite specified for running', 'Issue is "No suite specified for running"');
    equal(_$('.stack').not('.header').text(), '', 'Stack is empty');
    start();
  });
});

asyncTest('Suite folder does not exists', function() {
  var suite = 'INVALID_SUITE';
  $.when( frame.go( contexter.URL(context, context.execute+'?suite='+suite) ) ).then(function(_$) {
    equal(_$('h1').text(), 'Error occured', 'Title is "Error occured"');
    equal(_$('.type').not('.header').text(), 'SuiteFolderDoesNotExists', 'Error type is "SuiteFolderDoesNotExists"');
    equal(_$('.message').not('.header').text(), '', 'Message argument is empty');
    QUnit.substring(_$('.issue').not('.header').text(), 'Suite path "'+suite+'" (at ', 'Suite path "'+suite+'" (at ');
    QUnit.substring(_$('.issue').not('.header').text(), suite+'") does not exists. Please, check this path or runner.', suite+'") does not exists. Please, check this path or runner.');
    equal(_$('.stack').not('.header').text(), '', 'Stack is empty');
    start();
  });
});

asyncTest('Test file does not exists', function() {
  var testpath = 'INVALID_TEST.JS';
  $.when( frame.go( contexter.URL(context, context.execute+'?path='+testpath) ) ).then(function(_$) {
    equal(_$('h1').text(), 'Error occured', 'Title is "Error occured"');
    equal(_$('.type').not('.header').text(), 'TestFileDoesNotExists', 'Error type is "TestFileDoesNotExists"');
    equal(_$('.message').not('.header').text(), '', 'Message argument is empty');
    QUnit.substring(_$('.issue').not('.header').text(), 'Test path "'+testpath+'" (at ', 'Suite path "'+testpath+'" (at ');
    QUnit.substring(_$('.issue').not('.header').text(), testpath+'") does not exists. Please, check this path or runner.', testpath+'") does not exists. Please, check this path or runner.');
    equal(_$('.stack').not('.header').text(), '', 'Stack is empty');
    start();
  });
});