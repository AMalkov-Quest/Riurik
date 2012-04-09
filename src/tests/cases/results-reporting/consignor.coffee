module 'consignor'

asyncTest 'should send given data', ->
  $.wait( -> riurik.reporter.queue.length == 0 ).then ->
    
    riurik.reporter.queue.push {'event': 'test'}
    $.mockjax({
      url: QUnit.riurik.report_url,
      response: (args) ->
        console.log args
        
        equal args.dataType, 'jsonp'
        ok ?args.data
        equal args.data.context, context.__name__
        equal args.data.date, formatDate(QUnit.riurik.date, 'yyyy-MM-dd-HH-mm-ss')
        equal args.data.path, test_path
        equal args.data.event, 'test'
        
        $.mockjaxClear()
        start()
    })