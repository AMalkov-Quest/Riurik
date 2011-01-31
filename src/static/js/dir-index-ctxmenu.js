$(document).ready(function(){
	
	$('#dir-index-menu').disableContextMenuItems('move');
	
	$("#dir-index-id UL LI").contextMenu({
        menu: 'dir-index-menu'
    },
        function(action, el, pos) {
        	var parmas = '("' + $(el).find('a').text() + '", "' + $(el).attr('class') + '")';
    		eval(action + parmas);
    });
	
	function edit(target, context) {
		if (context == 'suite') {
			var currentDir = $('#run-test > input[name=url]').val();
			window.location = "/actions/suite/edit/?path=" + currentDir + target;
		}else{
			window.location = target;
		}
	}
	
	function remove(target, context) {
		var currentDir = $('#context-action > input[name=url]').val();
		var fullPath = currentDir + target;
		
		$('#context-action').attr('action', '/actions/remove/');
		$('#context-action > input[name=path]').val(fullPath);
		$('#context-action').submit();
	}
	
	function run(target, context) {
		var currentDir = $('#context-action > input[name=url]').val();
		var fullPath = currentDir + target;
		
		$('#context-action > input[name=name]').val(fullPath);
		$('#context-action > input[name=url]').val(fullPath);
		$('#context-action').attr('action', '/actions/test/submit/').attr('target', '_blank');
		$('#context-action').submit();
	}
});