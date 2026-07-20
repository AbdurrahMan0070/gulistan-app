@echo off
"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "Update: Latest changes"
"C:\Program Files\Git\bin\git.exe" push origin main
echo.
echo ================================
echo SUCCESS! Pushed to GitHub!
echo Render will auto-deploy in 2-3 min
echo ================================
