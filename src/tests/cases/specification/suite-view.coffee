module 'suite view'

QUnit.setup ->
  using context, ->
    @spec_url = "http://google.com"
    @spec_title = "google"
    @suite_path = "#{@root}/#{@cws}/first-suite"
    set_context(@suite_path, "[#{@cws}]")
             
asyncTest 'should propose to create new specification', ->
  $.when( frame.go context.suite_path ).then ->
    ok _$('a#spec-link').is(':visible'), 'Spec button is visible'
    equal _$('a#spec-link').attr('href'), "#{context.spec_ini}?editor", 'url to create new specification config file'
    equal _$('a#spec-link').attr('target'), "_blank", 'should be opend in new tab or window'
    start()

asyncTest 'should create new specification config file', ->
  _$('a#spec-link').removeAttr('target')
  simulateClick 'spec-link', 'click'
  $.when( frame.load() ).then ->
    $.wait( -> frame.window().editor? ).then ->
      editor = frame.window().editor; 
      editor.setValue("[DEFAULT]\nurl=#{context.spec_url}\ntitle=#{context.spec_title}")
      simulateClick 'save', 'click'
      start()

asyncTest 'should propose to create new specification', ->
  $.when( frame.go context.suite_path ).then ->
    equal _$('a#spec-link').attr('href'), context.spec_url, 'url to view specification'
    start()

    
QUnit.teardown ->
  delete_folder context.suite_path