function full_url(context, url) {
  return 'http://' + context.host + ':' + context.port + '/' + url;
}