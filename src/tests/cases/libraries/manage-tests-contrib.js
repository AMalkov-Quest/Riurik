function stubFile(path) {
  var url = contexter.URL(context, 'actions/test/stub/?path=' + path);
  QUnit.log('stub file: ', url);
  
  $.ajax({
    url: url,
    async: false, 
    success: function(data) {
      QUnit.log('stub file ' + path + ' is done', data);
    },
    error: function(data) {
      QUnit.log('stub file ' + path + ' is failed', data);
    }
  });
  
};

function create_suite(name, path, content) {
  create_folder(name, path);
  set_context(path.concat('/', name), content); 
};

function create_folder(name, path) {
  
  $.ajax({
    type: 'POST',
    async: false,
    url: contexter.URL(context, 'actions/folder/create/'),
    data: { 'object-name': name, 'path': path },
    success: function(data) {
      QUnit.log('suite "' + name + '" at "' + path + '" is created');
    },
    error: function() {
      QUnit.log('suite "' + name + '" at "' + path + '" is failed');
    }
  });
  
  return path + '/' + name;
  
};

function create_test(test_name, suite_path) {
  
  $.ajax({
    type: 'POST',
    async: false,
    url: contexter.URL(context, 'actions/test/create/'),
    data: { 'object-name': test_name, 'path': suite_path },
    success: function(data) {
      QUnit.log('create test "' + test_name + '" at "' + suite_path + '" is OK');
    },
    error: function() {
      QUnit.log('create test "' + test_name + '" at "' + suite_path + '" is failed');
    }
  });
};

function delete_object(type, path) {
  var last_index = path.lastIndexOf('/');
  $.ajax({
    type: 'POST',
    async: false,
    url: contexter.URL(context, 'actions/remove/'),
    data: { 'url': path.substring(0, last_index), 'path': path },
    success: function(data) {
      QUnit.log(type + ' at "' + path + '" is deleted');
    },
    error: function(data) {
      QUnit.log('delete '+type+' at "'+path+'" is failed: ', data);
    }
  });
};

function delete_test(test_path) {
  delete_object('test', test_path)
};

function delete_folder(path) {
  delete_object('folder', path)
};

function write_test(path, content) {
  
  $.ajax({
    type: 'POST',
    async: false,
    url: contexter.URL(context, 'actions/test/save/'),
    data: { 'url': path, 'path': path, 'content': content },
    success: function(data) {
      QUnit.log('write script "' + path + '" is done');
    },
    error: function() {
      QUnit.log('write script '+ path + '" is failed: ', data);
    }
  });
};

function set_context(path, content) {
  write_test(path + '/.context.ini', content)
};

function walker( baseurl , callback ){
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