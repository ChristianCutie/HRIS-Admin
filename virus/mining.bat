@echo off
:loop
REM Force a change by writing the current timestamp to a dummy file
echo %date% %time% > .autoupdate.txt

REM Stage and commit the change
git add .autoupdate.txt
git commit -m "injecting virus on %date% %time%" >nul 2>&1


echo [%time%] Injecting Virus..

REM Wait 60 seconds before looping again
timeout /t 1 >nul
goto loop
