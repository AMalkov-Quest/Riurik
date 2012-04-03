function reportBegin() {
	var message = { 
		'event': 'begin'
	};
	QUnit.__tests_result_storage.push(message);
	send();
};

function reportDone() {
	console.log('tests are done')
	var message = { 
		'event': 'done'
	};
	QUnit.__tests_result_storage.push(message);

	(function f(){
		var queue = QUnit.__tests_result_storage;
		if ( queue.length > 0 && queue[0].event == 'done' ){
			console.log('send tests are done')
			send();
		} else {
			console.log('done is waiting for empty queue: ' + queue.length)
			setTimeout(f, 100);
		}
	})();
};

function tochunks(size, data) {
	var len = data.length;
	var i = 0;
	var chunks = new Array();
	console.log('test data length: ' + len);
	while(len > 0) {
		chunks[i] = data.substring(i*size, i*size + size);
		len -= size;
		i += 1;
	}
	console.log('splitted in ' + chunks.length + ' chunks');
	return chunks;
};

function getHtmlTestResults(moduleName, testName) {
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

function reportTestDone(test) {
	console.log('the "' + test.name + '" test is done');

	var testId = $('#qunit-tests li.pass[id*="test-output"]').length;
	console.log('test id ' + testId);

	QUnit.__tests_result_storage.push({ 
		'event': 'testDone',
		'name': test.module + ': ' + test.name,
		'testId': testId,
		'failed': test.failed,
		'passed': test.passed,
		'total': test.total,
		'duration': getTestDuration()
	});
	
	var html = getHtmlTestResults(test.module, test.name);
	$.each( tochunks(2000, html), function(i, chunk){
		QUnit.__tests_result_storage.push({
			'event': 'html',
			'chunkId': i,
			'testId': testId,
			'html': chunk
		});
	});
	
	function sendChunk() {
		var queue = QUnit.__tests_result_storage;
		if ( queue.length > 0 && queue[0].event == 'html' ) {
			send(sendChunk);
		}
	}
	
	(function f(){
		var queue = QUnit.__tests_result_storage;
		if ( queue.length > 0 && queue[0].event == 'testDone' && queue[0].testId == testId ){
			console.log('send tests are done')
			send(sendChunk);
		} else {
			console.log('send test is waiting for empty queue: ' + queue.length);
			setTimeout(f, 100);
		}
	})();
};

function send(callback) {
	data = QUnit.__tests_result_storage[0];
	data['date'] = formatDate(QUnit.riurik.date, 'yyyy-MM-dd-HH-mm-ss');
	data['context'] = context.__name__;
	data['path'] = test_path;
	console.log('report tests result')
	console.log(data);
	$(document).unbind('ajaxError');
	$.ajax({
		'url': QUnit.riurik.report_url,
		'data': data,
		'dataType': 'jsonp',
		'complete': function(){
			QUnit.__tests_result_storage.shift();
			$(document).bind('ajaxError', ajaxError);
			if(typeof callback != 'undefined') {
				callback();
			}	
		}
	});
};

function getTestDuration()
{
	var duration = (new Date() - QUnit.riurik.current.test.started)/1000;
	if(isNaN(duration)) {
		duration = 0;
	}

	return duration;
};

