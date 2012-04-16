module 'Waits'

asyncTest 'should wait for a certain condition to occure', ->
  expect(1)
  waits = new riurik.Waits()
  waits.wait( -> riurik.vartest1? ).then ->
    pass('waiting is resolved successfully')
    start()
    
  riurik.vartest1 = {}

asyncTest 'should fail a test if timeout is exceeded', ->
  expect(1)
  timeout = 100
  sinon.stub window, "ok"
  
  waits = new riurik.Waits()
  waits.wait( (()-> riurik.vartest2?), timeout ).then -> pass()
  
  stop()
  setTimeout (() ->
    QUnit.ok window.ok.withArgs(false, '').calledOnce, 'the test was failed'
    start()
  ), timeout + 1000