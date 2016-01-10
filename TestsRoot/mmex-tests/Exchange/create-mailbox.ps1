Add-PSSnapin Microsoft.Exchange.Management.PowerShell.E2010

New-Mailbox -UserPrincipalName "AT_ContentChangesBox@canto.amazon.dmm" `
    -Password (ConvertTo-SecureString "qwerty!1" -AsPlainText -Force) `
    -Name "AT_ContentChangesBox" `
    -OrganizationalUnit "OU=DMMUsers,DC=canto,DC=amazon,DC=dmm" `
    -Database (Get-MailboxDatabase).Name `
    -ResetPasswordOnNextLogon $false