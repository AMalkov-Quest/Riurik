module('when error happens', {
      
  setup: function() {
    stop();
    
    this.report_url = context.url + '/' + context.report_url;
    with(new PowerShell(context.host)) {
      $.when( invokeLambda(StopService, 'Quest.InfoPortal.SPBrowserBroker') ).then(function(){
        start();
      });
    };
  }, 
  teardown: function() {
    this.report_url = context.url + '/' + context.report_url;
    with(new PowerShell(context.host)) {
      $.when( invokeLambda(StartService, 'Quest.InfoPortal.SPBrowserBroker') ).then(function(){
          start();
      });
    }  
  }
  
});

asyncTest('it should be shown', function() {
      $.when( frame.go( this.report_url ) ).then(function(_$) {
        $.wait(dataGatheringDone, 20000).then(function() { 
          ok( _$('#ent-trend-errors:visible').length > 0, 'Error panel is shown' );
          var errorCount = _$('#ent-trend-errors:visible:last').children().length;
          ok( errorCount > 0, 'Error panel contains '+errorCount+' errors' );
          
          // checking that after F5 (page refresh) there is no errors
          $.when( frame.go( this.report_url ) ).then(function(){
            var errorCount = _$('#ent-trend-errors:visible:last').children().length;
            ok( errorCount == 0, 'Error panel contains no errors after page refreshing' );  
            
            start();
          });
          
        });
      });
});