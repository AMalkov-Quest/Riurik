module('breadcrumbs');

asyncTest('check button for directory listing', function() {
  var URL = contexter.URL(context, '/');
  
  $.when( frame.go(URL) ).then(function(_$) {
    
    equal(_$('#new-suite').is(":visible"), true, 'Create suite button exists');
    equal(_$('#new-test').is(":visible"), true, 'Create test button exists');
    
    start();
    
  });
});

walker = function( baseurl , callback ){
  // walker is a function to recurse inspecting of a folder 
  // Params:
  // url - (base url) start url for directory walking
  // Returns:
  // Nothing, but for every inner folder call a callback with arguments:
  // callback( innerFolders, innerSuites, innerFiles )
  // where:
  //  innerFolders - array of folder names
  //  innerSuites  - array of suites names
  //  innerFiles   - array of file names
  //  _$           - jQuery instance for this page
  // All paths represents as a full path from base url
  // if a callback returns 'false' then walker stops
  
  $.when( frame.go(baseurl) ).then(function(_$){
    var innerFolders = [];
    var innerSuites = [];    
    var innerFiles = [];
    _$('ul li.folder a').each(function(){
      innerFolders.push( baseurl + _$(this).attr('href') );
    });
    _$('ul li.suite a').each(function(){
      innerSuites.push( baseurl + _$(this).attr('href') );
    });
    _$('ul li.test a').each(function(){
      innerFiles.push( baseurl + _$(this).attr('href') );
    });
    console.log(baseurl, innerFolders);
    console.log(baseurl, innerSuites);
    console.log(baseurl, innerFiles);    
    var result = callback( innerFolders, innerSuites, innerFiles, _$ );
    if ( result === false ) {
    } else {
      $(innerFolders).each(function(i, folderPath){
        setTimeout(function(){
          console.log('call walker', folderPath)
            walker(folderPath, callback );
        }, 1500);
        
      });
      $(innerSuites).each(function(i, suitePath){
        setTimeout(function() {
          console.log('call walker', suitePath)
            walker(suitePath, callback );
        }, 1500);
      });
  }
  });
}

asyncTest('check button for file editor', function() {
  
  var get_files_path = function( folders, suites, tests, _$ ){
    //console.log(arguments)
    
    if ( tests.length > 0 ) {
      var testurl = tests[0];
      $.when( frame.go(testurl) ).then(function(_$){
        
        equals(_$('#run').is(":visible"), true, 'Run button exists at ' + testurl);
        equals(_$('#save').is(":visible"), true, 'Run button exists at ' + testurl);
        equals(_$('#discard').is(":visible"), true, 'Run button exists at ' + testurl);
        equals(_$('#close').is(":visible"), true, 'Run button exists at ' + testurl);
        
        start();
      })
      
      //return false
    }
  };
  
  walker( url, get_files_path );
  
});