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

function NewSPWebAppByVer(port, owner, password,ver)
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

function CreateSiteCollectionNewDB(waUrl, scUrl, Title, owner, dbhost,dbname)
{
  /*          
    $webApp = [Microsoft.SharePoint.Administration.SPWebApplication]::Lookup("{waUrl}");
  
    foreach ($siteCollection in $webApp.Sites) 
    {         
      if ( [string]::Compare($siteCollection.Url,"{scUrl}",$true) -eq 0)
      {            
        Write-Error "Site collection {scUrl} already exists"        
        return
      }
    }
    $webApp.Sites.Add("{scUrl}","{Title}","", 1033, "STS#0", "{owner}", "{owner}", "mail@mail.com","{owner}","{owner}","mail@mail.com","{dbhost}","{dbname}",$null,$null)  
  */
}  

function CreateSite(parentUrl, siteName){
 /*
  $site = New-Object Microsoft.SharePoint.SPSite("{parentUrl}");
  $spWeb = $site.OpenWeb();
  $exists = $false;
  foreach($web in $spWeb.Webs) {
    if( $web.Title -eq "{siteName}" ) {
      $exists = $true;
    }
  }
  
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
  
function UploadFileTo(siteUrl, list, file)
{ 
  /*
  $spSite = new-object 'Microsoft.SharePoint.SPSite' "{siteUrl}";
  $spWeb = $spSite.OpenWeb();
  $spList = $spWeb.GetFolder("{list}");
  $spFiles = $spList.Files;
  
  
  $fileInfo = Get-ChildItem "{file}";
  $fileContent = Get-Content $fileInfo -encoding byte;
  $fileName = "{0}/{1}" -f "{list}", $fileInfo.Name;
  $fileMetadata = New-Object HashTable;
  $spFile = $spFiles.Add($fileName, $fileContent, $fileMetadata, $false);
  */
};

function CreateFile(name, size)
{
 /*
  if(!(test-path {name})) {
    $file = New-Item {name} -type file;
    $content = [array]::CreateInstance([Byte],174762*{size});
    $content >> $file;
  }
 */
}

function StartService(name)
{
  /*
    Start-Service "{name}"
  */
}

function StopService(name)
{
  /*
    Stop-Service "{name}"
  */
}


  


