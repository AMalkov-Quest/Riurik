function create_suite(name, path) {
  $.post(
    contexter.URL(context, 'actions/suite/create/'),
    { 'object-name': name, 'path': path },
    function(data) {
      QUnit.log('suite "' + name + '" at "' + path + '" is created');
    })
    .error(function() {
      QUnit.log('suite "' + name + '" at "' + path + '" is failed');
  });
};

function create_test(test_name, test_path, callback_func, callback_err, callback_args, callback_context) {
  var URL_create_test = contexter.URL(context, 'actions/test/create/');
  if ( typeof callback_func != 'function' ) { callback_func = function(){}; };
  if ( typeof callback_err != 'function' ) { callback_err = function(){}; };
  if ( typeof callback_args == 'undefined' ) { callback_args = []; };
  if ( typeof callback_context == 'undefined' ) { callback_context = null; };
  $.post(
    URL_create_test,
    { 'object-name': test_name, 'path': test_path },
    function(data) {
      QUnit.log('create test "'+test_name+'" at "'+test_path+'" is OK');
      callback_args.push(data);
      callback_func.apply(callback_context, callback_args);
    })
    .error(function() {
      QUnit.log('create test "'+test_name+'" at "'+test_path+'" is failed');
  });
};

function delete_object(type, path, callback_func, callback_err, callback_args, callback_context) {
  if ( typeof callback_func != 'function' ) { callback_func = function(){}; };
  if ( typeof callback_err != 'function' ) { callback_err = function(){}; };
  if ( typeof callback_args == 'undefined' ) { callback_args = []; };
  if ( typeof callback_context == 'undefined' ) { callback_context = null; };
  
  var last_index = path.lastIndexOf('/');
  $.post(
    contexter.URL(context, 'actions/remove/'),
    { 'url': path.substring(0, last_index), 'path': path },
    function(data) {
      QUnit.log(type + ' at "' + path + '" is deleted');
      callback_args.push(data);
      callback_func.apply(callback_context, callback_args);
    })
    .error(function(data) {
      QUnit.log('delete '+type+' at "'+path+'" is failed: ', data);
      callback_args.push(data);
      callback_err.apply(callback_context, callback_args);
  });
};

function delete_test(test_name, test_path, callback_func, callback_args, callback_context) {
  delete_object('test', test_path+'/'+test_name+'.js', callback_func, callback_args, callback_context)
};

function delete_suite(path) {
  delete_object('suite', path)
};

function write_test(path, content) {
  $.post(
    contexter.URL(context, 'actions/test/save/'),
    { 'url': path, 'path': path, 'content': content },
    function(data) {
      QUnit.log('context for "' + path + '" is set');
    })
    .error(function(data) {
      QUnit.log('set context for '+ path + '" is failed: ', data);
  });
};

function set_context(path, content) {
  write_test(path + '/.context.ini', content)
};