riurik.engine.init = function( next ){
	riurik.trigger( "riurik.engine.initing" );
	
	riurikldr.loader()
	.queue('/static/engines/qunit/qunit.html.js')
	.queue('/static/engines/qunit/qunit.js')
	.queue('/static/engines/qunit/qunit.extentions.js')
	.then(function() {
		connect()
		riurik.trigger( "riurik.engine.inited" );
		next()
	});

	load_remote_style('/static/engines/qunit/qunit.css');
};

riurik.on( "riurik.tests.loaded",function(){
	QUnit.config.autorun = false;
	QUnit.config.autostart = true;
	QUnit.load();
});

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


riurik.on("riurik.engine.assert_ok", function( result, message ){
	QUnit.ok( result, message );
});

riurik.on("riurik.engine.assert_equal", function( actual, expected, message ){
	QUnit.equal( actual, expected, message );
});

riurik.on("riurik.engine.loaded", function(){
	/* Riurik relies on QUnit, so it should be preliminary loaded */
	if (!riurik.getQUnit()) {
		alert('QUnit should be preliminary loaded');
	}
});

connect = function() {
	QUnit.config.autostart = false;
	QUnit.config.autorun = false;
	QUnit.config.reorder = false;
	riurik.QUnit = {};
	riurik.QUnit.current = { 'module': {}, 'test': {} };
	riurik.QUnit.status = 'started';

	QUnit.begin = function() {
		riurik.log('tests are begun');
		riurik.trigger("riurik.tests.begin");
	}

	QUnit.done = function(result) {
		riurik.log('tests are done');
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
		riurik.QUnit.current.module.name = module.name;
		riurik.QUnit.current.module.status = 'started';
		riurik.QUnit.current.module.started = new Date();
		riurik.log('the "' + module.name + '" module is started ', riurik.QUnit.current.module.started);
		context = clone(riurik.context)
		riurik.trigger("riurik.tests.suite.start");
	}

	QUnit.moduleDone = function(module) {
		riurik.log('the "' + module.name + '" module is done');
		riurik.QUnit.current.module.status = 'done';
		riurik.QUnit.current.module.finished = new Date();
		riurik.trigger("riurik.tests.suite.done");
	}

	QUnit.testStart = function(test) {
		riurik.log('the "' + test.name + '" test is started');
		riurik.QUnit.current.test.name = test.name;
		riurik.QUnit.current.test.started = new Date();
		console.log('Test start: ', test);
		riurik.trigger("riurik.tests.test.start");
	}

	QUnit.testDone = function(test) {
		riurik.log('the "' + test.name + '" test is done');
		riurik.trigger("riurik.tests.test.done", test);
	}

	/* TODO:
	 * these two methods are just for testability
	 * because I was not able to mock the window object
	 * it would be great to get rid of them ASAP
	 * */
	riurik.getQUnit = function() {
		return QUnit;
	}


};
