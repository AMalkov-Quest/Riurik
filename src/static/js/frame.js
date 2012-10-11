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
				var randurl;
				if (url.indexOf('?') != -1) {
					randurl = '&_=' + Math.random().toString();
				}else{
					randurl = '?_=' + Math.random().toString();
				}
				if (url.indexOf('#') != -1) {
					url = url.split( '#' ).join( randurl+'#' )
				} else {
					url += randurl
				}
			}
			
			if( window.frames[0].window ) {
				window.frames[0].window.onerror = function(){};
			}
			riurik.log("Frame is loading " + url + " ...");
			$('#frame').attr('src', url);
			$('#frame-url').html('<a href="'+url+'">'+url+'</a>');
			$('#frame').unbind('load');
			$('#frame').load(function() {
				frame.init(function(_$) {
					dfd.resolve(_$);
				});
			});

			return dfd.promise();
		},

		load: function() {
			var dfd = $.Deferred();
			riurik.log("The Frame loading awaiting ...")
			$('#frame').unbind('load');
			
			var frame_timeout = setTimeout( function(){
				riurik.log('Wait timeout for the Frame loading is exceeded');
				dfd.reject();
			}, 20000);
			
			$('#frame').load(function() {
				clearTimeout(frame_timeout);
				frame.init(function(_$) {
					dfd.resolve(_$);
				});
			});

			return dfd.promise();
		},
		
		init: function(callback) {
			var __frame = window.frames[0];
			riurik.log("Frame is loaded for " + __frame.window.location);
			__frame.window.onerror = riurik.wrapErrorHandler( __frame.window.onerror, riurik.onErrorHandler );

			if( ! __frame.window.jQuery ) {
				var doc = __frame.document;
				var el = doc.createElement('script');
				el.type='text/javascript';
				el.src = riurik.src.jquery;
				doc.head.appendChild(el);
			}

			$.waitFor.condition( 
				function () { return typeof __frame.window.jQuery != 'undefined'; } ,
				5*1000
			).then(function(){
				window._$ = __frame.window.jQuery;
				if( __frame.window.jQuery ) {
					__frame.window.jQuery.extend(riurik.exports);
				} else {
					riurik.matchers.fail('there is no JQuery and it\'s not injected');
				}
				callback(__frame.window.jQuery);
			});
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

