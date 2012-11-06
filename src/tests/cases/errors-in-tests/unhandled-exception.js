module('unhandled exception');

QUnit.asyncSetup( function() {
  sinon.stub( riurik.matchers, "fail", function(){ start(); } );
    
  $.when(frame.go('')).then(function(_$) {
    _$('').nonfunction();
  });
});

test('should not hang a suite', function() {
  QUnit.ok( riurik.matchers.fail.calledOnce, 'the fail method should be called' );
  riurik.matchers.fail.restore();
  
});
/*
asyncTest('should not hang a suite', function() {
  $.when(frame.go('')).then(function(_$) {
    setTimeout(function () {
      _$('').trim();
      start();
    }, 100);
  });
});
*/