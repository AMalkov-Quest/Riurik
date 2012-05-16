module 'Waits'

test 'should use default timeout', ->
  waits = new riurik.Waits()
  equal waits.timeout, 1000
  
test 'should use given timeout', ->
  waits = new riurik.Waits(250)
  equal waits.timeout, 250

asyncTest 'should wait for a certain condition to occure', ->
  expect(1)
  waits = new riurik.Waits()
  waits.wait( -> riurik.vartest1? ).then ->
    $.pass('waiting is resolved successfully')
    start()
    
  riurik.vartest1 = {}

asyncTest 'should fail a test and continue execution if timeout is exceeded', ->
  sinon.stub QUnit, "ok"
  sinon.stub QUnit, "start"
  
  waits = new riurik.Waits()
  waits.wait( (-> riurik.vartest2?), 1 ).then -> $.pass()
  
  setTimeout ( ->
    QUnit.equal QUnit.ok.withArgs(false, '').calledOnce, true, 'the test was failed'
    QUnit.equal QUnit.start.calledOnce, true, 'tests execution is continued'
    
    QUnit.ok.restore()
    QUnit.start.restore()
    
    start()
  ), 100
  
asyncTest 'should delay execution for give period of time befor fail', ->
  clock = sinon.useFakeTimers()
  waits = new riurik.Waits()
  waits.wait( (-> riurik.vartest2?), 200 ).fail ->
    $.pass()
    
    clock.restore()
    start()
  
  clock.tick(200)
  
asyncTest 'should call given success callback if a certain condition is occured', ->
  expect(1)
  waits = new riurik.Waits()
  waits.wait( -> riurik.vartest3? ).done ->
    $.pass('waiting is resolved successfully')
    start()
    
  riurik.vartest3 = {}
  
asyncTest 'should call given failure callback if a certain condition is not occured', ->
  expect(1)
  waits = new riurik.Waits()
  waits.wait( -> riurik.vartest4? ).fail ->
    $.pass('unsuccessful waiting is resolved')
    start()
    
asyncTest 'the condition method should wait for given condition to occure', ->
  expect(1)
  waits = new riurik.Waits()
  waits.condition( -> riurik.vartest5? ).then ->
    $.pass('waiting is resolved successfully')
    start()
    
  riurik.vartest5 = {}  
  
asyncTest 'the condition method should fail a test with a particular message', ->
  waits = new riurik.Waits()
  waits.condition( (-> riurik.vartest6?), 1 ).fail ->
    $.substring waits.timeoutMessage, 'wait timeout for function'
    $.substring waits.timeoutMessage, 'return riurik.vartest6 != null'
    start()
    
asyncTest 'the sleep method should delay execution for give period of time', ->
  clock = sinon.useFakeTimers()
  waits = new riurik.Waits()
  waits.sleep( 2 ).then ->
    $.pass('test execution is continued')
    clock.restore()
    start()
    
  clock.tick(2)
  
asyncTest 'the sleep method should delay execution for default period of time if there is no given one', ->
  clock = sinon.useFakeTimers()
  waits = new riurik.Waits()
  waits.sleep().then ->
    $.pass('test execution is continued')
    clock.restore()
    start()
    
  clock.tick(1000)
  
asyncTest 'the event method should wait for given event to occure', ->
  target = $(window.document)
  args = 'arg1'
  eName = 'testEvent'
  
  waits = new riurik.Waits()
  waits.event( eName, target ).then (e, args)->
    $.pass 'waiting is resolved successfully'
    equal 'arg1', args, 'arguments are passed'
    start()
    
  target.trigger(eName, args);
  
asyncTest 'the event method should fail a test with a particular message', ->
  eName = 'testEvent'
  
  waits = new riurik.Waits()
  waits.event( eName, $(window.document), 1 ).fail ->
    equal waits.timeoutMessage, "wait timeout for the #{eName} event is exceeded"
    start()