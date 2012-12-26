module 'first login'

asyncTest 'setup', ->
    $.when( frame.go( '' ) ).then ->
        $.waitFor.condition( -> _$('div#github-dialogs' ).is(':visible') ).then ->
            _$('select#scope option[value="public_repo"]').attr('selected', 'selected')
            start()
            
        _$('a#github').click()

asyncTest 'should execute authorization on github ', ->
    sinon.stub frame.window(), "LogInWithGithub"
    $.waitFor.condition( -> frame.window().LogInWithGithub.calledOnce ).then ->
        equal _$('#scope').val(), 'public_repo'
        start()
        
    _$('input.agree').click()
    
asyncTest 'should propose to create repository', ->
    $.when( frame.go( 'github/signin?login=a-ceceron&password=MurES@sab53' ) ).then ->
        start()
        
asyncTest 'should show created repository in the list', ->
    repo_title = 'riurik-tests'
    mkrepo repo_title
    $.when( frame.go( 'github/signin?login=a-ceceron&password=MurES@sab53' ) ).then ->
        $.waitFor.condition( -> _$('div#github-dialogs' ).is(':visible') ).then ->
            _$("select#repos option[value='#{repo_title}']").attr('selected', 'selected')
            _$('input.agree').click()
            $.waitFor.frame(10000).then ()->
                start()
        
test 'teardown', ->
    delrepo 'riurik-tests'