riurik.engine = {}

riurik.engine.init = function( next ){
	riurik.trigger( "riurik.engine.initing" );
	
	$('#frame-container').remove();
	
	riurik.loader()
	.queue('/static/bootstrap/js/bootstrap.js')
	.queue('/static/showdown/dist/showdown.js')
	.queue('/static/engines/daspec/daspec-web.js')
	.queue('/static/engines/daspec/daspec.html.js')
	.then(function() {
		$.extend(riurik.exports);
		riurik.engine.config();
		load_remote_style('/static/engines/daspec/daspec.css');
		load_remote_style('/static/bootstrap/css/bootstrap.css');
		riurik.trigger( "riurik.engine.inited" );
		next();
	});
};

riurik.load_tests = function(){
	console.log('load daspec test ' + riurik.args.path);
	'use strict';
	//riurik.loader().queue(riurik.args.path.replace(/daspec$/, 'js')).then(function() {
	//	riurik.engine.run_tests();
	//});
	$.ajax({ 
		url: riurik.args.path.replace(/daspec$/, 'js'), 
		success: function(jscode){
			var defineSteps = function() {
				eval(jscode);
			};
			riurik.engine.run_tests(defineSteps);
		}, 
		dataType: 'text'
	});
};

riurik.engine.run_tests = function(defineSteps) {
	console.log('start daspec tests...');
	$.ajax({ 
		url: riurik.args.path, 
		success: function(markdown){
			var runner = new DaSpec.Runner(defineSteps);
			var counter = new DaSpec.CountingResultListener(runner);
			var resultFormatter = new DaSpec.MarkdownResultFormatter(runner);
		
			runner.execute(markdown).then(function () {
				var converter = new showdown.Converter({simplifiedAutoLink: true, strikethrough: true, ghCodeBlocks: true, tables: true})
				$('#outputArea').html(converter.makeHtml(resultFormatter.formattedResults()));
				//$('#outputArea').html(resultFormatter.formattedResults());
			});
		}, 
		dataType: 'text'
	});
	
};

riurik.engine.config = function() {
	
};

$.extend(riurik.exports);
