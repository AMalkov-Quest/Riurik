
		var context = {
			
				host: 'sp-2k10-u1',
			
				report_url: '/enterprise/webapps',
			
				user: 'UTAH\\Administrator',
			
				timeout: 60000,
			
				url: 'http://sp-2k10-u1:3141',
			
				login: 'UTAH\Administrator',
			
				password: 'utah',
			
				ports: [41601,41602,41603,41604,41605,41606],
				
				include: [
					'check-webapps-csv-export.js', 
					'check-webapps-estimation.js'
				]
			
		};
	