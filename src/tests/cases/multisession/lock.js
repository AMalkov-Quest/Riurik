module('multisession locks');

QUnit.setup(function() {
  context.test_name = 'example.js';
  context.suite_name = 'multisession';
  context.suite_path = context.root.concat('/', context.suite_name);
  context.test_path = context.suite_path.concat('/',  context.test_name);
  context.URL = contexter.URL(context, context.test_path + '?editor');
  create_test( context.test_name, context.suite_path );
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
    $.waitFor.condition( function(){ return typeof _$.cookie != 'undefined'; } ).then(function(){
      ok( _$('#code').length === 1, 'editor exists' );
      context._$ = _$;
      start();
    });
  });
});

asyncTest('open file second time ', function() {
  emulateAnotherSession(context._$);
  $.when( frame.go( context.URL ) ).then(function(_$) {
    ok( _$('#code').length === 0, 'editor is not exists');
    restorePreviousSession(_$);

    start();
  });
});

QUnit.teardown(function() {
  delete_test( context.test_path );
});