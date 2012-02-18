module 'removing coffee script'

QUnit.setup ->
  using context, ->
    @suite_name = 'first-suite'
    @suite_path = @root.concat('/coffeescript/', @suite_name)
    @test1_name = 'first-test.coffee'
    @test2_name = 'second-test.coffee'
    @test2_path = "#{@suite_path}/#{@test2_path}"
    @suite_context = 'coffee'
    path = "actions/suite/run/?path=/#{@suite_path}&context=#{@suite_context}"
    @url = contexter.URL(context, path)
    
    delete_folder(@suite_path)
    set_context(@suite_path, '[' + @suite_context + ']')
    write_test(@suite_path + '/' + @test1_name, "test 'first test', -> ok true, 'ok'")
    write_test(@suite_path + '/' + @test2_name, "test 'second test', -> ok true, 'ok'")
             
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