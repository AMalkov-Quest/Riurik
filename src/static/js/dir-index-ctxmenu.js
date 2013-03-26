var ctxMenuActions = {

	dispatcher: function (action, el, pos) {
		var args = action.split('#');
		action = args.shift();
		args = ', [' + args.map(function(i){return '"'+i+'"';}).toString() + ']';
		var params = '("' + $(el).find('a').text() + '", "' + $(el).attr('class') + '"'+ args +')';
		eval('ctxMenuActions.' + action + params);
	},

	editctx: function (target, context) {
		ctxMenuActions.editimpl(target, context, '.context.ini');
	},
	
	editspec: function (target, context) {
		ctxMenuActions.editimpl(target, context, '.specification.ini');
	},

	editimpl: function (target, context, file_name) {
		if( context == 'test' ) {
			target = $('#context-action > input[name=url]').val();
		}
		window.location = '/' + target + '/' + file_name + '?editor';
	},
	
	remove: function (target, context) {
		if ( confirm('Do you realy want to delete "'+ target  +'"?') ) {
			ctxMenuActions.removeimpl(target);
		};
	},

	rename: function (target, context) {
		var fullPath = ctxMenuActions.get_fullpath(target);
		rename(fullPath)
	},

	removeimpl: function(target) {
		var currentDir = $('#context-action > input[name=url]').val();
		var fullPath = currentDir + target;
		$('#context-action').attr('action', '/actions/remove/');
		$('#context-action > input[name=path]').val(fullPath);
		$('#context-action').submit();
	},

	get_fullpath: function(target) {
		var currentDir = $('#context-action > input[name=url]').val();
		return currentDir + target;
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
	
	$("#dir-index-id UL LI").contextMenu({
	        menu: 'dir-index-menu'
	    }, ctxMenuActions.dispatcher
	);
	
});
