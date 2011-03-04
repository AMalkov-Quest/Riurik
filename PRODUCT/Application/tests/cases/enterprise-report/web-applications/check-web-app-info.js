module('check web app info', {
      
  setup: function() {
    
    stop();
    
    this.report_url = context.url + '/' + context.report_url;
    this.ports = $.parseJSON(context.ports);
    context.port = this.ports[1];
    context.webapp = sharepoint.webAppUrl(context.host, context.port);
    context.sitecol1 = sharepoint.SCUrl(context.host, context.port, 'my-sc-1');
    context.sitecol2 = sharepoint.SCUrl(context.host, context.port, 'my-sc-2');
    context.file = 'C:\\file-to-upload.bin';
    context.size = '2.8 MB';
    context.sc_count = 1;
    
    var ps = new PowerShell(context.host);
    
    $.seq(
      ps.invokeLambda(NewSPSiteCollection, context.sitecol1, context.user, 'my-sc-1'),
      ps.invokeLambda(NewSPSiteCollection, context.sitecol2, context.user, 'my-sc-2')
    )
      .then(function() {
        context.sc_count += 2;
        
        $.seq(
          ps.invokeLambda(CreateSite, sharepoint.SCUrl(context.host, context.port, 'my-sc-1'), "my-site-1"),
          ps.invokeLambda(CreateFile, context.file, 1)
        ).then(function() {
            context.site_count = context.sc_count + 1;
            $.when( ps.invoke(UploadFileTo, context.sitecol1, "Shared Documents", context.file) )
              .then(function(_$) {
                start();
              });
        });
    });
  }
  
});

asyncTest('', function() {
  var ports = this.ports;
  
  $.when( frame.go( this.report_url ) ).then(function(_$) {
  
    $.wait( dataGatheringDone, 20000 ).then(function() {
        var webAppRow = _$('a[href=' + context.webapp + ']').parents('.list-item');
        QUnit.rowEqual(
          _$('> div', webAppRow).not(':first'), [context.size, '1', '1', context.site_count, context.sc_count],
          context.webapp
        );
        
        start();
      });
    
  });
});