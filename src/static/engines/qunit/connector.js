riurik.engine = {}

riurik.engine.init = function( next ){
	riurik.trigger( "riurik.engine.initing" );
	window.context = clone(riurik.context);
	
	riurik.loader()
	.queue('/static/js/jquery.json.min.js')
	.queue('/static/js/dates.js')
	.queue('/static/js/consoles.js')
	.queue('/static/js/reporting.js')
	.queue('/static/js/frame.js')
	.queue('/static/engines/qunit/qunit.html.js')
	.queue('/static/engines/qunit/qunit.js')
	.queue('/static/engines/qunit/qunit.extentions.js')
	.then(function() {
		riurik.reporter.engine = 'qunit';
		riurik.engine.config();
		
		riurik.trigger( "riurik.engine.inited" );
		load_remote_style('/static/engines/qunit/qunit.css');

		next();
	});
};

riurik.engine.run_tests = function() {
	console.log('start QUnit tests...');

	QUnit.config.autorun = false;
	QUnit.config.autostart = true;
	
	QUnit.load();
};

//QUnit test matchers

riurik.matchers.pass = function(message) {
	QUnit.ok(true, message || '');
};

riurik.matchers.fail = function(message) {
	QUnit.ok(false, message || '');
	QUnit.start();
};

riurik.matchers.substring = function(actual, expected, message) {
	//replace non-breaking space(&nbsp;) with just space
	actual = actual.replace(/\xA0/g, ' ');
	expected = expected.replace(/\xA0/g, ' ');

	var i = actual.indexOf(expected);
	if( i >= 0 ) {
		actual = actual.substring(i, i + expected.length);
	}

	QUnit.push(i >= 0, actual, expected, message);
};

jQuery.extend(riurik.exports, riurik.matchers);

riurik.engine.config = function() {
	if ( typeof window.QUnit == 'undefined' ) {
		alert('QUnit should be preliminary loaded');
		return;
	}

	QUnit.config.autostart = false;
	QUnit.config.autorun = false;
	QUnit.config.reorder = false;
	riurik.QUnit = {};
	riurik.QUnit.current = { 'module': {}, 'test': {} };
	riurik.QUnit.status = 'started';

	QUnit.begin = function() {
		riurik.trigger("riurik.tests.begin");
	}

	QUnit.done = function(result) {
		riurik.QUnit.status = 'done';
		if( result.total == 0 ) {
			document.title = [
				("\u2716"),
				document.title.replace(/^[\u2714\u2716] /i, "")
			].join(" ");
		}
		riurik.trigger("riurik.tests.end");
	}

	QUnit.moduleStart = function(module) {
		//to provide clean context for every module
		window.$context = clone(riurik.context);
		//for compatibility with old tests
		window.context = clone(riurik.context);
		
		//riurik.trigger("riurik.tests.suite.start", module.name);
		riurik.reporter.suite = module.name;
		riurik.reporter.suiteStarted = new Date();
	}

	QUnit.moduleDone = function(module) {
		//riurik.trigger("riurik.tests.suite.done", module.name);
	}

	QUnit.testStart = function(test) {
		//riurik.trigger("riurik.tests.test.start", test.name);
		riurik.reporter.test = test.name;
		riurik.reporter.testStarted = new Date();
	}

	QUnit.testDone = function(test) {
		name = riurik.reporter.suite + ': ' + test.name;
		riurik.trigger("riurik.tests.test.done", name, test.passed, test.failed, test.total);
	}

	QUnit.log = riurik.log;
	
	riurik.reporter.getTestDuration = function () {
		var duration = (new Date() - riurik.reporter.testStarted)/1000;
		if(isNaN(duration)) {
			duration = 0;
		}

		return duration;
	};

	riurik.reporter.getHtmlTestResults = function () {
		var moduleName = riurik.reporter.suite,
			testName = riurik.reporter.test;
		var elements = $('#qunit-tests li')
			.has(".module-name:contains('"+moduleName+"')")
			.has(".test-name:contains('"+testName+"')");
		var out = '';
		elements.each(function(i, element){
			if ( 
				$('.module-name',element).text() == moduleName &&
				$('.test-name',element).text() == testName
			) {
				out = $(element).outerHTML();
				return false;
			};
		});
		return encodeURIComponent( out );
	};
};

$.extend(riurik.exports);
