$(function initAceEditor(){
    window.editor = ace.edit("code");
    editor.setTheme("ace/theme/chrome");
    var mode = ( /\.coffee\?/.test(window.location.href) ) ? "coffee" : "javascript";
    editor.getSession().setMode(new (ace.require("ace/mode/"+mode).Mode)());

    editor.commands.addCommand({
        name: 'Save',
        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
        exec: function(editor) {
            $('#save').trigger('click');
        }
    });

    editor.commands.addCommand({
        name: 'Run',
        bindKey: {win: 'Ctrl-R',  mac: 'Command-R'},
        exec: function(editor) {
            $('#run').trigger('click');
        }
    });

    editor.getSession().on('change', function(e) {
        if ( mode == 'coffee' ) {
            coffeeScriptSyntaxChecker(editor.getValue(), '#syntax');
        }
    });
});
