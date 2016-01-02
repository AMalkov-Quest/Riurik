describe 'jasmine provides asyncronouse specs support', ->
    
    beforeEach ->
        $('<div id="async" style="display:none"></div>').appendTo('body')
        $('#async').bind 'event', ->
            $('#async').show()
        
    it 'should wait until async operation is completed', ()->
        
        runs ->
            $('#async').trigger('event')

        waitsFor(
            (=> $('#async').is( ':visible' ) ),
            'div should be visible',
            1000
        )