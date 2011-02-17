
		var context = {
			
				webapp_port: '37608',
			
				url: 'http://sp64-2k7-u3:3141',
			
				sc_title: 'my-sc-1',
			
				sc_url: 'http://sp64-2k7-u3:37608/sites/my-sc-1',
			
				host: 'sp64-2k7-u3',
			
				user: 'UTAH\\Administrator',
			
				login: 'UTAH\Administrator',
			
				password: 'utah'
			
		};
	$(document).ready(function () {
  ps.server = context.host;
  ps.eval(NewSPWebApp, 'my_web_app'+context.webapp_port, context.webapp_port, context.user, context.password);
  ps.eval(NewSPSiteCollection, context.sc_url, context.user, context.sc_title);
});

test('create new webapp', function() {
  ps.server = 'sp64-2k7-u3';
});