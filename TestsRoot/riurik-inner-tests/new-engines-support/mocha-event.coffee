SUT = =>
    $.get 'http://server/gimme/data', (data)->
        $("<p>#{data}</p>").appendTo('div#async')
        $('#async').show()
        $('#async').trigger('event')
                
describe 'jasmine provides asyncronouse specs support', ->
                
    beforeEach ->
        $('<div id="async" style="display:none"></div>').appendTo('body')
        $.mockjax
            url: 'http://server/gimme/data'
            responseTime: 0
            responseText: 'fake Data'
    
    it 'should wait until async operation is completed', (done)->
        
        $('#async').bind 'event', ->
            done()
            
        SUT()