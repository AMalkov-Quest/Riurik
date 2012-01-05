Set wshShell = CreateObject("WScript.Shell")
Set envVars = wshShell.Environment("System")

Dim pythonPath
pythonPath = wshShell.RegRead("HKCU\SOFTWARE\Python\PythonCore\2.7\InstallPath\")

If 0 = InStr(envVars("PATH"), pythonPath) Then
    Wscript.Echo pythonPath
    envVars("PATH") = envVars("PATH") + ";" + pythonPath
End If

cscript python.vbs
python.exe manage.py runserver 0.0.0.0:8000
@rem P.S. '%~dp0' is a current absolute path
pause