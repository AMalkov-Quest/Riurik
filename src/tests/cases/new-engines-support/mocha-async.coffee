describe 'jasmine provides asyncronouse specs support', ->
    
    beforeEach ->
        $('<div id="async" style="display:none"></div>').appendTo('body')
        $('#async').bind 'event', ->
            $('#async').show()
        
    it 'should wait until async operation is completed', (done)->
        
        $('#async').trigger('event')

        $.waitFor.condition(
            (=> $('#async').is( ':visible' ) ),
            1000
        ).then -> done()