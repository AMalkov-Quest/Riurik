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
  var URL_create_test = contexter.URL(context, 'actions/remove/');
  if ( typeof callback_func != 'function' ) { callback_func = function(){}; };
  if ( typeof callback_err != 'function' ) { callback_err = function(){}; };
  if ( typeof callback_args == 'undefined' ) { callback_args = []; };
  if ( typeof callback_context == 'undefined' ) { callback_context = null; };
  $.post(
    URL_create_test,
    { 'url': path, 'path': path },
    function(data) {
      QUnit.log('delete '+type+' at "'+path+'" is OK');
      callback_args.push(data);
      callback_func.apply(callback_context, callback_args);
    })
    .error(function(data) {
      QUnit.log('delete '+type+' at "'+path+'" is failed');
      callback_args.push(data);
      callback_err.apply(callback_context, callback_args);
  });
};

function delete_test(test_name, test_path, callback_func, callback_args, callback_context) {
  delete_object('test', test_path+'/'+test_name+'.js', callback_func, callback_args, callback_context)
};