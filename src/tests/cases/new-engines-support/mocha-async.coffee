describe 'jasmine provides asyncronouse specs support', ->
    
    waitsFor = (condition)->
        
        dfd = $.Deferred()
        
        check = ->
            if condition()
                dfd.resolve()
            else
                setTimeout( check , 10)
            
        check()
        return dfd.promise(dfd)
    
    beforeEach ->
        $('<div id="async" style="display:none"></div>').appendTo('body')
        $('#async').bind 'event', ->
            $('<p>test</p>').appendTo('div#async')
            $('#async').show()
        
    it 'should wait until async operation is completed', (done)->
        
        $.when( waitsFor -> $('#async').is( ':visible' ) ).then ->
            expect( $('#async p').text() ).to.be('test')
            done()
        
        $('#async').trigger('event')