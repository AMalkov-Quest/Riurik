(function(){
	window.frame = {
		go: function(path, cache) {
			var dfd = $.Deferred();
			var url = path;
			var regex = new RegExp('^http://[a-zA-Z0-9]');
			if(!regex.test(url)) {
				url = 'http://' + context.host + ':' + context.port + '/' + path;
			}

			if( !(cache === true) ) {
				if (url.indexOf('?') != -1) {
					url += '&_=' + Math.random().toString();
				}else{
					url += '?_=' + Math.random().toString();
				}
			}
			
			if( window.frames[0].window ) {
				window.frames[0].window.onerror = function(){};
			}
			$('#frame').attr('src', url);
			$('#frame-url').html('<a href="'+url+'">'+url+'</a>');
			$('#frame').unbind('load');
			$('#frame').load(function() {
				var __frame = window.frames[0];
				__frame.window.onerror = riurik.wrapErrorHandler( __frame.window.onerror, riurik.onErrorHandler );

				if( ! __frame.window.jQuery ) {
					// inject one
					var d = __frame.document;
					var j = d.createElement('script');
					j.type='text/javascript';
					//j.src = /^(.*?)[^\/]*\?/.exec(window.location)[1] + $("head script[src*='jquery.min.js']").attr('src');
					j.src = riurik.src.jquery;
					d.head.appendChild(j);
				}

				$.waitFor.condition( 
					function () { return typeof __frame.window.jQuery != 'undefined'; } ,
					5*1000
				).then(function(){
					window._$ = __frame.window.jQuery;
					if( __frame.window.jQuery ) {
						//jQExtend(__frame.window.jQuery);
						__frame.window.jQuery.extend(riurik.exports);
					} else {
						QUnit.ok(false, 'there is no JQuery and it\'s not injected');
					}
					dfd.resolve(__frame.window.jQuery);
				});
			});

			return dfd.promise();
		},

		load: function() {
			var dfd = $.Deferred();

			$('#frame').load(function() {
				dfd.resolve(window.frames[0].window.jQuery);
			});

			return dfd.promise();
		},

		println: function(message) {
			var regexp = new RegExp('\\n', 'gi');
			var html = message.replace(regexp, '<br>')+'<hr/>';
			$('#powershell-console').prepend(html);
			
		},

		console_complete: function(){
			frame.__console_timeout = setTimeout(function(){
				$('#tabs-2-loading').hide();
			}, 500);
			$('#tabs-2').parent().attr('title', '');
		},

		console_working: function(title){
			if ( frame.__console_timeout ) { clearTimeout(frame.__console_timeout) }
			$('#tabs-2').parent().attr('title', title);
			$('#tabs-2-loading').show();
		},

		jQuery: function() {
			return window.frames[0].window.jQuery;
		},
		document: function(){
			return window.frames[0].document;
		},
		window: function(){
			return window.frames[0].window;
		}
	};
})();

