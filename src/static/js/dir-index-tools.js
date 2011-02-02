function createFolder_old(path) {
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

function createFolder(path) {
	$("#createFSObjectDialog").dialog({
		resizable: false,
		buttons: {
			"create": function() {
				$(this).dialog("close");
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
			},
			"cancel": function() {
				$(this).dialog("close");
			}
		}
	});
}

function createSuite() {
	createAndEdit("Create Suite", "/actions/suite/create/");
}

function createTest() {
	createAndEdit("Create Test", "/actions/test/create/");
}

function createAndEdit(title, url) {
	$("#createFSObjectDialog").dialog({
		title: title,
		resizable: false,
		buttons: {
			"create": function() {
				$(this).dialog("close");
				$.post(
					url, 
					$("#create-fsobject").serialize(), 
					function(data) {
						if (data['success'] == 'true') {
							document.location = data['result'];
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