welcomepage_buttons = function(url) {
	this.testname = 'Welcome page buttons';
	this.url = url || /http:\/\/.*?\//.exec(window.location.href || document.url)[0];
	this.run = function() { 
/*        Test = this;
        next(function(){
              return Test.import('contrib.infoportal');
        }).
        next(function(){
              return Test.make('infoPortal', 'InfoPortal', 'iexplore');
        }).
        next(function(){
              return Test.call('infoPortal', 'get_port');
        }).
        // Check Add farm button 
        next(function(){
            return Test.call('infoPortal', 'go', Test.url+'welcome')
        }).
        next(function(){
            return Test.call('infoPortal', 'wait_for_element_present', 'id=bd', '100000');
        }).
        next(function(){
            return Test.call('infoPortal', 'click', 'id=addFarmLink');
        }).
        next(function(){
            return Test.call('infoPortal', 'wait_for_page_to_load', '15000');
        }).
        next(function(){
            return Test.call('infoPortal', 'check', 'get_relative_url', '/addfarm');
        }).
        next(function(){
            return Test.call('infoPortal', 'shut_down');
        });
*/

	};
}
welcomepage_buttons.prototype = new BaseTest();
welcomepage_buttons.prototype.constructor = welcomepage_buttons;
welcomepage_buttons.superClass = BaseTest.prototype;
var welcomepage_buttons_test = new welcomepage_buttons();

TestRunner.addTest(welcomepage_buttons_test);

