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
		alert('run ' + target);
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
	})*/;
	
/*
$('#right-click-menu').bind('contextmenu',function(e){
	var $cmenu = $(this).next();
	$('<div class="overlay"></div>').css(
		{
			left : '0px', top : '0px',position: 'absolute', width: '100%', height: '100%', zIndex: '100' 
		}).click(function(){
			$(this).remove();
			$cmenu.hide();
		}).bind('contextmenu' , function(){
			return false;
		}).appendTo(document.body);
	
	$(this).next().css({ left: e.pageX, top: e.pageY, zIndex: '101' }).show();
	return false;
});
$('.vmenu .first_li').live('click',function() {
		if( $(this).children().size() == 1 ) {
			alert($(this).children().text());
			$('.vmenu').hide();
			$('.overlay').hide();
		}
	 });

	 $('.vmenu .inner_li span').live('click',function() {
			alert($(this).text());
			$('.vmenu').hide();
			$('.overlay').hide();
	 });


	$(".first_li , .sec_li, .inner_li span").hover(function () {
		$(this).css({backgroundColor : '#E0EDFE' , cursor : 'pointer'});
	if ( $(this).children().size() >0 )
			$(this).find('.inner_li').show();	
			$(this).css({cursor : 'default'});
	}, 
	function () {
		$(this).css('background-color' , '#fff' );
		$(this).find('.inner_li').hide();
	});
*/
});