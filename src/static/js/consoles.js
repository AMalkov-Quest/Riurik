(function(){
var consoles='developer-consoles',
    status='status-container',
    statusText='status-text',
    consoleLabels='labels',
    toolsConsole, logConsole;

var initEl = function( id, appendTo, tag ) {
    tag = tag || 'div';
    return $('<'+tag+'/>').attr('id', id).appendTo( appendTo );
};

var initConsole = function(id, name) {
    var e = initEl(id, consoles ).attr('title', name);
    var li = initEl(name+'-label', consoleLabels, 'li');
    li.on('click', function(){
        if ( e.is(':visible') ) {
            e.hide();
            consoles.removeClass('opened');
        } else {
            $('> [id$=console]:visible', consoles).hide();
            e.show();
            consoles.addClass('opened');
        }
    }).text(name);
    return e;
};

riurik.on("riurik.initing", function(){
    consoles = initEl(consoles, 'body');
    status = initEl(status, consoles);
    statusText = initEl(statusText, status);
    consoleLabels = initEl(consoleLabels, status, 'ul');
    toolsConsole = initConsole( 'powershell-console', 'Tools' );
    logConsole = initConsole( 'riurik-console', 'Logs' );
});
})();
