function createFolderClick() {
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
}

function createFolder(path) {
	$("#create-dir-index-dialog").dialog({
		title: $('#new-folder').text(),
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
}

function createSuite() {
	createAndEdit($('#new-suite'), "/actions/suite/create/");
}

function createTest() {
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
							document.location += '\\' + data['result'];
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