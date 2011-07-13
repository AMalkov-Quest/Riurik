var dirIndexActions = {
	
	remove: function(target) {
		var currentDir = $('#context-action > input[name=url]').val();
		var fullPath = currentDir + target;
		$('#context-action').attr('action', '/actions/remove/');
		$('#context-action > input[name=path]').val(fullPath);
		$('#context-action').submit();
	},
	
	edit: function(target) {
		var currentDir = $('#context-action > input[name=url]').val();
		window.location = "/actions/suite/edit/?path=" + currentDir + target;
	}
}

$(document).ready(function() {
	
	$('#dir-index-menu').disableContextMenuItems('move');
	
	$("#dir-index-id UL LI").contextMenu({
	        menu: 'dir-index-menu'
	    },  
            function(action, el, pos) {
                var args = action.split('#');
                action = args.shift();
                args = ', [' + args.map(function(i){return '"'+i+'"';}).toString() + ']';
                var parmas = '("' + $(el).find('a').text() + '", "' + $(el).attr('class') + '"'+ args +')';
                eval(action + parmas);
            }
	);
	
	function edit(target, context) {
		dirIndexActions.edit(target);
	};
	
	function remove(target, context) {
		if ( confirm('Do you realy want to delete "'+ target  +'"?') ) {
			dirIndexActions.remove(target);
		};
	};
	
	function run(target, context, context_names) {
		var currentDir = $('#context-action > input[name=url]').val();
		var fullPath = currentDir + target;
		$('#context-action > input[name=path]').val(fullPath);
		$('#context-action > input[name=url]').val(fullPath);
		$('#context-action > input[name=context]').val(context_names.shift());
		$('#context-action').attr('action', '/actions/test/submit/').attr('target', '_blank');
		$('#context-action').submit();
	};
	function runsuite(target, context, context_names) {
		var currentDir = $('#context-action > input[name=url]').val();
		var fullPath = currentDir;
		console.log(target, context, arguments);
		$('#context-action > input[name=path]').val(fullPath);
		$('#context-action > input[name=url]').val(fullPath);
		$('#context-action > input[name=context]').val(context_names.shift());
		$('#context-action').attr('action', '/actions/suite/submit/').attr('target', '_blank');
		$('#context-action').submit();
	};

});
