riurik.engine = {}

riurik.engine.init = function( next ){
	riurik.trigger( "riurik.engine.initing" );
	
	$('#frame-container').remove();
	
	riurik.loader()
	.queue('/static/engines/daspec/daspec-web.js')
	.queue('/static/engines/daspec/daspec.html.js')
	.then(function() {
		$.extend(riurik.exports);
		riurik.engine.config();
		load_remote_style('/static/engines/daspec/daspec.css');
		riurik.trigger( "riurik.engine.inited" );
		next();
	});
};

riurik.load_tests = function(){
	console.log('load daspec test ' + riurik.args.path);
	
	riurik.engine.run_tests();
};

riurik.engine.run_tests = function() {
	console.log('start daspec tests...');
	$.ajax({ 
		url: riurik.args.path, 
		success: function(markdown){ 
			
			riurik.loader().queue(riurik.args.path.replace(/daspec$/, 'js')).then(function() {
				var runner = new DaSpec.Runner(riurik.engine.steps_definition),
					resultFormatter = new DaSpec.MarkdownResultFormatter(runner);
			
				runner.execute(markdown);
				
				$('#outputArea').html(resultFormatter.formattedResults()); 
			});
		}, 
		dataType: 'text'
	});
	
};

riurik.engine.config = function() {
	
};

$.extend(riurik.exports);
