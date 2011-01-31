$(document).ready(function(){
	
	$('#dir-index-menu').disableContextMenuItems('delete,versions');
	
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
			//alert("/actions/suite/edit/?path=" + currentDir + target);
			window.location = "/actions/suite/edit/?path=" + currentDir + target;
		}else{
			window.location = target;
		}
	}
	
	function run(target, context) {
		var currentDir = $('#run-test > input[name=url]').val();
		var fullPath = currentDir + target;
		
		if (context == 'suite') {
			fullPath = currentDir + ".context.ini";
		}
		
		$('#run-test > input[name=name]').val(fullPath);
		$('#run-test > input[name=url]').val(fullPath);
		$('#run-test').submit();
	}
});