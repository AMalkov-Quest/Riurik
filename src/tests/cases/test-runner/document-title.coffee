module 'document title'

QUnit.asyncSetup ->
  context.suite_name = 'for-example'
  context.suite_path = "#{context.root}/coffeescript/#{context.suite_name}"
  suite_context = 'doc-title'
  context.url = contexter.URL(context, "actions/suite/run/?path=/#{context.suite_path}&context=#{suite_context}")
  set_context(context.suite_path, "[#{suite_context}]")
  $.when( frame.go(context.url) ).then ->
    fwnd = frame.window()
    $.wait( -> fwnd.QUnit? and fwnd.QUnit.riurik? and fwnd.QUnit.riurik.status == 'done' ).then ->
      start()
             
test 'should show x for suite without any assert', ->
  QUnit.substring frame.document().title, "\u2716"
      
test 'should show suite name', ->
  #QUnit.substring frame.document().title, context.suite_name
  ok frame.document().title.indexOf(context.suite_name) == 0, frame.document().title
  
test 'should show test name', ->
  ok false
    
QUnit.teardown ->
  delete_folder context.suite_path