QUnit.config.reorder = false;

QUnit.setup = function(callback) {
	QUnit.test('setup', null, callback, false);
}

QUnit.asyncSetup = function(callback) {
	QUnit.test('setup', null, callback, true);
}

QUnit.teardown = function(callback) {
	QUnit.test('teardown', null, callback, false);
}

QUnit.asyncTeardown = function(callback) {
	QUnit.test('teardown', null, callback, true);
}

QUnit.init = function() {
	riurik.QUnit = {};
	riurik.QUnit.current = { 'module': {}, 'test': {} };
	riurik.QUnit.status = 'started';
}

QUnit.begin = function() {
	QUnit.config.reorder = false;
	Riurik.log('tests are begun');
	riurik.reporter.begin();
}

QUnit.done = function(result) {
	Riurik.log('tests are done');
	riurik.QUnit.status = 'done';
	if( result.total == 0 ) {
		document.title = [
			("\u2716"),
			document.title.replace(/^[\u2714\u2716] /i, "")
		].join(" ");
	}
	riurik.reporter.done();
}

QUnit.moduleStart = function(module) {
	riurik.QUnit.current.module.name = module.name;
	riurik.QUnit.current.module.status = 'started';
	riurik.QUnit.current.module.started = new Date();
	Riurik.log('the "' + module.name + '" module is started ', riurik.QUnit.current.module.started);
	context = clone(riurik.QUnit.context)
}

QUnit.moduleDone = function(module) {
	Riurik.log('the "' + module.name + '" module is done');
	riurik.QUnit.current.module.status = 'done';
	riurik.QUnit.current.module.finished = new Date();
}

QUnit.testStart = function(test) {
	Riurik.log('the "' + test.name + '" test is started');
	riurik.QUnit.current.test.name = test.name;
	riurik.QUnit.current.test.started = new Date();
	console.log('Test start: ', test);
}

QUnit.testDone = function(test) {
	Riurik.log('the "' + test.name + '" test is done');
	riurik.reporter.testDone(test);
}

QUnit._get_results_view = function() {
	var html = '<html><head><link rel="stylesheet" type="text/css" href="qunit.css"></head><body>'
		html += '<ol class="qunit-tests" id="qunit-tests">';
	$('#qunit-tests').each(function(i, el){
		var ohtml = $(el).outerHTML().replace(new RegExp('display: none', 'gi'), 'display: block');
		html += ohtml;
	});
	html += '</ol></body></html>';
	return html;
};

QUnit.get_results_view = function() {
	var html = '<html><head><link rel="stylesheet" type="text/css" href="qunit.css"></head><body>'
		html += '<ol class="qunit-tests" id="qunit-tests">';
	html += $('#qunit-tests').html().replace(new RegExp('display: none', 'gi'), 'display: block');
	html += '</ol></body></html>';
	return html;
};

QUnit.get_qunit_console = function() {
	return (function getConsoleDivs() {
		var html = '<html><head><title>QUnit console</title></head><body>'
			html += $('#qunit-console').html();
		html += '</body></html>';
		return html;
	})();
};

QUnit.get_tools_console = function() {
	return (function getConsoleDivs() {
		var html = '<html><head><title>PowerShell console</title></head><body>'
			html += $('#powershell-console').html();
		html += '</body></html>';
		return html;
	})();
};

QUnit.getCSS = function(){
	if ( QUnit.__css ) return QUnit.__css;
	var result = '';
	url = make_remote_url('/static/css/qunit.css');
	$.ajax(url, {
		success: function(data){
			result = data;
		},
		async: false,
		cache: true
	});
	QUnit.__css = result;
	return result;
};


