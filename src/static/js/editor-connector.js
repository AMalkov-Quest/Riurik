$(function initAceEditor(){
    window.editor = ace.edit("code");
    editor.setTheme("ace/theme/chrome");
    var mode = ( /\.coffee\?/.test(window.location.href) ) ? "coffee" : "javascript";
    editor.getSession().setMode(new (ace.require("ace/mode/"+mode).Mode)());
});
