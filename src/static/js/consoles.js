(function(){
var consoles='developer-consoles',
    status='status-container',
    statusText='status-text',
    consoleLabels='labels',
    toolsConsole, logConsole, gitConsole;

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

var initGitConsole = function( console ) {
    initEl( 'git-status', console, 'a' ).attr('href', '#').text('Status').on('click', function(){
        $.get('/git/status', function(data){
            console.prepend('<hr/>');
            console.prepend(data);
        });
    }).click();
    initEl( 'git-add', console, 'a' ).attr('href', '#').text('Add all').on('click', function(){
        $.get('/git/add', function(data){
            console.prepend('<hr/>');
            console.prepend(data);
        });
    });
    initEl( 'git-commit', console, 'a' ).attr('href', '#').text('Commit').on('click', function(){
        $.get('/git/commit', function(data){
            console.prepend('<hr/>');
            console.prepend(data);
        });
    });
    initEl( 'git-push', console, 'a' ).attr('href', '#').text('Push').on('click', function(){
        $.get('/git/push', function(data){
            console.prepend('<hr/>');
            console.prepend(data);
        });
    });
};

riurik.on("riurik.initing", function(){
    consoles = initEl(consoles, 'body');
    status = initEl(status, consoles);
    statusText = initEl(statusText, status);
    consoleLabels = initEl(consoleLabels, status, 'ul')
    //gitConsole = initConsole( 'git-console', 'Git' );
    //initGitConsole( gitConsole );
    toolsConsole = initConsole( 'powershell-console', 'Tools' );
    logConsole = initConsole( 'riurik-console', 'Logs' );
});

riurik.on("riurik.initing-editor", function(){
    consoles = initEl(consoles, 'body');
    status = initEl(status, consoles);
    consoleLabels = initEl(consoleLabels, status, 'ul')
    gitConsole = initConsole( 'git-console', 'Git' );
    initGitConsole( gitConsole );
});

})();
