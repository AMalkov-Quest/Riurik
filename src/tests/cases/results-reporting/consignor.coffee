module 'consignor'

asyncTest 'should send given data', ->
  $.wait( -> riurik.reporter.queue.length == 0 ).then ->
    
    equal riurik.reporter.url, 'http://localhost:8000/report_callback/'
    ok riurik.reporter.queue?, 'queue for tests result should be created'
    reportingData = {'event': 'test'}
    riurik.reporter.queue.push reportingData
    
    $.mockjax({
      url: riurik.reporter.url,
      response: (args) ->
        
        equal args.dataType, 'jsonp', 'request should be cross-domain'
        ok args.data?, 'reporting data should be extracted from the queue'
        equal args.data.context, context.__name__, 'context name'
        equal args.data.date, riurik.reporter.date
        equal args.data.path, test_path, 'path to test'
        equal args.data.event, reportingData.event, 'event type'
        
        $.mockjaxClear()
        start()
    })