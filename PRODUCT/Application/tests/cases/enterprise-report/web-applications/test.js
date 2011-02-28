
		var context = {
			
				webapp_port: '37602',
			
				url: 'http://sp64-2k7-u3:3141',
			
				sc_title: 'my-sc-1',
			
				sc_url: 'http://sp64-2k7-u3:37602/sites/my-sc-1',
			
				host: 'sp64-2k7-u3',
			
				user: 'UTAH\\Administrator',
			
				login: 'UTAH\Administrator',
			
				password: 'utah'
			
		};
	module("web apps enterprise report", {
  
  setup: function() {
    ps.server = context.host;
    //ps.eval(NewSPWebApp, 'my_web_app'+context.webapp_port, context.webapp_port, context.user, context.password);
    //ps.eval(NewSPSiteCollection, context.sc_url, context.user, context.sc_title);
  }
});

asyncTest('check wait', function() {
  $.when( frame.go( context.url + '/enterpise/webapps') ).then(function(_$) {
    $.wait( function() {
      if ( _$('#ent-web-apps-list li').not('li.header').length == 3 ) return true;
    }).then( function() {
      equal( _$('#ent-web-apps-list li').not('li.header').length, 3 );
      
      start();
    });
  });
});