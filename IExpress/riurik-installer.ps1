$iam = Split-Path -Path $MyInvocation.MyCommand.Path -leaf
$cwd = Split-Path -Path $MyInvocation.MyCommand.Path

$archivePath = "$cwd\riurik.zip"

if( Test-Path $archivePath) {
 	Write-Host "Unpack $archivePath"
	$shell = new-object -com shell.application
	$zip = $shell.NameSpace($archivePath)
	foreach( $item in $zip.items() )
	{
		$shell.Namespace($cwd).copyhere($item)
	}
}

[Environment]::SetEnvironmentVariable("DJANGO_SETTINGS_MODULE", "src.settings", "Process")
Start-Process $cwd\riurik\riurik.exe "runserver 0.0.0.0:8080" -PassThru