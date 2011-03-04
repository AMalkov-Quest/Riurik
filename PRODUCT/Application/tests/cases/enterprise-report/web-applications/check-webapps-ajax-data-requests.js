module('check web app ajax data requests', {
  setup: function() {
  }
  
});
asyncTest('two concurrent requests', function() {
  
  $.when( frame.go( contexter.full_url(context.report_url ) ) ).then(function(_$) {
    
    _$( frame.document ).bind('ReportFreshDataLoaded', function(){
    
      var asyncReport = window.frames[0].asyncReport;
      
      var end1 = null;
      var gather1 = function() {
        console.log('gather1 called', asyncReport.url(context.report_url, 'gather'));
        var dfd = new $.Deferred();
        _$.getJSON(asyncReport.url(context.report_url, 'gather'), function() {
          console.log('gather1 ended');
          end1 = new Date();
          dfd.resolve(dfd);
        });
        return dfd.promise(dfd);
      };
            
      var end2 = null;
      var gather2 = function() {
        console.log('gather2 called', asyncReport.url(context.report_url, 'gather'));
        var dfd = new $.Deferred();
        _$.getJSON(asyncReport.url(context.report_url, 'gather'), function() {
          console.log('gather2 ended');
          end2 = new Date();
          dfd.resolve(dfd);
        });
        return dfd.promise(dfd);
      };

      var startDate = new Date();
      $.when( gather1(), gather2() ).then( function() {
        ok( typeof end1 != 'undefined', typeof end1 )
        ok( typeof end2 != 'undefined', typeof end2 )
        ok( Math.abs( end2 - end1 ) < 3000 , 'Both "gathering" ajax calls ends with less than 3 seconds difference: ' + Math.abs( end2 - end1 ).toString() + 'ms');
        start();
      });
      
    });
  });
});