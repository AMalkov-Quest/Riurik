module('test view');

QUnit.setup( function() {
    context.test_path = context.virtual_root.concat('/', context.test_for_testing, '?', 'editor');
});

asyncTest('virtual root is correct', function(){
  $.when( frame.go(contexter.URL(context, context.virtual_root)) ).then(function(_$){
    equal( frame.document().title, context.virtual_root, 'virtual root is working');
    start();
  });
});

asyncTest('control panel is available', function(){
  $.when( frame.go(contexter.URL(context, context.test_path))).then(function(_$){
    ok( _$('a#run').is(':visible'), 'Run button is visible' );
    
    ok( _$('a#context-preview-ctrl').is(':visible'), 'Context button is visible' );
    ok(_$('select[name=context]').length == 1, 'context select exists');
    ok(_$('select[name=context] option[value=context-1]').length == 1, 'first context option exists');
    ok(_$('select[name=context] option[value=context-2]').length == 1, 'second context option exists');
    
    ok( _$('a#save').is(':visible'), 'Save button is visible' );
    ok( _$('a#discard').is(':visible'), 'Discard button is visible' );
    ok( _$('a#close').is(':visible'), 'Close button is visible' );
    start();
  });
});