asyncTest('lab setup', function() {
  stop();
  
  var ports = $.parseJSON(context.ports);
  
  with(new PowerShell(context.host)) {
    $.seq(
      function() { return invoke(NewSPWebApp, ports[0], context.user, context.password); },
      function() { return invoke(NewSPWebApp, ports[1], context.user, context.password); },
      function() { return invoke(NewSPWebApp, ports[2], context.user, context.password); },
      function() { return invoke(NewSPWebApp, ports[3], context.user, context.password); },
      function() { return invoke(NewSPWebApp, ports[4], context.user, context.password); },
      function() { return invoke(NewSPWebApp, ports[5], context.user, context.password); }
    ).then(function(){
      $.seq(
        function() { return invoke(NewRootSPTLS, sharepoint.webAppUrl(context.host, ports[1]), context.user); },
        function() { return invoke(NewRootSPTLS, sharepoint.webAppUrl(context.host, ports[2]), context.user); },
        function() { return invoke(NewRootSPTLS, sharepoint.webAppUrl(context.host, ports[3]), context.user); },
        function() { return invoke(NewRootSPTLS, sharepoint.webAppUrl(context.host, ports[4]), context.user); },
        function() { return invoke(NewRootSPTLS, sharepoint.webAppUrl(context.host, ports[5]), context.user); }
      ).then(function(){
        start();
      });
    });
  }
});
  