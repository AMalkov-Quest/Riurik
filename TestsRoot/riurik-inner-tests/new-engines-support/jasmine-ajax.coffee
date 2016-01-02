SUT = =>
    $('<div id="async" style="display:none"></div>').appendTo('body')
    $.ajax 'http://server/gimme/data',
        type: 'GET'
        success: (data)=>
            $("<p>#{data}</p>").appendTo('div#async')
            $('#async').show()
                
describe 'jasmine provides asyncronouse specs support', ->
    beforeEach ->
        $.mockjax
            url: 'http://server/gimme/data'
            responseTime: 0
            responseText: 'fake Data'
            
    afterEach ->
        $.mockjaxClear()
        
    it 'should wait until async operation is completed', ()->
        runs ->
            SUT()

        waitsFor(
            (=> $('#async').is( ':visible' ) ),
            'div should be visible',
            1000
        )