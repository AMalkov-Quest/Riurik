module 'removing coffee script'

QUnit.setup ->
  using context, ->
    @suite_path = "#{@root}/coffeescript/first-suite"
    @test1_path = "#{@suite_path}/first-test.coffee"
    @test2_path = "#{@suite_path}/second-test.coffee"
    suite_context = 'coffee'
    @url = contexter.URL(context, "actions/suite/run/?path=/#{@suite_path}&context=#{suite_context}")
    
    set_context(@suite_path, "[#{suite_context}]")
    write_test(@test1_path, "test 'first test', -> ok true, 'ok'")
    write_test(@test2_path, "test 'second test', -> ok true, 'ok'")
             
asyncTest 'should delete compiled js file so it will not be executed next time', ->
  $.when( frame.go(context.url) ).then ->
    $.wait( -> frame.window().QUnit.riurik? and frame.window().QUnit.riurik.status == 'done' ).then ->
      equal _$('.test-name').length, 2, 'both tests are executed first time'
      delete_test context.test2_path
      $.when( frame.go(context.url) ).then ->
        $.wait( -> frame.window().QUnit.riurik? and frame.window().QUnit.riurik.status == 'done' ).then ->
          equal _$('.test-name').length, 1, 'only one test is executed next time'
          start()
    
QUnit.teardown ->
  delete_folder context.suite_path