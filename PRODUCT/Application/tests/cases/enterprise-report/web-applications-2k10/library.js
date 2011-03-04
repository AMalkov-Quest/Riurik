function dataGatheringDone() {
  _$ = frame.jQuery();
  return _$('#ent-web-apps-list li.list-item').not('li.header').length > 0 && _$('#updatingPanel:visible').length == 0;
}