describe 'FrontPage', ->
    
before (done) ->
    $.when( frame.go( 'github/logout' ) ).then ->
        done()

it 'should invite to login with github', (done)->
    $.when( frame.go( '' ) ).then ->
        done()