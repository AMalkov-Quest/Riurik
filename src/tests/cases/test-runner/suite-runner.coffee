module 'suite runner'

QUnit.setup ->
  path = "actions/suite/run/?path=#{context.root}/suite-for-testing&context=localhost"
  context.url = contexter.URL context, path
  
asyncTest 'suite is executed', ->
  $.when( frame.go context.url ).then ->
    $.wait.condition( -> frameTestsAreDone() ).then ->
      ok typeof frame.window().context != 'undefined', 'context is generated'
      ok _$('#qunit-testresult').length == 1, 'test result is present'
      equal _$('.test-name').length, 5, 'all tests are ran'
      start()