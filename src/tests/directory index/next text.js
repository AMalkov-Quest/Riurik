var url = 'http://spb0281:8001/cases';

module('first test');

asyncTest('create folder', function() {
  $.when( go(url) ).then(function(_$) {
    
    _$('a#new-folder').click();
    
    setTimeout(function() {  
      equal(_$('#createFSObjectDialog').is(":visible"), true, 'visible');  
      start();
    }, 2000);
    
  });
});