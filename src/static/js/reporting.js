riurik.reporter = {}

riurik.reporter.queue = new Array();

riurik.reporter.begin = function () {
	var message = { 
		'event': 'begin'
	};
	riurik.reporter.queue.push(message);
	riurik.reporter.consignor();
};

riurik.reporter.done = function () {
	console.log('tests are done')
	var message = { 
		'event': 'done'
	};
	riurik.reporter.queue.push(message);
};

riurik.reporter.testDone = function (test) {
	console.log('the "' + test.name + '" test is done');

	riurik.reporter.queue.push({ 
		'event': 'testDone',
		'name': test.module + ': ' + test.name,
		'failed': test.failed,
		'passed': test.passed,
		'total': test.total,
		'duration': getTestDuration()
	});
	
	var html = riurik.reporter.getHtmlTestResults(test.module, test.name);
	$.each( riurik.reporter.tochunks(2000, html), function(i, chunk){
		riurik.reporter.queue.push({
			'event': 'html',
			'html': chunk
		});
	});
};

riurik.reporter.tochunks = function (size, data) {
	var len = data.length;
	var i = 0;
	var chunks = new Array();
	
	while(len > 0) {
		chunks[i] = data.substring(i*size, i*size + size);
		len -= size;
		i += 1;
	}
	
	return chunks;
};

riurik.reporter.getHtmlTestResults = function (moduleName, testName) {
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

riurik.reporter.send = function (callback) {
	data = riurik.reporter.queue[0];
	data['date'] = formatDate(QUnit.riurik.date, 'yyyy-MM-dd-HH-mm-ss');
	data['context'] = context.__name__;
	data['path'] = test_path;
	
	$(document).unbind('ajaxError');
	$.ajax({
		'url': QUnit.riurik.report_url,
		'data': data,
		'dataType': 'jsonp',
		'complete': function(){
			riurik.reporter.queue.shift();
			$(document).bind('ajaxError', ajaxError);
			if(typeof callback != 'undefined') {
				callback();
			}	
		}
	});
};

riurik.reporter.getTestDuration = function () {
	var duration = (new Date() - QUnit.riurik.current.test.started)/1000;
	if(isNaN(duration)) {
		duration = 0;
	}

	return duration;
};

riurik.reporter.consignor = function () {
	var sending = false;
	var sendingTimeOut;
	(function f(){
		if ( ! sending ) {
			var next = function(){
				clearTimeout( sendingTimeOut );
				sending = false;
			};
			sendingTimeOut = setTimeout(next, 30 * 1000);
			if ( riurik.reporter.queue.length > 0 ){
				sending = true;
				riurik.reporter.send( next );
			}
		};
		setTimeout(f, 100);
	})();
};
