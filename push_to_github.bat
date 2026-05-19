@echo off
echo ==============================================
echo PUSHING SAFA-NET UPDATES TO GITHUB
echo ==============================================
echo.
echo Staging changes...
git add .
echo.
echo Committing changes...
git commit -m "feat: fully integrate Google Sheets payment methods and auto-transactions"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo ==============================================
echo SUCCESS: Updates have been pushed to GitHub!
echo ==============================================
pause
