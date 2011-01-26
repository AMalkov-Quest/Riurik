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

function createFolder(path) {
	$("#createFolderDialog").dialog({
		resizable: false,
		buttons: {
			"create": function() {
				$(this).dialog("close");
				var name = $("#full-path").val() + $("#folder-name").val();
				$("#operationInProgress").load(
						"/actions/folder/create/", 
						{"name" : name},
						function() {
							$("#operationInProgress").parent().find("button:contains('ok')").attr('disabled',false).removeClass('ui-state-disabled');
						});
				operationInProgress();
			},
			"cancel": function() {
				$(this).dialog("close");
			}
		}
	});
}

function createSuite(path) {
	alert(path)
}

function createTest(path) {
	alert(path)
}