@echo off
echo Initializing Git...
"C:\Program Files\Git\bin\git.exe" init
"C:\Program Files\Git\bin\git.exe" config user.name "AbdurrahMan0070"
"C:\Program Files\Git\bin\git.exe" config user.email "abdurrahman@gulistan.app"
echo.
echo Adding files...
"C:\Program Files\Git\bin\git.exe" add .
echo.
echo Committing...
"C:\Program Files\Git\bin\git.exe" commit -m "Update: Latest changes and improvements"
echo.
echo Adding remote...
"C:\Program Files\Git\bin\git.exe" remote add origin https://github.com/AbdurrahMan0070/gulistan-app.git 2>nul
echo.
echo Pushing to GitHub...
"C:\Program Files\Git\bin\git.exe" branch -M main
"C:\Program Files\Git\bin\git.exe" push -f origin main
echo.
echo ================================
echo SUCCESS! Pushed to GitHub!
echo Render will auto-deploy!
echo ================================
