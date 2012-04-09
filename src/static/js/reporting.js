riurik.reporter = {}

riurik.reporter.server = riurik_server_name;
riurik.reporter.url = 'http://' + riurik_server_name + '/report_callback/';
riurik.reporter.date = formatDate(new Date(), 'yyyy-MM-dd-HH-mm-ss');
riurik.reporter.target_tests_path = test_path

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

	var testId = $('#qunit-tests li.pass[id*="test-output"]').length;
	riurik.reporter.queue.push({ 
		'event': 'testDone',
		'id': testId,
		'name': test.module + ': ' + test.name,
		'failed': test.failed,
		'passed': test.passed,
		'total': test.total,
		'duration': riurik.reporter.getTestDuration()
	});
	
	var html = riurik.reporter.getHtmlTestResults(test.module, test.name);
	$.each( riurik.reporter.tochunks(2000, html), function(i, chunk){
		riurik.reporter.queue.push({
			'event': 'html',
			'testId': testId,
			'chunkId': i,
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

riurik.reporter.send = function (data, callback) {
	$(document).unbind('ajaxError');
	console.log('send');
	console.log(data);
	$.ajax({
		'url': riurik.reporter.url,
		'data': data,
		'dataType': 'jsonp',
		'complete': function(){
			$(document).bind('ajaxError', ajaxError);
			if(typeof callback != 'undefined') {
				callback();
			}	
		}
	});
};

riurik.reporter.getTestDuration = function () {
	var duration = (new Date() - riurik.QUnit.current.test.started)/1000;
	if(isNaN(duration)) {
		duration = 0;
	}

	return duration;
};

riurik.reporter.consignor = function () {
	var busy = false;
	var busyTimeOut;

	(function f(){
		if ( ! busy ) {
			var next = function() {
				clearTimeout( busyTimeOut );
				busy = false;
			};

			busyTimeOut = setTimeout(next, 120 * 1000);
			if ( riurik.reporter.queue.length > 0 ){
				data = riurik.reporter.queue.shift();
				data['date'] = riurik.reporter.date;
				data['context'] = context.__name__;
				data['path'] = riurik.reporter.target_tests_path;
				
				busy = true;
				riurik.reporter.send( data, next );
			}
		};
		setTimeout(f, 100);
	})();
};
