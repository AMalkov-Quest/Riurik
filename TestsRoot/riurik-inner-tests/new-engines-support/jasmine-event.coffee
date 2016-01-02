SUT = ->
    $.get 'http://server/gimme/data', (data)->
        $("<p>#{data}</p>").appendTo('div#async')
        $('#async').show()
        $('#async').trigger('event')
                
describe 'jasmine provides asyncronouse specs support', ->
                
    beforeEach ->
        $('<div id="async" style="display:none"></div>').appendTo('body')
        spyOn($, 'get').andCallFake (url, callback)->
            callback('faked data')
    
    it 'should wait until async operation is completed', ()->
        
        done = false
        $('#async').bind 'event', ->
            done = true
            
        runs ->
            SUT()
            
        waitsFor(
            (=> done ),
            'event should be fired',
            1000
        )