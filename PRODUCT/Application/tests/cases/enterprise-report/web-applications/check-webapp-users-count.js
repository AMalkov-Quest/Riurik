module('check web app users', {
      
  setup: function() {
    stop();
    
    context.ports = $.parseJSON(context.ports);
    context.port = context.ports[0];


    context.webapp = sharepoint.webAppUrl(context.host, context.port);
    context.sitecol1 = sharepoint.SCUrl(context.host, context.port, 'my-sc-1');
    context.sitecol2 = sharepoint.SCUrl(context.host, context.port, 'my-sc-2');
    context.db = 'WSS_content_' + Math.floor( Math.random() * 1000000000 ).toString();
    context.viewer = 'UTAH\\aokhotin';
    context.user1 = 'UTAH\\kopylov';
    context.user2 = 'UTAH\\amalkov';
    context.content_size = '1.1 MB';

    var ps = new PowerShell(context.host);
    
          
    $.seq(               
      ps.invokeLambda(NewSPSiteCollection, context.sitecol1, context.user, 'my-sc-1'),        
      ps.invokeLambda(CreateSiteCollectionNewDB, context.webapp, context.sitecol2, 'my-sc-2', context.user, context.host, context.db)
    )
      .then(function() {
        context.sc_count = 2;
        context.site_count = 2;
        context.db_count = 2;
        context.user_count = 1;
        
        $.seq( 
          ps.invokeLambda(AddUserToSite, context.sitecol1, context.viewer, "Viewers"),
          ps.invokeLambda(AddUserToSite, context.sitecol2, context.viewer, "Viewers"),
          ps.invokeLambda(AddUserToSite, context.sitecol1, context.user1, "Viewers"),
          ps.invokeLambda(AddUserToSite, context.sitecol2, context.user2, "Viewers")
          ).then(function(_$) {
          context.user_count += 3;      
          start();
          });
      });
  }
  
});

asyncTest('', function() {
  $.when( frame.go( context.url + '/' + context.report_url ) ).then(function(_$) {
  
    $.wait( dataGatheringDone, 20000 ).then(function() {
        var webAppRow = _$('a[href=' + context.webapp + ']').parents('.list-item');
        QUnit.rowEqual(
          _$('> div', webAppRow).not(':first'), [context.content_size, context.user_count, context.db_count, context.site_count, context.sc_count],
          context.webapp
        );
        
        start();
      });
    
  });
});