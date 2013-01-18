describe 'cloud front page', ->
    
    before (done) ->
        $.when( frame.go( 'github/logout' ) ).then ->
            $.when( frame.go( '' ) ).then ->
                done()
            
    it 'should show login with github link', ->
        
        expect( _$('a#github') ).to.be.visible()
        
    it 'should show riurik inner tests', (done)->
        
        list = _$( 'div#dir-index-id ul li' )
        expect( list ).to.have.length(1)
        context.folder_root = list.first().text().trim()
        expect( context.folder_root ).to.equal( 'riurik-inner-tests' )
        
        $.when( frame.go( context.folder_root ) ).then ->
            
            list = _$( 'div#dir-index-id ul li' )
            expect( list.length ).to.above(0)
            
            context.subfolder = list.first().text().trim()
            $.when( frame.go( "#{context.folder_root}/#{context.subfolder}" ) ).then ->
            
                done()
        
    it 'shold show read only test scripts content', (done)->

        test_script = _$( 'div#dir-index-id ul li' ).first().text().trim()
        $.when( frame.go( "#{context.folder_root}/#{context.subfolder}/#{test_script}?editor" ) ).then ->

            done()
            
            
            