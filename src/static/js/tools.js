function createFolder(path) {
	$("#createFSObjectDialog").dialog({
		resizable: false,
		buttons: {
			"create": function() {
				$(this).dialog("close");
				$("#operationInProgress").load(
						"/actions/folder/create/", 
						{"full-path" : $("#full-path").val(), "object-name": $("#object-name").val()},
						function() {
							$("#operationInProgress").parent().find("button:contains('ok')").attr('disabled',false).removeClass('ui-state-disabled');
						},
						"json");
				operationInProgress();
			},
			"cancel": function() {
				$(this).dialog("close");
			}
		}
	});
}

function createSuite() {
	createAndEdit("/actions/suite/create/");
}

function createTest() {
	createAndEdit("/actions/test/create/");
}

function createAndEdit(url) {
	$("#createFSObjectDialog").dialog({
		resizable: false,
		buttons: {
			"create": function() {
				$(this).dialog("close");
				$.post(
					url, 
					$("#create-fsobject").serialize(), 
					function(data) {
						document.location = data['result'];
					},
					"json");
			},
			"cancel": function() {
				$(this).dialog("close");
			}
		}
	});
}

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