$(function initAceEditor(){
    window.editor = ace.edit("code");
    editor.setTheme("ace/theme/riurik");
    var modeprob = function(ext, name) {
        console.log("\\."+ext+"\\?", (new RegExp("\."+ext+"\?")).test(window.location.href))
        return ((new RegExp("\\."+ext+"\\?")).test(window.location.href))? name : null ;
    };
    var mode = modeprob('coffee', 'coffee')
            || modeprob('feature', 'gherkin')
            || modeprob('js', 'javascript');
   
    console.log(mode) 
    if (mode != null) {
        editor.getSession().setMode(new (require("ace/mode/"+mode).Mode)());
    }

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
