@echo off
setlocal

:: Change to script directory
cd /d "%~dp0"

echo [INFO] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    echo [INFO] Download: https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Checking dependencies...
if not exist "node_modules" (
    echo [INFO] node_modules not found, installing...
    
    where pnpm >nul 2>nul
    if %errorlevel% equ 0 (
        echo [INFO] Using pnpm to install...
        call pnpm install --registry=https://registry.npmmirror.com
    ) else (
        echo [INFO] Using npm to install...
        call npm install --registry=https://registry.npmmirror.com
    )
    
    if %errorlevel% neq 0 (
        echo [ERROR] Dependencies installation failed.
        pause
        exit /b 1
    )
)

echo [INFO] Starting development server...
echo.

call npm run dev

if %errorlevel% neq 0 (
    echo [ERROR] Failed to start service.
    pause
)

pause
