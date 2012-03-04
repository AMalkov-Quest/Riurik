var dirIndexActions = {
	
	remove: function(target) {
		var currentDir = $('#context-action > input[name=url]').val();
		var fullPath = currentDir + target;
		$('#context-action').attr('action', '/actions/remove/');
		$('#context-action > input[name=path]').val(fullPath);
		$('#context-action').submit();
	},
	
}

var ctxMenuActions = {

	dispatcher: function (action, el, pos) {
		var args = action.split('#');
		action = args.shift();
		args = ', [' + args.map(function(i){return '"'+i+'"';}).toString() + ']';
		var parmas = '("' + $(el).find('a').text() + '", "' + $(el).attr('class') + '"'+ args +')';
		eval('ctxMenuActions.' + action + parmas);
	},

	editctx: function (target, context) {
		var currentDir = $('#context-action > input[name=url]').val();
		window.location = "/actions/suite/edit/?path=" + currentDir + target;
	},
	
	editspec: function (target, context) {
		var currentDir = $('#context-action > input[name=url]').val();
		window.location = '/' + currentDir + '.specification.ini?editor';
	},
	
	remove: function (target, context) {
		if ( confirm('Do you realy want to delete "'+ target  +'"?') ) {
			dirIndexActions.remove(target);
		};
	},
	
	run: function (target, context, context_names) {
		var currentDir = $('#context-action > input[name=url]').val();
		var fullPath = currentDir + target;
		var context = $('#context').val();
		if ( typeof context == 'undefined' ) {
			alert('No context selected');
			return;	
		}
		var target_type = $('#dir-index-id li[title="'+target+'"]').attr('class');
		$('#context-action > input[name=path]').val(fullPath);
		$('#context-action > input[name=url]').val(fullPath);
		$('#context-action > input[name=context]').val(context);
		console.log(currentDir, fullPath, context,target_type, target);
		if ( target_type == 'test' ) {
			$('#context-action').attr('action', '/actions/test/run/').attr('target', '_blank'); 	
			$('#context-action').submit();
			$('#context-action > input[name=url]').val(currentDir);
			return;
		}
		if ( target_type == 'suite' ) {
			$('#context-action').attr('action', '/actions/suite/run/').attr('target', '_blank'); 	
			$('#context-action').submit();
			$('#context-action > input[name=url]').val(currentDir);
			return;
		}
		alert('Unknown target type to run.');
		return;
	}
};

$(document).ready(function() {
	
	$('#dir-index-menu').disableContextMenuItems('move');
	
	$("#dir-index-id UL LI").contextMenu({
	        menu: 'dir-index-menu'
	    }, ctxMenuActions.dispatcher
	);
	
});
