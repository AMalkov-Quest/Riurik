module('multisession locks');

QUnit.setup(function() {
  with(context) {
    context.test_name = 'example.js';
    context.suite_name = 'multisession';
    context.suite_path = root.concat('/', suite_name);
    context.test_path = suite_path.concat('/',  test_name);
    context.URL = contexter.URL(context, context.test_path + '?editor');
    create_test( test_name, suite_path );
  }
});

function emulateAnotherSession(_$) {
  //emulate that the test is open in another browser window
  context.sessionid = _$.cookie('sessionid');
  _$.cookie('sessionid', '', { 'path': '/' });
}

function restorePreviousSession(_$) {
  _$.cookie('sessionid', context.sessionid, { 'path': '/' });
}

asyncTest('open file first time ', function(){
  $.when( frame.go( context.URL ) ).then(function(_$){
    $.wait( function(){ return typeof _$.cookie != 'undefined'; } ).then(function(){
      ok(_$('.CodeMirror-wrapping').length === 1, 'CodeMirror frame editor exists');
      context._$ = _$;
      start();
    });
  });
});

asyncTest('open file second time ', function() {
  emulateAnotherSession(context._$);
  $.when( frame.go( context.URL ) ).then(function(_$) {
    ok(_$('.CodeMirror-wrapping').length === 0, 'CodeMirror frame editor not exists');
    restorePreviousSession(_$);

    start();
  });
});

QUnit.teardown(function() {
  delete_test( context.test_path );
});