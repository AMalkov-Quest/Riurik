SET DIST=%~dp0dist
SET TEMP=%DIST%\temp
@RD /S /Q %DIST%

cd ..
SET DJANGO_SETTINGS_MODULE=settings
C:\Python27\Scripts\pyinstaller.exe --name=riurik Riurik\manage.py --paths=Riurik\src -d --distpath=%DIST% --workpath=%TEMP%