function simulateClick(elmId, event) {
  if ( typeof event == 'undefined' ) event = 'click';
  var elm = frame.document().getElementById(elmId);
  if ( $.browser.msie === true && $.browser.version != '9.0' ) { // IE < 9 way
    console.log(event, elmId, 'IE way', elm);
    var e = document.createEventObject();
    var canceled = elm.fireEvent('on'+event, e);
  } else { // DOM way
    console.log(event, elmId, 'DOM way', elm);
    var evt = frame.document().createEvent("MouseEvents");
    evt.initMouseEvent(event, true, true, frame.window(),
    0, 0, 0, 0, 0, false, false, false, false, 0, null);
    var canceled = !elm.dispatchEvent(evt);
  }
}
