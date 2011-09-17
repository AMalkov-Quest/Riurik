/* gets records in the riurik log file
 * optional agrgument start is interpreted either as seconds since the epoch to get last log records since this time
 * or a flag(value should the 'last' string) to get last record time as seconds since the epoch
 * if it is missed all the content of the log file is returned
*/
function getLogs(start, source) {
  var url = contexter.URL(context, 'logger/records/recv/?start=' + start);
  if(source) {
    url += '&source=' + source;
  }
  QUnit.log('get logs: ', url);
  
  return $.ajax({
    url: url,
    async: false, 
    success: function(data) {
      QUnit.log(data);
    }
  }).responseText;
  
};