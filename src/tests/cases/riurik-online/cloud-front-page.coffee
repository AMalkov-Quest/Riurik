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
        expect( _$('#configure') ).to.be.empty()
        
        $.when( frame.go( context.folder_root ) ).then ->
            
            list = _$( 'div#dir-index-id ul li' )
            expect( list.length ).to.above(0)
            expect( _$('ul.horizontal-menu') ).to.have.length(1)
            expect( _$('#virtual-settings') ).to.be.empty()
            expect( _$('#new-suite') ).to.be.empty()
            
            context.subfolder = list.first().text().trim()
            $.when( frame.go( "#{context.folder_root}/#{context.subfolder}" ) ).then ->
                
                expect( list.length ).to.above(0)
                expect( _$('ul.horizontal-menu') ).to.have.length(1)
                expect( _$('#run-suite-btn') ).to.be.empty()
                expect( _$('#history') ).to.be.empty()
                expect( _$('#context-preview-ctrl') ).to.be.empty()
                expect( _$('#spec-link') ).to.be.empty()
                expect( _$('#new-test') ).to.be.empty()
            
                done()

    it 'shold show read only test scripts content', (done)->

        test_script = _$( 'div#dir-index-id ul li' ).first().text().trim()
        $.when( frame.go( "#{context.folder_root}/#{context.subfolder}/#{test_script}?editor" ) ).then ->
            expect( frame.window().editor.getReadOnly() ).to.be.ok()
            expect( _$('#run') ).to.not.be.empty()
            expect( _$('#close') ).to.not.be.empty()
            
            expect( _$('#unstub') ).to.be.empty()

            done()