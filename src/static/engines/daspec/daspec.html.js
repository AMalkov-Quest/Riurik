$(function(){
	$('\
		<textarea id="markdownArea" style="width:80%; min-height:50px; border:1px dashed grey; margin-bottom:20px; padding:5px"> \
		</textarea>\
		<br/>\
		<button id="runButton" style="margin:10px;">Run DaSpec</button>\
		<h2>Result:</h2>\
		<div id="outputArea" style=" font-family: monospace; white-space: pre; width:80%; min-height:50px; border:1px dashed grey; margin-top:20px; padding:5px">\
		</div>\
	').appendTo('#engine');
});
