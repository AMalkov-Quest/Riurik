#http://ec2-23-22-116-98.compute-1.amazonaws.com/Hunter/test_common/dynamic_tab.coffee?editor

describe 'top 5 sites', ->
    
    beforeEach ->
        
        this.addMatchers(
            _shouldBeWellFormedViewMoreLink: (expected_text, expected_href)->
                el = this.actual
                return el.is( ':visible' ) and el.text() ==  expected_text and el.attr( 'href' ) == expected_href and el.attr( 'target' ) == '_blank'
            
            shouldBeWellFormedViewMoreLink: (expected_text, expected_href)->
                el = this.actual
                expect( el.is( ':visible' ) ).toBeTruthy()
                expect( el.text() ).toEqual( expected_text )
                expect( el.attr( 'href' ) ).toEqual( expected_href )
                expect( el.attr( 'target' ) ).toEqual( '_blank' )
                return true
        )
        
        $('<div id="view_more"></div>').appendTo('body')
        $('<a href="http://show_all_sites" class="viewmorelink" target="_blank">View More</a>').appendTo('#view_more')
        
    
    it 'should have the view more link', ->
        link = $( "div#view_more a.viewmorelink" )
        expect( link ).shouldBeWellFormedViewMoreLink('View More', "http://show_all_sites")
        
    

		
    	
        
    

		
    	