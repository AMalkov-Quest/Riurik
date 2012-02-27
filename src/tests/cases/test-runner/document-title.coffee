module 'document title'

QUnit.setup ->
  context.suite_name = 'for-example'
  context.suite_path = "#{context.root}/test-runner/#{context.suite_name}"
  context.suite_context = 'doc-title'
  context.test_name = "first-test"
  context.test_path = "#{context.suite_path}/#{context.test_name}.coffee"
  
  set_context(context.suite_path, "[#{context.suite_context}]")
      
QUnit.asyncTest 'suite title', ->
  url = contexter.URL(context, "actions/suite/run/?path=/#{context.suite_path}&context=#{context.suite_context}")
  $.when( frame.go url ).then ->
    fwnd = frame.window()
    $.wait( -> fwnd.QUnit? and fwnd.QUnit.riurik? and fwnd.QUnit.riurik.status == 'done' ).then ->
      QUnit.substring frame.document().title, "\u2716", 'should show x if suite has no any asserts'
      QUnit.substring frame.document().title, context.suite_name, 'should show suite name'
      equal frame.document().title.indexOf(context.suite_name), 2, 'suite name follows right after the status sing'
      start()

QUnit.asyncTest 'test title', ->
  write_test(context.test_path, "test 'first test', -> ok true")
  url = contexter.URL(context, "actions/test/run/?path=#{context.test_path}&context=#{context.suite_context}")
  $.when( frame.go url ).then ->
    fwnd = frame.window()
    $.wait( -> fwnd.QUnit? and fwnd.QUnit.riurik? and fwnd.QUnit.riurik.status == 'done' ).then ->
      QUnit.substring frame.document().title, context.test_name, 'should show test name'
      equal frame.document().title.indexOf(context.test_name), 3, 'test name follows right after the status sing'
      start()
    
QUnit.teardown ->
  delete_folder context.suite_path