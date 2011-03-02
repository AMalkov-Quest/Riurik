function NewSPSite(url, name) {
  /*
  $spSite = Get-SPSite {url};
  $spWeb = $spSite.OpenWeb();
  $spWeb.Webs.Add("{name}");
  */
}

$(document).ready(function () {
  ps.server = 'sp-2k10-u4';
  ps.eval(NewSPSite, 'http://sp-2k10-u4:1703', 'new-site-4');
});