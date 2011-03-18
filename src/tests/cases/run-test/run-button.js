asyncTest('run interface', function(){
  var url = context.url + '/run-test/example.js?editor'
  $.when( frame.go( url ) ).then(function(_$){
    ok(_$('#run').length == 1, 'run button exists');
    ok(_$('select[name=context]').length == 1, 'context select exists');
    ok(_$('select[name=context] option[value=test-context]').length == 1, 'test context option exists');
    start();
  });
});

asyncTest('running', function(){
  var url = context.url + '/run-test/example.js?editor'
  $.when( frame.go( url ) ).then(function(_$){
    
    _$('select[name=context]').val('test-context');
    console.log(_$('#run'));
    var runButton = frame.document().getElementById('run');
    var evObj = document.createEvent('MouseEvents');
    evObj.initEvent( 'click', true, true );
    runButton.dispatchEvent(evObj);
    
    start();
  });
});