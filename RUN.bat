@echo off
echo ================================================
echo   BookKeeper - Starting Application
echo ================================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo First time setup detected...
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting BookKeeper...
echo.
echo The app will open in your browser automatically.
echo Press Ctrl+C to stop the server.
echo.

call npm run dev
