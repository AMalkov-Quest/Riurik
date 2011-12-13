module('test view');

function mock(fn, handler, callsuccess) {
  return function(){
    var url = arguments[0].url;
    console.log('AJAX:', url, arguments);
    var ret =  handler.apply(handler, arguments);
    if ( ret == false ) {
      return fn.apply(this, arguments);
    }
    if ( callsuccess ) arguments[0].success(ret, '200 OK');
    return ret;
  };
};

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
    ok( _$('a#save').is(':visible'), 'Save button is visible' );
    ok( _$('a#discard').is(':visible'), 'Discard button is visible' );
    ok( _$('a#close').is(':visible'), 'Close button is visible' );
    start();
  });
});

asyncTest('Run button sends a valid request', function(){
  $.when( frame.go(contexter.URL(context, context.test_path))).then(function(_$){
    console.log(_$('form#apply-test').get(0), _$('form#apply-test').get(0).submit);
    _$.fn.serializeObject = $.fn.serializeObject;
    _$('form#apply-test').get(0).submit = function(){
      var o = _$('form#apply-test').serializeObject();
      console.log(o);
      equal(o.path, "riurik-inner-tests/suite-for-testing/first-test.js", 'PATH is OK');
      equal(o.url, "/riurik-inner-tests/suite-for-testing/first-test.js", 'URL is OK');
      equal(o.context, "localhost", 'Context is OK');
      ok(o.content.length > 0, 'Content is not empty');
      equal(_$('form#apply-test').attr('action'), "/actions/test/submit/", 'form action');
      equal(_$('form#apply-test').attr('target'), "first-test.js", 'form target');
      _$('form#apply-test').get(0).submit = function(){ return false; };
      start();
      return false;
    };
    simulateClick('run', 'click');
  });
});

asyncTest('Context button sends a valid request', function(){
  $.when( frame.go(contexter.URL(context, context.test_path))).then(function(_$){
    _$.ajax = mock(_$.ajax, function(){ 
      QUnit.substring(arguments[0].url, 'show_context', 'correct URL');
      start();
      return true;
    });
    simulateClick('context-preview-ctrl', 'click');
  });
});


asyncTest('Save button sends a valid request', function(){
  $.when( frame.go(contexter.URL(context, context.test_path))).then(function(_$){
    console.log(_$('form#apply-test').get(0), _$('form#apply-test').get(0).submit);
    _$.fn.serializeObject = $.fn.serializeObject;
    _$('form#apply-test').get(0).submit = function(){
      var o = _$('form#apply-test').serializeObject();
      console.log(o);
      equal(o.path, "riurik-inner-tests/suite-for-testing/first-test.js", 'PATH is OK');
      equal(o.url, "/riurik-inner-tests/suite-for-testing/first-test.js", 'URL is OK');
      equal(o.context, "default", 'Context is OK');
      ok(o.content.length > 0, 'Content is not empty');
      equal(_$('form#apply-test').attr('action'), "/actions/test/save/", 'form action');
      equal(_$('form#apply-test').attr('target'), "", 'form target is null');
      _$('form#apply-test').get(0).submit = function(){ return false; };
      start();
      return false;
    };
    simulateClick('save', 'click');
  });
});
