riurik.reporter = {}

riurik.reporter.url = riurik.BuildHttpUri('/report_callback/');
//riurik.reporter.date = formatDate(new Date(), 'yyyy-MM-dd-HH-mm-ss');
riurik.reporter.date = riurik.context.test_start_time; 
riurik.reporter.target_tests_path = riurik.args.path;
riurik.reporter.state = 'begin';
riurik.reporter.testNum = 0;
riurik.reporter.suiteStarted = null;
riurik.reporter.testStarted = null;
riurik.reporter.suite = null;
riurik.reporter.test = null;
riurik.reporter.engine = '';

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
	
	var html = $('#engine').html();
	$.each( riurik.reporter.tochunks(2000, html), function(i, chunk){
		riurik.reporter.queue.push({
			'event': 'html',
			'testId': riurik.reporter.testNum,
			'chunkId': i,
			'html': chunk
		});
	});

	//trick to prevent suite hanging, i.e. report done while browser window is not closed
	/*(function done(){
		riurik.reporter.queue.push({ 
			'event': 'done'
		});
		setTimeout(done, 3000);
	})();*/
	riurik.reporter.queue.push({ 
		'event': 'done'
	});
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
	console.log('the "' + name + '" test is done', arguments);
	var module = riurik.reporter.suite;
	riurik.reporter.testNum  = riurik.reporter.testNum + 1;
	riurik.reporter.queue.push({ 
		'event': 'testDone',
		'id': riurik.reporter.testNum,
		'name': module + ': ' + name,
		'failed': failed,
		'passed': passed,
		'total': total,
		'duration': riurik.reporter.getTestDuration(),
		'engine': riurik.reporter.engine
	});
	
	/*var html = riurik.reporter.getHtmlTestResults();
	$.each( riurik.reporter.tochunks(2000, html), function(i, chunk){
		riurik.reporter.queue.push({
			'event': 'html',
			'testId': riurik.reporter.testNum,
			'chunkId': i,
			'html': chunk
		});
	});*/
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
	riurik.log('report: ' + data.event);
	
	var complete = function(complete_msg) {
		$(document).bind('ajaxError', riurik.ajaxError);
		if(complete_msg == 'error') {
			riurik.log(callback.toString());
		}
		if(typeof callback != 'undefined') {
			callback(complete_msg);
		}	
	};

	try {
		$.ajax({
			'url': riurik.reporter.url,
			'data': data,
			'dataType': 'jsonp',
			'complete': function() { complete(data.event) }
		});
	}catch(e) {
		riurik.log(data.event + ' status reporting error: ' + e.toString());
		complete('error');
	};
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
				
				if( event == 'timeout') {
					riurik.log('!!! reporter timeout !!!');
					riurik.log('reporter length is ' + riurik.reporter.queue.length);
				}
			};
			
			if ( riurik.reporter.queue.length > 0 ) {
				data = riurik.reporter.queue.shift();
				data['date'] = riurik.reporter.date;
				data['context'] = context.__name__;
				data['path'] = riurik.reporter.target_tests_path;
				
				busy = true;
				clearTimeout( busyTimeOut );
				busyTimeOut = setTimeout(function() { next('timeout'); }, 60 * 1000);
				
				riurik.reporter.send( data, next );
			}
		};
		
		if(riurik.reporter.state != 'done') {
			setTimeout(f, 100);
		}
	})();
};

riurik.on("riurik.tests.begin", riurik.reporter.begin);
riurik.on("riurik.tests.end", riurik.reporter.done);
riurik.on("riurik.tests.suite.start", riurik.reporter.suiteStart);
riurik.on("riurik.tests.suite.done", riurik.reporter.suiteDone);
riurik.on("riurik.tests.test.start", riurik.reporter.testStart);
riurik.on("riurik.tests.test.done", riurik.reporter.testDone);

