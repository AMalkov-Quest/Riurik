var contexter = {

  webAppUrl: function(host, port) {
    return 'http://' + host + ':' + port;
  },

  SCUrl: function(host, port, title) {
    var waUrl = contexter.webAppUrl(host, port);
    return waUrl + '/sites/' + title;
  },

  full_url: function(url) {
    return context.url + '/' + $.strip(url, '/');
  },

  URL: function(context, path) {
    return 'http://' + context.host + ':' + context.port + '/' + path;
  },
  
  subsite_URL: function(scUrl, siteName) {
    return scUrl + '/' + siteName;
  }
};