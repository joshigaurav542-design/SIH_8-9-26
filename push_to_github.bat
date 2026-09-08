@echo off
title Push SIH Project to GitHub
echo ========================================================
echo   Pushing SIH_8-9-26 project to GitHub
echo   Target: https://github.com/joshigaurav542-design/SIH_8-9-26
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Checking Git Status...
git status
echo.

echo [2/2] Pushing commits to GitHub (origin main)...
git push origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! All changes pushed to GitHub successfully.
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   If prompted above, please complete GitHub sign-in.
    echo   Once signed in, press any key to retry push.
    echo ========================================================
    pause
    git push origin main
)

echo.
pause
