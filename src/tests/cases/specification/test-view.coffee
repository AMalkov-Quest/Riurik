module 'test view'

QUnit.setup ->
  using context, ->
    @spec_url = "http://yandex.com"
    @spec_title = "yandex"
    @suite_path = "#{@root}/#{@cws}/second-suite"
    @test_name = 'first-test'
    @test_path = "#{@suite_path}/#{@test_name}.coffee"
    
    set_context(@suite_path, "[#{@cws}]")
    write_test(@test_path, "test 'first test', -> ok true, 'ok'")

asyncTest 'should propose to create new specification', ->
  $.when( frame.go "#{context.test_path}?editor" ).then ->
    ok _$('a#spec-link').is(':visible'), 'Spec button is visible'
    equal _$('a#spec-link').attr('href'), "#{context.spec_ini}?editor", 'url to create new specification config file'
    equal _$('a#spec-link').attr('target'), "_blank", 'should be opend in new tab or window'
    start()
    
asyncTest 'should create new specification config file', ->
  _$('a#spec-link').removeAttr('target')
  simulateClick 'spec-link', 'click'
  $.when( frame.load() ).then ->
    fwnd = frame.window()
    $.waitFor.condition( -> fwnd.editor? ).then ->
      QUnit.substring fwnd.editor.getValue(), "[DEFAULT]\nurl=\ntitle=", 'config is created by a template'
      fwnd.editor.setValue("[#{context.test_name}]\nurl=#{context.spec_url}\ntitle=#{context.spec_title}")
      simulateClick 'save', 'click'
      start()
      
asyncTest 'should provide link to the specification', ->
  $.waitFor.sleep(1000).then ->
    $.when( frame.go "#{context.test_path}?editor" ).then ->
      equal _$('a#spec-link').attr('href'), context.spec_url, 'url to view specification'
      start()
    
QUnit.teardown ->
  delete_folder context.suite_path
