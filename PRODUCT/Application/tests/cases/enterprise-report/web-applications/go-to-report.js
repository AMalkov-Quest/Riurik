module('show the report', {
      
  setup: function() {
    
  }
  
});

asyncTest('check link to the report', function() {
  $.when( frame.go( context.url ) ).then(function(_$) {
    $.wait( function() { return _$('#WebApp #updatingPanel').length == 0 && _$('#WebApp tr').length > 0; }, 30000 ).then( function() {
      var link = _$('#WebApp a[href=' + context.report_url +']');
      ok( link.is(':visible'), "'" + link.text() + "' link is visible" );
    
      start();
    });
  });
});

asyncTest('check all web apps are shown and unique', function() {
  $.when( frame.go( contexter.full_url(context.report_url ) ) ).then(function(_$) {
    
    $.wait(dataGatheringDone, 20000).then(function() { 
      
      $(context.ports).each(function(i, port){
        var webAppURL = contexter.webAppUrl(context.host, port);
        ok( _$('a[href=' + webAppURL + ']').length == 1, webAppURL + ' exists');
      });
      
      start();
    });
  });
});