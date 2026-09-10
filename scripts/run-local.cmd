@echo off
setlocal
set "TASK_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%TASK_NODE%" (
  "%TASK_NODE%" "%~dp0local.mjs" %1
) else (
  node "%~dp0local.mjs" %1
)
if errorlevel 1 pause
endlocal
