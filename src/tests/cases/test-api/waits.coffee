module 'Waits'

asyncTest 'should wait for a certain condition to occure', ->
  expect(1)
  waits = new riurik.Waits()
  waits.wait( -> riurik.vartest1? ).then ->
    pass('waiting is resolved successfully')
    start()
    
  riurik.vartest1 = {}

asyncTest 'should fail a test and continue execution if timeout is exceeded', ->
  sinon.stub window, "ok"
  sinon.stub window, "start"
  
  waits = new riurik.Waits()
  waits.wait( (()-> riurik.vartest2?), 100 ).then -> pass()
  
  setTimeout (() ->
    QUnit.ok window.ok.withArgs(false, '').calledOnce, 'the test was failed'
    QUnit.ok window.start.calledOnce, 'tests execution is continued'
    
    window.ok.restore()
    window.start.restore()
    
    start()
  ), 1000
  
asyncTest 'should call given success callback if a certain condition is occured', ->
  expect(1)
  waits = new riurik.Waits()
  waits.wait( -> riurik.vartest3? ).done ->
    pass('waiting is resolved successfully')
    start()
    
  riurik.vartest3 = {}
  
asyncTest 'should call given failure callback if a certain condition is not occured', ->
  expect(1)
  waits = new riurik.Waits()
  waits.wait( -> riurik.vartest4? ).fail ->
    pass('unsuccessful waiting is resolved')
    start()
    
asyncTest 'the condition method should wait for given condition to occure', ->
  expect(1)
  waits = new riurik.Waits()
  waits.condition( -> riurik.vartest5? ).then ->
    pass('waiting is resolved successfully')
    start()
    
  riurik.vartest5 = {}  
  
asyncTest 'the condition method should fail a test with a particular message', ->
  waits = new riurik.Waits()
  waits.condition( (()-> riurik.vartest6?), 1 ).fail ->
    substring waits.timeoutMessage, 'wait timeout for function'
    substring waits.timeoutMessage, 'return riurik.vartest6 != null'
    start()
    
asyncTest 'the sleep method should delay execution for give period of time', ->
  clock = sinon.useFakeTimers()
  waits = new riurik.Waits()
  waits.sleep( 2 ).then ->
    pass('test execution is continued')
    clock.restore()
    start()
    
  clock.tick(2)
  
asyncTest 'the sleep method should delay execution for default period of time if there is no given one', ->
  clock = sinon.useFakeTimers()
  waits = new riurik.Waits()
  waits.sleep().then ->
    pass('test execution is continued')
    clock.restore()
    start()
    
  clock.tick(1000)  