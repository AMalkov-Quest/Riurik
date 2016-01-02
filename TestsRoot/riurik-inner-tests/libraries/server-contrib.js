function check_server(host, port) {
  url = 'http://' + host + ':' + port
  QUnit.log(url);
  $.ajax({
    async: false,
    url: 'http://' + host + ':' + port,
    success: function(data) {
      QUnit.log('server on the ' + port + ' port is available');
    },
    error: function() {
      QUnit.log(arguments);
      throw 'server on the ' + port + ' port is not available';
    }
  });
  
};