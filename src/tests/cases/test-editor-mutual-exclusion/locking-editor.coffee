module 'locking editor'

QUnit.setup ->
    context.test_path = 'riurik-inner-tests/test-editor-mutual-exclusion/example.js'
    
QUnit.asyncTest 'test 1', ->
    $.when( frame.go "/#{context.test_path}?editor" ).then ->
        start()

QUnit.asyncTest 'test 2', ->
    context.sessionid = _$.cookie 'sessionid'
    _$.cookie 'sessionid', '', { 'path': '/' }
    $.when( frame.go "/#{context.test_path}?editor" ).then ->
        start()

QUnit.teardown ->
    _$.cookie 'sessionid', context.sessionid, { 'path': '/' }