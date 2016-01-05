$iam = Split-Path -Path $MyInvocation.MyCommand.Path -leaf
$cwd = Split-Path -Path $MyInvocation.MyCommand.Path

$archivePath = "$cwd\riurik.zip"
$riurikPath = "$cwd\Riurik"
New-Item -ItemType Directory -Force -Path $riurikPath

if( Test-Path $archivePath) {
 	Write-Host "Unpack $archivePath"
	Add-Type -assembly "system.io.compression.filesystem"
	[System.IO.Compression.ZipFile]::ExtractToDirectory($archivePath, $riurikPath)
}

function AreYouAgree($title) {
    $message = "Are you agree?"
    $yes = New-Object System.Management.Automation.Host.ChoiceDescription "&Yes", "Yes"
    $no = New-Object System.Management.Automation.Host.ChoiceDescription "&No", "No"
    $options = [System.Management.Automation.Host.ChoiceDescription[]]($yes, $no)
    $choice = $host.ui.PromptForChoice($title, $message, $options, 1)
    return $choice -eq 0
}
if( -not (Get-WmiObject -Class Win32_Product | where { $_.Name -match "Node.js"} ) ) {
    if( AreYouAgree "It is necessary to install Node.js" ) {
		if( -not $ENV:ChocolateyInstall ) {
			iex ((new-object net.webclient).DownloadString('https://chocolatey.org/install.ps1'))
		}
        iex 'choco install nodejs -y -version 4.2.2'
		powershell -command "Start-Process 'C:\Program Files\nodejs\npm.cmd' 'install coffee-script -g' -Wait"
		powershell -command "Start-Process 'C:\Program Files\nodejs\npm.cmd' 'install daspec -g' -Wait"
		powershell -command "Start-Process 'C:\Program Files\nodejs\npm.cmd' 'install edge -g' -Wait"
		powershell -command "Start-Process 'C:\Program Files\nodejs\npm.cmd' 'install edge-ps -g' -Wait"
    }
}

if( AreYouAgree "It is necessary to start the Riurik server" ) {
	[Environment]::SetEnvironmentVariable("DJANGO_SETTINGS_MODULE", "src.settings", "Process")
	Start-Process $cwd\riurik\Riurik.exe "runserver 0.0.0.0:8080" -PassThru
}