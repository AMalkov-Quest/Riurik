cd ..
start /wait build.bat

cd %~dp0
del %~dp0riurik.zip
powershell -command Add-Type -assembly "system.io.compression.filesystem";[io.compression.zipfile]::CreateFromDirectory('..\dist\Riurik', '%~dp0Riurik.zip');

del %~dp0riurik-installer.exe
IEXPRESS /N %~dp0riurik-installer.SED