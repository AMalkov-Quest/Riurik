function NewSPSiteCollection(url, owner, title)
{
 /*
  $webApp = [Microsoft.SharePoint.Administration.SPWebApplication]::Lookup("{url}");
  $site = $webApp.Sites.Add("{url}", "{title}", "", 1033, "STS#0", "{owner}", "", "");
 */
}

function NewRootSPTLS(url, owner)
{
 /*
  $webApp = [Microsoft.SharePoint.Administration.SPWebApplication]::Lookup("{url}");
  $tls = $webApp.Sites.Add("", "{owner}", "");
  $webApp.Update();
  $tls.Dispose();
 */
}

function NewSPWebApp(name, port, owner, password)
{
 /*
  $farm = [microsoft.sharepoint.administration.spfarm]::local;
  $builder = new-object microsoft.sharepoint.administration.SPWebApplicationBuilder($farm);
  $builder.Port = {port};
  $builder.ApplicationPoolId = "SharePoint - {port}";
  $builder.CreateNewDatabase = $true;
  $builder.DatabaseName = "WSS_Content_{name}";
  $builder.UseNTLMExclusively = $true;
  $builder.AllowAnonymousAccess = $false;
  $builder.UseSecureSocketsLayer = $false;
  $webApp = $builder.Create();
  $webApp.Provision();
  $webApp.ApplicationPool.CurrentIdentityType = [Microsoft.SharePoint.Administration.IdentityType]::SpecificUser;
  $webApp.ApplicationPool.Username = "{owner}";
  $webApp.ApplicationPool.Password = "{password}";
  $webApp.ApplicationPool.Provision();
 */
}