function createFolder(path) {
	$("#createFolderDialog").dialog({
		resizable: false,
		buttons: {
			"create": function() {
				
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