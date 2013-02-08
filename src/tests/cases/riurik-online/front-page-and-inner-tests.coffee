describe 'front page and Riurik inner tests', ->
    
    before (done)->
        $context.index_selector = "div#dir-index-id ul li"
        $.when( frame.go( 'github/logout' ) ).then ->
            $.when( frame.go( '' ) ).then ->
                done()
                
    describe 'the riurik inner tests root folder should be shown', ->
        
        before ->
            $context.list = _$( 'div#dir-index-id ul li' )
        
        it 'should be single root folder', ->
            expect( $context.list.length ).to.equal(1)
        
        it 'should have appropriate name', ->
            $context.folder_root = $context.list.first().text().trim()
            expect( $context.folder_root ).to.equal( 'riurik-inner-tests' )
            
    describe 'should show content of the riurik inner tests folder', ->
    
        before (done)->
            $.when( frame.go( $context.folder_root ) ).then ->
                done()
        
        it 'content should not be empty', ->
            $context.list = _$( $context.index_selector )
            expect( $context.list ).not.to.be.empty
        
        it 'horizontal toolbar should provide only the login with github link', ->
            expect( _$('ul.horizontal-menu').length ).to.equal( 1 )
            expect( _$( $context.gitlink_selector ) ).to.be.visible
            
        it 'the settings link should not be visible', ->
            expect( _$('#virtual-settings') ).not.to.be.visible
            
        it 'the create suite link should not be visible', ->
            expect( _$('#new-suite') ).not.to.be.visible
            
    describe 'should show content of the riurik inner tests suite', ->
    
        before (done)->
            $context.subfolder = $context.list.first().text().trim()
            $.when( frame.go( "#{$context.folder_root}/#{$context.subfolder}" ) ).then ->
                $context.list = _$( $context.index_selector )
                done()
            
        it 'content should not be empty', ->
            expect( $context.list ).not.to.be.empty
        
        it 'horizontal toolbar should provide only the login with github link', ->    
            expect( _$('ul.horizontal-menu').length ).to.equal( 1 )
            expect( _$( $context.gitlink_selector ) ).to.be.visible
        
        it 'the run link should not be visible', ->
            expect( _$('#run-suite-btn') ).not.to.be.visible
            
        it 'the history link should not be visible', ->
            expect( _$('#history') ).not.to.be.visible
            
        it 'the context link should not be visible', ->
            expect( _$('#context-preview-ctrl') ).not.to.be.visible
            
        it 'the spec link should not be visible', ->
            expect( _$('#spec-link') ).not.to.be.visible
            
        it 'the create test link should not be visible', ->
            expect( _$('#new-test') ).not.to.be.visible

    describe 'shold show a test scripts content', ->

        before (done)->
            test_script = _$( 'div#dir-index-id ul li' ).first().text().trim()
            $context.test_script_fullpath = "#{$context.folder_root}/#{$context.subfolder}/#{test_script}?editor"
            $.when( frame.go( $context.test_script_fullpath ) ).then ->
                done()
        
        it 'the script should be shown in the read-only mode', ->
            expect( frame.window().editor.getReadOnly() ).to.be.true
            
        it 'the run link should be visible', ->    
            expect( _$('#run') ).to.be.visible
            
        it 'the close link should be visible', ->
            expect( _$('#close') ).to.be.visible
            
        it 'the Get Control(mutual exclusion) mechanism should not work here', (done)->
            emulateAnotherSession _$
            $.when( frame.go( $context.test_script_fullpath ) ).then ->
                expect( _$('#unstub') ).not.to.be.visible
                
                restorePreviousSession _$
                done()