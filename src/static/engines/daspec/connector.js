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
	$.ajax({ 
		url: riurik.args.path, 
		success: function(markdown){
			if(riurik.context.server_side){
			    riurik.engine.run_tests_server_side(markdown);
			}else{
		        riurik.engine.run_tests(markdown);
			} 
		}, 
		dataType: 'text'
	});
};

riurik.engine.run_tests_server_side = function(markdown) {
    console.log('start daspec tests server side ...');
    var converter = new showdown.Converter({simplifiedAutoLink: true, strikethrough: true, ghCodeBlocks: true, tables: true})
    $('#page-content').html(converter.makeHtml(markdown));
    
    $.post(
        '/actions/nodejs/run/', 
        { specs: riurik.args.path, steps: riurik.args.path.replace(/daspec$/, 'js') }, 
        function(data){
            markdownResult = data['result'];
            $('#page-content').html(converter.makeHtml(markdownResult));  
        },
        "json"
    );
    
};

riurik.engine.run_tests = function(markdown) {
	console.log('start daspec tests in browser ...');
	$.ajax({ 
		url: riurik.args.path.replace(/daspec$/, 'js'), 
		success: function(steps){
            var defineSteps = function() {
                eval(steps);
            };
			var runner = new DaSpec.Runner(defineSteps);
			var counter = new DaSpec.CountingResultListener(runner);
			var resultFormatter = new DaSpec.MarkdownResultFormatter(runner);
		
			runner.execute(markdown).then(function () {
				var converter = new showdown.Converter({simplifiedAutoLink: true, strikethrough: true, ghCodeBlocks: true, tables: true})
				$('#page-content').html(converter.makeHtml(resultFormatter.formattedResults()));
			});
		}, 
		dataType: 'text'
	});
	
};

riurik.engine.config = function() {
	
};

$.extend(riurik.exports);
