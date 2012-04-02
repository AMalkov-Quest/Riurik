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

function reportTestDone(test) {
	console.log('the "' + test.name + '" test is done')
	function getTestResults(moduleName, testName) {
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

	 QUnit.__tests_result_storage.push({ 
		'event': 'testDone',
		'name': test.module + ': ' + test.name,
		'failed': test.failed,
		'passed': test.passed,
		'total': test.total,
		'duration': getTestDuration()
	});

	QUnit.__tests_result_storage.push({
		'event': 'html',
		'html': getTestResults(test.module, test.name)
	});

	send(function() {
		send();
	});
};

function send(callback) {
	data = QUnit.__tests_result_storage.shift();
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

