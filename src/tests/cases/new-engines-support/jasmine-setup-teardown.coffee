describe "A spec (with setup and tear-down)", ->
  foo = null

  beforeAll ->
    foo = 0
  
  beforeEach ->
    foo = 0
    foo += 1

  afterEach ->
    foo = 0

  it "is just a function, so it can contain any code", ->
    expect(foo).toEqual(1)

  it "can have more than one expectation", ->
    expect(foo).toEqual(1)
    expect(true).toEqual(true)