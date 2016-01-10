"Hello, $inputFromJS on $(Get-Date)!"

Add-PSSnapin Microsoft.Exchange.Management.PowerShell.E2010

(Get-ExchangeServer).AdminDisplayVersion.ToString()
(Get-Command ExSetup).FileVersionInfo.FileVersion
(Get-Command ExSetup).FileVersionInfo.Comments