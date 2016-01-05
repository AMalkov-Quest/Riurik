SET NAME=Riurik
SET TESTS_ROOT=%~dp0TestsRoot
SET DIST=%~dp0dist
SET TEMP=%DIST%\temp
@RD /S /Q %DIST%

cd ..
SET DJANGO_SETTINGS_MODULE=settings
C:\Python27\Scripts\pyinstaller.exe Riurik\manage.py -d ^
	--name=%NAME% ^
	--paths=Riurik\src ^
	--distpath=%DIST% ^
	--workpath=%TEMP% ^
	--specpath=%~dp0

XCOPY %TESTS_ROOT% %DIST%\%NAME%\TestsRoot /S /I

exit