@rem running waferslim websocket server using python and django
%~dp0windows\Python26\python.exe %~dp0..\src\manage.py runserver localhost:8000 --multithreaded
@rem P.S. '%~dp0' is a current absolute path
