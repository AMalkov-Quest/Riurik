module 'include tests'

QUnit.setup ->
  path = "actions/suite/run/?path=#{context.root}/suite-for-testing&context=test-include"
  context.url = contexter.URL(context, path)

asyncTest 'runs only given tests', ->
  $.when( frame.go( context.url ) ).then ->
    $.wait.condition( -> frameTestsAreStarted() ).then ->
      frame.window().QUnit.done = ->
        equal _$('.test-name').length, 3, 'only given tests are ran'
        equal _$('.test-name').first().text(), 'first test'
        equal _$('.test-name').last().text(), 'fifth test'
        start()