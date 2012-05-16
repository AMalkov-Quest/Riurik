module 'suite setup'

QUnit.setup ->
  context.suite_path = "#{context.root}/first-suite"
  test1_path = "#{context.suite_path}/first-test.coffee"
  test2_path = "#{context.suite_path}/second-test.coffee"
  ss_path = "#{context.suite_path}/suite-setup.coffee"
  suite_context = 'suite-setup'
  context.url = contexter.URL(context, "actions/suite/run/?path=/#{context.suite_path}&context=#{suite_context}")
  
  set_context(context.suite_path, "[#{suite_context}]")
  write_test(test1_path, "test 'first test', -> ok true, 'ok'")
  write_test(test2_path, "test 'second test', -> ok true, 'ok'")
  write_test(ss_path, "test 'suite setup', -> ok true, 'ok'")
             
asyncTest 'should be executed first of all', ->
  $.when( frame.go(context.url) ).then ->
    $.wait.condition( -> frameTestsAreDone() ).then ->
      equal _$('.test-name').length, 3, 'both suite-setup and tests are executed'
      equal _$('#test-output0 .test-name').text(), 'suite setup', 'suite setup is executed first'
      start()
    
QUnit.teardown ->
  delete_folder context.suite_path