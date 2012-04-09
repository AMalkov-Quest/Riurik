module 'suite'

QUnit.setup ->
  using context, ->
    @suite_path = "#{@root}/remote-tests/first-suite"
    @test1_path = "#{@suite_path}/first-test.coffee"
    @test2_path = "#{@suite_path}/second-test.coffee"
    suite_context = 'remote-app'
    @url = contexter.URL(context, "actions/suite/run/?path=/#{@suite_path}&context=#{suite_context}")
    
    set_context(@suite_path, "[#{suite_context}]\nhost=localhost\nport=#{@remote_port}")
    write_test(@test1_path, "test 'first test', -> ok true, 'ok'")
    write_test(@test2_path, "test 'second test', -> ok true, 'ok'")
             
asyncTest 'should be executed on the remote server', ->
  $.when( frame.go(context.url) ).then ->
    $.wait( frameTestsAreDone ).then ->
      QUnit.substring frame.window().location.host, "#{context.remote_port}", 'suite is executed on the remote server' 
      equal _$('.test-name').length, 2, 'both tests are executed on the remote server'
      start()
    
QUnit.teardown ->
  delete_folder context.suite_path