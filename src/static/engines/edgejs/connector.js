riurik.engine = {}

riurik.engine.init = function( next ){
	riurik.trigger( "riurik.engine.initing" );
	
	$('#frame-container').remove();
	
	riurik.loader()
	.queue('/static/bootstrap/js/bootstrap.js')
	.queue('/static/engines/edgejs/edgejs.html.js')
	.then(function() {
		$.extend(riurik.exports);
		riurik.engine.config();
		load_remote_style('/static/bootstrap/css/bootstrap.css');
		riurik.trigger( "riurik.engine.inited" );
		next();
	});
};

riurik.load_tests = function(){
	console.log('load edgejs script ' + riurik.args.path);
	$.ajax({ 
		url: riurik.args.path, 
		success: function(script){
			riurik.engine.run_tests(script); 
		}, 
		dataType: 'text'
	});
};

riurik.engine.run_tests = function(script) {
    console.log('start edgejs script ...');
    $('#page-content').html();
    
    $.post(
        '/actions/nodejs/run/', 
        { engine: 'edgejs', script: riurik.args.path }, 
        function(data){
            scriptResult = data['result'];
            $('#page-content').html(scriptResult);  
        },
        "json"
    );
    
};

riurik.engine.config = function() {
	
};

$.extend(riurik.exports);
