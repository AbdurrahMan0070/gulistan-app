@echo off
echo Cleaning up git repository...
rmdir /s /q .git 2>nul

echo Initializing git repository...
git init
git config user.name "AbdurrahMan0070"
git config user.email "abdurrahman0070@gmail.com"

echo Adding files...
git add .

echo Committing...
git commit -m "Update Gulistan App"

echo Adding remote...
git remote add origin https://github.com/AbdurrahMan0070/gulistan-app.git

echo Pushing to GitHub...
git branch -M main
git push -u origin main --force

echo Done! Repository updated on GitHub.
pause
