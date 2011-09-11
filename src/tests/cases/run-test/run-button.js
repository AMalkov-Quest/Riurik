module('run button');

asyncTest('run interface', function(){
  var URL = contexter.URL(context, context.root.concat('/run-test/example1.js?editor'));
  $.when( frame.go( URL ) ).then(function(_$){
    ok(_$('#run').length == 1, 'run button exists');
    ok(_$('select[name=context]').length == 1, 'context select exists');
    ok(_$('select[name=context] option[value=context-1]').length == 1, 'first context option exists');
    ok(_$('select[name=context] option[value=context-2]').length == 1, 'second context option exists');
    
    _$('select[name=context]').val('context-2');
    var runButton = frame.document().getElementById('run');
    var evObj = frame.document().createEvent('MouseEvents');
    evObj.initEvent( 'click', true, true );
    runButton.dispatchEvent(evObj);
    ok(false, 'TODO ...');
    
    start();
  });
});