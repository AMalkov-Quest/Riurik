module 'locking editor'

QUnit.setup ->
    context.test_name = 'example.js'
    context.suite_path = "riurik-inner-tests/test-editor"
    context.test_path = "/#{context.suite_path}/#{context.test_name}"
    create_test context.test_name, context.suite_path
    
QUnit.asyncTest 'the test can be edited', ->
    $.when( frame.go "#{context.test_path}?editor" ).then ->
        ok _$('a#run').is(':visible'), 'Run test button is visible'
        ok _$('a#context-preview-ctrl').is(':visible'), 'Context button is visible'
        ok _$('a#spec-link').is(':visible'), 'Spec button is visible'
        ok _$('a#save').is(':visible'), 'Save button is visible'
        ok _$('a#close').is(':visible'), 'Close button is visible'
        
        start()

QUnit.asyncTest 'the test is in the read only mode', ->
    emulateAnotherSession _$
    $.when( frame.go "#{context.test_path}?editor" ).then ->
        ok frame.window().editor.getReadOnly()
      
        ok _$('#code').length == 1, 'editor should exists'
        ok _$('#run').length == 1, 'the Run button should be'
        ok _$('#unstub').length == 1, 'the Get Control button should be'
        ok _$('#close').length == 1, 'the Close button should be'
    
        ok _$('#context-preview-ctrl').length == 0, 'the Context button should not be shown'
        ok _$('#spec-link').length == 0, 'the Spec button should not be shown'
        ok _$('#save').length == 0, 'the Save button should not be shown'
    
        start()

QUnit.teardown ->
    restorePreviousSession _$
    delete_test context.test_path