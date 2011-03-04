module('check all web apps and csv export', {
      
  setup: function() {
    
    context.count = {}
    context.count.scollections = 1;
    context.count.sites = 1;
    context.count.dbs = 1;
    context.count.users = 1;
    context.count.size = '551.0 KB';
    var month = new Date().getMonth()+1;
    if ( month < 10 ) month = '0'+month;
    var year = new Date().getFullYear();
    var day = new Date().getDate();
    context.count.date = year+'-'+month+'-'+day;
  }
  
});

function findAppRow(_$, port) {
  var url = contexter.webAppUrl(context.host, port);
  return _$('> div', _$('a[href=' + url + ']').parents('.list-item'));
}

asyncTest('verify report counters', function() {
  
  $.when( frame.go( contexter.full_url(context.report_url ) ) ).then(function(_$) {
  
    $.wait(dataGatheringDone, 20000).then(function() { 
        
       QUnit.rowEqual(
          findAppRow(_$, context.ports[1]).not(':first'),
          [context.count.size, context.count.users, context.count.dbs, context.count.sites, context.count.scollections],
          contexter.webAppUrl(context.host, context.ports[1])
        );
      
       QUnit.rowEqual(
          findAppRow(_$, context.ports[2]).not(':first'),
          [context.count.size, context.count.users, context.count.dbs, context.count.sites, context.count.scollections],
          contexter.webAppUrl(context.host, context.ports[2])
        );
      
       QUnit.rowEqual(
          findAppRow(_$, context.ports[3]).not(':first'),
          [context.count.size, context.count.users, context.count.dbs, context.count.sites, context.count.scollections],
          contexter.webAppUrl(context.host, context.ports[3])
        );
        
        start();
      });
    
  });
});


asyncTest('verify CSV export data', function() {
   $.get(
     context.url + '/enterprise_report_export?type=WebApplication',
     function(data){
       console.log(data);
       var data = data.split('\n');
       
       data.shift();
       data.pop();
       for (row in data) {
         data[row] = data[row].split(',').map(function(el){ return el.replace(/^"/g, '').replace(/"\s*$/g, ''); });
       }
       
       equal( context.ports.length , data.length , 'CSV row count is OK');
       
       QUnit.rowEqual(
          data[1],
          [contexter.webAppUrl(context.host, context.ports[1]), context.count.date, context.count.scollections, context.count.sites, context.count.dbs, context.count.users, context.count.size],
          contexter.webAppUrl(context.host, context.ports[1])
        );
      
       QUnit.rowEqual(
          data[2],
          [contexter.webAppUrl(context.host, context.ports[2]), context.count.date, context.count.scollections, context.count.sites, context.count.dbs, context.count.users, context.count.size],
          contexter.webAppUrl(context.host, context.ports[2])
        );
      
       QUnit.rowEqual(
          data[3],
          [contexter.webAppUrl(context.host, context.ports[3]), context.count.date, context.count.scollections, context.count.sites, context.count.dbs, context.count.users, context.count.size],
          contexter.webAppUrl(context.host, context.ports[3])
        );
         
       start();
     }
   );
});
