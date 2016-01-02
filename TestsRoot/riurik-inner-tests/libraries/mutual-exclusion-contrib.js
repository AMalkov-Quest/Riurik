function emulateAnotherSession(_$) {
  //emulate that the test is open in another browser window
  context.sessionid = _$.cookie('sessionid');
  _$.cookie('sessionid', '', { 'path': '/' });
}

function restorePreviousSession(_$) {
  _$.cookie('sessionid', context.sessionid, { 'path': '/' });
}