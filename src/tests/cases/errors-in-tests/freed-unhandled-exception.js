module('freed unhandled exception');

QUnit.asyncSetup( function() {
  sinon.stub( riurik.matchers, "fail", function(){ start(); } );
    
  $.when(frame.go('')).then(function(_$) {
    setTimeout(function () {
      _$('').nonfunction();
    });
  });
});

test('should not hang a suite', function() {
  ok( riurik.matchers.fail.calledOnce, 'the fail method should be called' );
  $.substring( riurik.matchers.fail.args[0].toString(), 'Script error', 'argument should be' );
  
  riurik.matchers.fail.restore();
  
});