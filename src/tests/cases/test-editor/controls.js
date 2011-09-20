module('editor controls');

QUnit.setup( function() {
    context.test_path = context.virtual_root.concat('/', context.test_for_testing, '?', 'editor');
    context.ini_path = context.virtual_root.concat('/', context.context_for_testing, '?', 'editor');
});

asyncTest('virtual root is correct', function(){
  $.when( frame.go(contexter.URL(context, context.virtual_root)) ).then(function(_$){
    equal( frame.document().title, context.virtual_root, 'virtual root is working');
    start();
  });
})

asyncTest('editor with test', function(){
  $.when( frame.go(contexter.URL(context, context.test_path))).then(function(_$){
    ok( _$('a#run').is(':visible'), 'Run button is visible' );
    ok( _$('a#context-preview-ctrl').is(':visible'), 'Context button is visible' );
    ok( _$('a#save').is(':visible'), 'Save button is visible' );
    ok( _$('a#discard').is(':visible'), 'Discard button is visible' );
    ok( _$('a#close').is(':visible'), 'Close button is visible' );
    start();
  });
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