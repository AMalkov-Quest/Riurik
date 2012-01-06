Set wshShell = CreateObject("WScript.Shell")
Set envVars = wshShell.Environment("System")

Dim pythonPath
pythonPath = wshShell.RegRead("HKCU\SOFTWARE\Python\PythonCore\2.7\InstallPath\")
Wscript.Echo pythonPath
If 0 = InStr(envVars("PATH"), pythonPath) Then
    'Wscript.Echo pythonPath
    envVars("PATH") = envVars("PATH") + ";" + pythonPath
End If