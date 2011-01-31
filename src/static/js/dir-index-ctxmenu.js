$(document).ready(function(){
	
	$('#dir-index-menu').disableContextMenuItems('delete,versions');
	
	$("#dir-index-id UL LI").contextMenu({
        menu: 'dir-index-menu'
    },
        function(action, el, pos) {
        	var parmas = '("' + $(el).find('a').text() + '")';
    		eval(action + parmas)
    });
	
	function edit(target) {
		window.location = target;
	}
	
	function run(target) {
		var currentDir = $('#run-test > input[name=url]').val();
		var fullPath = currentDir + target;
		$('#run-test > input[name=name]').val(fullPath);
		$('#run-test > input[name=url]').val(fullPath);
		$('#run-test').submit();
	}
	
	/*$('#dir-index-id').bind('contextmenu',function(e){
		
		$('.dir-rclick-menu').css({
			top: e.pageY+'px',
			left: e.pageX+'px'
		}).show();
		
		return false;
	});
	
	$('.dir-rclick-menu').click(function() {
		$('.dir-rclick-menu').hide();
	});
	
	$(document).click(function() {
		$('.dir-rclick-menu').hide();
	});*/
});