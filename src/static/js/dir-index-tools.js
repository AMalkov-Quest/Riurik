$(function () {
	$('#context-preview-ctrl').click(function(){
		$('#context-preview').dialog({
			width: 1200,
			height: 700,
			buttons: [
				{
					text: 'Edit',
					click: function() { 
						open('.context.ini?editor');
						$(this).dialog('close'); 
					}
				},
				{
					text: 'Close',
					click: function() { $(this).dialog('close'); }
				}
			],
			model: true,
			title: 'context.ini',
			open: function(event, ui){
				$.ajax({ 
					url: 'show_context', 
					success: function(data){ 
						$('#context-preview').html('<pre>'+data+'</pre>'); 
					}, 
					dataType: 'text'
				});
			}
		});
		return false;
	});
});

function relocate(new_location){
	console.log(window.location.toString());
	len = window.location.toString().length;
	if( document.location.toString().charAt(len - 1) == '/' ) {
		document.location += new_location;
	}else{
		document.location += '/' + new_location;
	}	 
}

function createFolderClick() {
	$.post(
		"/actions/folder/create/", 
		$("#create-fsobject").serialize(), 
		function(data) {
			if (data == 'OK') {
				window.location = window.location;
			}else{
				showError(data);
			}
		},
		"text"
	);
	$(this).dialog("close");
}

function createFolder() {
	$("#create-dir-index-dialog span").text($("#suite-tip").text())
	$("#create-dir-index-dialog")
		.dialog({
			title: $('#new-suite').text(),
			resizable: false,
			buttons: [
				{
					id: "create-folder-btn",
					text: "create", 
					click: createFolderClick
				},
			    {
					id: "cancel-folder-btn",
					text: "cancel", 
			    	click: function() {
						$(this).dialog("close");
					}
				}
		   ]
		});
	$("#create-dir-index-dialog input")
		.bind('keydown', function(l){
			if ( l.keyCode == 13 ) { 
				createFolderClick.call($('#create-dir-index-dialog'));
			}
		})
}

function createSuite() {
	$("#create-dir-index-dialog span").text($("#suite-tip").text())
	createAndEdit($('#new-suite'), "/actions/suite/create/");
}

function createTest() {
	$("#create-dir-index-dialog span").text($("#test-tip").text())
	$("input#object-name").val('.js');
	createAndEdit($('#new-test'), "/actions/test/create/");
}

function createAndEdit(srcObject, url) {
	$("#create-dir-index-dialog").dialog({
		title: srcObject.text(),
		resizable: false,
		buttons: {
			"create": function() {
				$(this).dialog("close");
				$.post(
					url, 
					$("#create-fsobject").serialize(), 
					function(data) {
						if (data['success'] == true) {
							relocate(data['result']);
						}else{
							showError(data['result']);
						}
					},
					"json"
				);
			},
			"cancel": function() {
				$(this).dialog("close");
			}
		}
	});
	$("#create-dir-index-dialog input")
		.bind('keydown', function(l){
			if ( l.keyCode == 13 ) { 
				$('button:contains("create")', $('#create-dir-index-dialog').parent()).click();
			}
		});
}

function showError( msg) {
	$("#operationResult").text(msg);
	$("#operationResult").dialog({
		resizable: false,
		modal: true,
		disabled: false,
		buttons: {
			"ok": function() {
				$(this).dialog("close");
				window.location = window.location;
			}
		}
	});
};

function operationInProgress() {
	$("#operationInProgress").dialog({
		resizable: false,
		modal: true,
		disabled: true,
		buttons: {
			"ok": function() {
				$(this).dialog("close");
				window.location = window.location;
			}
		}
	});
	
	$("#operationInProgress").parent().find("button:contains('ok')").attr('disabled',true).addClass('ui-state-disabled');
	$("#operationInProgress").parent().children().children('.ui-dialog-titlebar-close').hide();
};
