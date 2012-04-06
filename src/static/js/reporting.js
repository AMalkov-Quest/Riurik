function reportBegin() {
	var message = { 
		'event': 'begin'
	};
	QUnit.__tests_result_storage.push(message);
	consignor();
};

function reportDone() {
	console.log('tests are done')
	var message = { 
		'event': 'done'
	};
	QUnit.__tests_result_storage.push(message);
};

function tochunks(size, data) {
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

	QUnit.__tests_result_storage.push({ 
		'event': 'testDone',
		'name': test.module + ': ' + test.name,
		'failed': test.failed,
		'passed': test.passed,
		'total': test.total,
		'duration': getTestDuration()
	});
	
	var html = getHtmlTestResults(test.module, test.name);
	$.each( tochunks(2000, html), function(i, chunk){
		QUnit.__tests_result_storage.push({
			'event': 'html',
			'html': chunk
		});
	});
};

function send(callback) {
	data = QUnit.__tests_result_storage[0];
	data['date'] = formatDate(QUnit.riurik.date, 'yyyy-MM-dd-HH-mm-ss');
	data['context'] = context.__name__;
	data['path'] = test_path;
	
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

function consignor(){
	var sending = false;
	(function f(){
		if ( ! sending ) {
			var queue = QUnit.__tests_result_storage;
			if ( queue.length > 0 ){
				sending = true;
				send(function(){
					sending = false;
				});
			}
		};
		setTimeout(f, 100);
	})();
};
