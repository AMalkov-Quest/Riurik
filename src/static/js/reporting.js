riurik.reporter = {}

riurik.reporter.url = riurik.BuildHttpUri('/report_callback/');
riurik.reporter.date = formatDate(new Date(), 'yyyy-MM-dd-HH-mm-ss');
riurik.reporter.target_tests_path = riurik.args.path;
riurik.reporter.state = 'begin';
riurik.reporter.testNum = 0;
riurik.reporter.suiteStarted = null;
riurik.reporter.testStarted = null;
riurik.reporter.suite = null;
riurik.reporter.test = null;

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

riurik.reporter.suiteStart = function(e, suite) {
	riurik.reporter.suite = suite;
	riurik.reporter.suiteStarted = new Date();
};

riurik.reporter.suiteDone = function(e, module) {
	riurik.reporter.suite = null;
};


riurik.reporter.testStart = function(e, test) {
	riurik.reporter.test = test;
	riurik.reporter.testStarted = new Date();
};

riurik.reporter.testDone = function(e, name, passed, failed, total) {
	console.log('the "' + test.name + '" test is done');
	var module = riurik.reporter.suite;
	riurik.reporter.testNum  = riurik.reporter.testNum + 1;
	riurik.reporter.queue.push({ 
		'event': 'testDone',
		'id': riurik.reporter.testNum,
		'name': module + ': ' + name,
		'failed': failed,
		'passed': passed,
		'total': total,
		'duration': riurik.reporter.getTestDuration()
	});
	
	var html = riurik.reporter.getHtmlTestResults();
	$.each( riurik.reporter.tochunks(2000, html), function(i, chunk){
		riurik.reporter.queue.push({
			'event': 'html',
			'testId': riurik.reporter.testNum,
			'chunkId': i,
			'html': chunk
		});
	});
	riurik.reporter.test = null;
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

riurik.reporter.outerHTML = function (s) {
	return (s) 
		? this.before(s).remove()
		: $('<p>').append(this.eq(0).clone()).html();
};

$.fn.extend({
	'outerHTML': riurik.reporter.outerHTML
});

riurik.reporter.getHtmlTestResults = function () {
	alert('Test Engine get HTML results not implemented');
	return '';
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
			$(document).bind('ajaxError', riurik.ajaxError);
			if(typeof callback != 'undefined') {
				callback(data.event);
			}	
		}
	});
};

riurik.reporter.getTestDuration = function () {
	var duration = (new Date() - riurik.reporter.testStarted)/1000;
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
			var next = function(event) {
				clearTimeout( busyTimeOut );
				busy = false;
				if( event == 'done') {
					riurik.reporter.state = 'done';
				}
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

riurik.on("riurik.tests.begin", riurik.reporter.begin);
riurik.on("riurik.tests.end", riurik.reporter.done);
riurik.on("riurik.tests.suite.start", riurik.reporter.suiteStart);
riurik.on("riurik.tests.suite.done", riurik.reporter.suiteDone);
riurik.on("riurik.tests.test.start", riurik.reporter.testStart);
riurik.on("riurik.tests.test.done", riurik.reporter.testDone);

