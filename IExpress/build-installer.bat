del %~dp0riurik.zip
powershell -command Add-Type -assembly "system.io.compression.filesystem";[io.compression.zipfile]::CreateFromDirectory('..\dist\riurik', '%~dp0riurik.zip');

del %~dp0riurik-installer.exe
IEXPRESS /N %~dp0riurik-installer.SED