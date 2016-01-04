$iam = Split-Path -Path $MyInvocation.MyCommand.Path -leaf
$cwd = Split-Path -Path $MyInvocation.MyCommand.Path

$archivePath = "$cwd\riurik.zip"
$riurikPath = "$cwd\Riurik"
New-Item -ItemType Directory -Force -Path $riurikPath
if( Test-Path $archivePath) {
 	Write-Host "Unpack $archivePath"
	$shell = new-object -com shell.application
	$zip = $shell.NameSpace($archivePath)
	foreach( $item in $zip.items() )
	{
		$shell.Namespace($riurikPath).copyhere($item)
	}
}

function AreYouAgree() {
    $title = "It is necessary to install Node.js"
    $message = "Are you agree?"
    $yes = New-Object System.Management.Automation.Host.ChoiceDescription "&Yes", "Yes"
    $no = New-Object System.Management.Automation.Host.ChoiceDescription "&No", "No"
    $options = [System.Management.Automation.Host.ChoiceDescription[]]($yes, $no)
    $choice = $host.ui.PromptForChoice($title, $message, $options, 1)
    return $choice
}
if( -not (Get-WmiObject -Class Win32_Product | where { $_.Name -match “Node.js”} ) ) {
    $agree = AreYouAgree
    Write-Host $agree
    if( $agree -eq 0 ) {
        iex ((new-object net.webclient).DownloadString('https://chocolatey.org/install.ps1'))
        iex 'choco install nodejs -y'
    }
}

[Environment]::SetEnvironmentVariable("DJANGO_SETTINGS_MODULE", "src.settings", "Process")
Start-Process $cwd\riurik\riurik.exe "runserver 0.0.0.0:8080" -PassThru