function get_search_url() {
  var url_tail = 'search?search_pattern=' + encodeURIComponent( context.search_pattern ) + '&path=' + escape( context.suite_path );
  return $.URI( context, url_tail );
};