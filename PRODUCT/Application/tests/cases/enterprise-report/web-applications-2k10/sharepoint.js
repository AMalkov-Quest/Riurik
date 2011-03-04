function NewSPWebAppOLD(name, port, owner, password)
{
/*
  $farm = [microsoft.sharepoint.administration.spfarm]::local;
  $builder = new-object microsoft.sharepoint.administration.SPWebApplicationBuilder($farm);
  $builder.Port = "{port}";
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
  
  $webApp.ApplicationPool.Provision();
  $tls = $webApp.Sites.Add("", "{owner}", "");
  $webApp.Update();
  $tls.Dispose();
*/
}

function DeleteWebApp(url)
{
/*
 $app = [Microsoft.SharePoint.Administration.SPWebApplication]::Lookup("{url}");
 if ($app -ne $null)
 {
    if ($app.GetType().Name -eq  "SPAdministrationWebApplication")
    {
      throw "Admin VS cannot be deleted";
    }

    $globalAdmin = New-Object Microsoft.SharePoint.Administration.SPGlobalAdmin;
    $globalAdmin.UnextendVirtualServer([string]"{url}", $true);
    $globalAdmin.RefreshConfigCacheOnRemoteServers();
 }
*/
}

function CreateSiteCollection(siteUrl,title,owner)
{
  /*
  
  if ( [Microsoft.SharePoint.SPSite]::Exists("{siteUrl}") -ne $true)
  {
    $webApp = [Microsoft.SharePoint.Administration.SPWebApplication]::Lookup("{siteUrl}");
    $site = $webApp.Sites.Add("{siteUrl}", "{title}", "", 1033, "STS#0", "{owner}", "", "");
  }
  
*/
}



function DeleteSiteCollectionAnon(siteUrl,userName)
{
/*  
  $app = [Microsoft.SharePoint.Administration.SPWebApplication]::Lookup("{siteUrl}");
  foreach ($siteCollection  in $app.Sites) 
  {   
    if ( [string]::Compare($siteCollection.Url,"{siteUrl}",$true) -eq 0)
    {            
      $site = New-Object Microsoft.SharePoint.SPSite("{siteUrl}");
      $web = $site.OpenWeb();
      $user = $web.AllUsers["{userName}"];
      $token = $user.UserToken;
      $impersonatedSiteCollection = New-Object Microsoft.SharePoint.SPSite("{siteUrl}", $token);
      $impersonatedSiteCollection.Delete();
    }
  }
*/
}

function CreateSite(parentUrl, siteName){
/*
  $site = New-Object Microsoft.SharePoint.SPSite("{parentUrl}");
  $spWeb = $site.OpenWeb();
  $exists = $false;
  foreach($web in $spWeb.Webs){
  
  if($web.Title -eq "{siteName}"){$exists = $true;}}
  
  if ($exists -eq $false)
  {
    $spWeb.Webs.Add("{siteName}", "{siteName}", "{siteName}", 1033, "STS#0", $false, $false);
  }
*/
}

function AddUserToSite(url,login,groupName){
/*
     
  $site = new-object 'Microsoft.SharePoint.SPSite' "{url}"

  $site = $site.OpenWeb()
  $allowUnsafeUpdate = $site.AllowUnsafeUpdates
  $site.AllowUnsafeUpdates = $true
  
  $site.SiteUsers.Add("{login}", "", "{login}", "")  
  
  $user = $site.AllUsers["{login}"]  
  $group = $site.SiteGroups["{groupName}"]
  
  $group.AddUser($user)    
  $site.AllowUnsafeUpdates = $allowUnsafeUpdate 
  $site.Update()
  
  $site.Dispose()
*/
}

function CreateSiteCollectionNewDB2(waUrl, scUrl, Title, owner, dbhost,dbname)
{
  /*  
    $webApp = [Microsoft.SharePoint.Administration.SPWebApplication]::Lookup("{waUrl}");
    $webApp.Sites.Add("{scUrl}","{Title}","", 1033, "STS#0", "{owner}", "{owner}", "mail@mail.com","{owner}","{owner}","mail@mail.com","{dbhost}","{dbname}",$null,$null)  
  */
}

