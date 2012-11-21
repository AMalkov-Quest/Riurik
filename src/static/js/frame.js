(function(){
	window.frame = {
		go: function(path, cache) {
			var dfd = $.Deferred();
			var url = path;
			var regex = new RegExp('^http://[a-zA-Z0-9]');
			if(!regex.test(url)) {
				url = 'http://' + context.host + ':' + context.port + '/' + path;
			}
			window.frame.location = url;

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
		// this should be removed, instead use waitFor.frame
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
			var _frame = window.frames[0];
			riurik.log("Frame is loaded for " + window.frame.location);
			_frame.window.onerror = riurik.wrapErrorHandler( _frame.window.onerror, riurik.onErrorHandler );

			function done() {
				if( _frame.window.jQuery ) {
					_frame.window.jQuery.extend(riurik.exports);
					window._$ = _frame.window.jQuery;
				} else {
					riurik.matchers.fail('there is no JQuery and it\'s not injected');
				}
				callback(_frame.window.jQuery);
			}

			function jQueryIsLoaded() {
				return typeof _frame.window.jQuery != 'undefined';
			}

			$.waitFor.condition( jQueryIsLoaded, 1000 )
			.then(done, function() {
				riurikldr.LoadScript( riurik.src.jquery, done, _frame.document );				
			});
		},

		println: function(message) {
			var regexp = new RegExp('\\n', 'gi');
			var html = message.replace(regexp, '<br>')+'<hr/>';
			$('#powershell-console').prepend(html);
			
		},

		console_complete: function(){
			frame.__console_timeout = setTimeout(function(){
				$('#status-text').removeClass('in-progress');
			}, 500);
		},

		console_working: function(title){
			if ( frame.__console_timeout ) { clearTimeout(frame.__console_timeout) }
			$('#status-text').addClass('in-progress');
		},

		jQuery: function() {
			return window.frames[0].window.jQuery;
		},
		document: function(){
			return window.frames[0].document;
		},
		window: function(){
			return window.frames[0].window;
		},
		location: function(){
			return self.location;
		}
	};
})();

