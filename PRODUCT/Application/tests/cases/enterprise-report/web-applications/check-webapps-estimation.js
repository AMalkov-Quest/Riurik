module('check web app updating panel', {
  setup: function() {
  }
  
});
asyncTest('check estimation time exists', function() {

  $.when( frame.go( contexter.full_url(context.report_url) ) ).then(function(_$) {
    
    _$(frame.document).bind('ReportCacheDataLoaded', function(event, data){
      var text = _$('#updatingPanel').text();
      ok( text.match('less than a minute') || text.match('%d+ min'), 'estimation time found');

      start();

    });
  });
});