function NewSPWebApp(port, owner, password)
{
 /*
  $farm = [microsoft.sharepoint.administration.spfarm]::local;
  $builder = new-object microsoft.sharepoint.administration.SPWebApplicationBuilder($farm);
  $builder.Port = {port};
  $builder.ApplicationPoolId = "SharePoint - {port}";
  $builder.CreateNewDatabase = $true;
  $builder.DatabaseName = "WSS_Content_{port}";
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

function NewSPWebApp2k10(port, owner, password)
{
 /*
  $password = ConvertTo-securestring "{password}" -asplaintext -force
  $farm = [microsoft.sharepoint.administration.spfarm]::local;
  $builder = new-object microsoft.sharepoint.administration.SPWebApplicationBuilder($farm);
  $builder.Port = {port};
  $builder.ApplicationPoolId = "SharePoint - {port}";
  
  $builder.ApplicationPoolUsername = "{owner}";
  $builder.ApplicationPoolPassword = $password;
  $builder.IdentityType = [Microsoft.SharePoint.Administration.IdentityType]::SpecificUser;
  $builder.CreateNewDatabase = $true;
  $builder.DatabaseName = "WSS_Content_{port}";
  $builder.UseNTLMExclusively = $true;
  $builder.AllowAnonymousAccess = $false;
  $builder.UseSecureSocketsLayer = $false;
  $webApp = $builder.Create();
  $webApp.Name = "WebApp - {port}";
  $webApp.Update();
  $webApp.Provision();
 */
}

function NewSPWebAppForAll(port, owner, password,ver)
{
 /* 
  $farm = [microsoft.sharepoint.administration.spfarm]::local;
  $builder = new-object microsoft.sharepoint.administration.SPWebApplicationBuilder($farm);
  $builder.Port = {port};
  $builder.ApplicationPoolId = "SharePoint - {port}";
  
  $builder.CreateNewDatabase = $true;
  $builder.DatabaseName = "WSS_Content_{port}";
  $builder.UseNTLMExclusively = $true;
  $builder.AllowAnonymousAccess = $false;
  $builder.UseSecureSocketsLayer = $false;
  
  if("{ver}" -eq "2010")
  {
    $password = ConvertTo-securestring "{password}" -asplaintext -force
    $builder.ApplicationPoolUsername = "{owner}";
    $builder.ApplicationPoolPassword = $password;
    $builder.IdentityType = [Microsoft.SharePoint.Administration.IdentityType]::SpecificUser;
  }
  
  $webApp = $builder.Create();
  $webApp.Name = "WebApp - {port}";
  $webApp.Update();
  $webApp.Provision();

  if("{ver}" -eq "2007")
  {
  
    $webApp.ApplicationPool.CurrentIdentityType = [Microsoft.SharePoint.Administration.IdentityType]::SpecificUser;
    $webApp.ApplicationPool.Username = "{owner}";
    $webApp.ApplicationPool.Password = "{password}";
    $webApp.Provision();
  }  
 */
}
  

module("web apps enterprise report", {
  
  setup: function() {
    var ps = new PowerShell(context.host);
    ps.server = context.host;
    ps.invoke(NewSPWebAppForAll, 5555, context.user, context.password,2010);
    
    //ps.eval(DeleteWebApp, context.sc_url);
    //ps.eval(CreateSiteCollection, context.sc_url, context.sc_title,context.user);
    //ps.eval(CreateSite,context.sc_url,"tex")
    //ps.eval(DeleteSiteCollectionAnon,context.sc_url,context.user)
    //ps.eval(AddUserToSite,"http://utah-spk10-2:37608", "utah\\aokhotin","Viewers")      
    //ps.eval(CreateSiteCollectionNewDB2,"http://sp-2k10-u1:42604/","http://sp-2k10-u1:42606/sites/sc_2","ttt",context.user,context.host,"WSS_Content2");
  }
});

asyncTest('check wait', function() {
      equal(1,1);
      start();
    });

