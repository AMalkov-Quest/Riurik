describe 'FrontPage', ->
    
before ->
    alert context.host

it 'should invite to login with github', (done)->
    $.when( frame.go( '' ) ).then ->
        #equal _$('a#github').length, 1
        #equal _$('a#github').text(), 'Log in with github'
        done()
        
it 'should provide github access level selection', ->
    #$.when( _$('a#github').click() and _$('div#github-dialogs').is(':visible') ).then ->
    #    start()
        
    #$.after( _$('a#github').click() ).should ->
    #    _$('div#github-dialogs').be(':visible')
    
    $.waitFor.condition( -> _$('div#github-dialogs' ).is(':visible') ).then ->
        #equal _$('select#scope').length, 1, 'github options selector exists'
        #equal _$('select#scope option').length, 3, 'number of the options'
        #ok _$('select#scope option[value=""]').attr('selected'), 'default option selected'
        #equal _$('input.agree').length, 1, 'OK button exists'
        #equal _$('input.agree').attr('value'), 'OK'
        
        done()
        
    _$('a#github').click()