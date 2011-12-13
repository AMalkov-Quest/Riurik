module('context view');

QUnit.setup( function() {
    context.ini_path = context.virtual_root.concat('/', context.context_for_testing, '?', 'editor');
});

asyncTest('editor with .context.ini file', function(){
  $.when( frame.go(contexter.URL(context, context.ini_path))).then(function(_$){
    ok( ! _$('a#run').is(':visible'), 'Run button is NOT visible' );
    ok( ! _$('a#context-preview-ctrl').is(':visible'), 'Context button is NOT visible' );
    ok( _$('a#save').is(':visible'), 'Save button is visible' );
    ok( _$('a#discard').is(':visible'), 'Discard button is visible' );
    ok( _$('a#close').is(':visible'), 'Close button is visible' );
    start();
  });
});
