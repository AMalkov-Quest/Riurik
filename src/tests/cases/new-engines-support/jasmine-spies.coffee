describe "A spy", ->
    foo = null
    bar = null
  
    beforeEach ->
        foo = 
            setBar: (value)->
                bar = value

        spyOn foo, 'setBar'

        foo.setBar(123);
        foo.setBar(456, 'another param');

    it 'tracks that the spy was called', ->
        expect(foo.setBar).toHaveBeenCalled()
    
    it 'tracks its number of calls', ->
        expect(foo.setBar.calls.length).toEqual(2)

    it 'tracks all the arguments of its calls', ->
        expect(foo.setBar).toHaveBeenCalledWith(123)
        expect(foo.setBar).toHaveBeenCalledWith(456, 'another param')

    it 'allows access to the most recent call', ->
        expect(foo.setBar.mostRecentCall.args[0]).toEqual(456)

    it 'allows access to other calls', ->
        expect(foo.setBar.calls[0].args[0]).toEqual(123)