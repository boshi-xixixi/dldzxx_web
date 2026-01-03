@echo off
setlocal

cd /d "%~dp0"

echo [INFO] 正在检查运行环境...

REM 检查是否存在无效的 .venv (例如来自 Linux/Mac 的)
if exist ".venv" (
    if not exist ".venv\Scripts\activate.bat" (
        echo [WARN] 检测到无效的 .venv 目录 (可能来自其他操作系统)。
        echo [INFO] 正在删除旧的 .venv...
        rmdir /s /q ".venv"
    )
)

REM 检查是否需要创建 .venv
if not exist ".venv" (
    echo [INFO] 创建 Python 虚拟环境 (.venv)...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERROR] 创建虚拟环境失败。请确保已安装 Python 并添加到 PATH。
        pause
        exit /b 1
    )
)

REM 激活虚拟环境
echo [INFO] 正在激活虚拟环境...
call .venv\Scripts\activate.bat

REM 检查依赖是否安装
echo [INFO] 正在检查依赖...
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
if errorlevel 1 (
    echo [ERROR] 依赖安装失败。
    pause
    exit /b 1
)

REM 检查 .env 文件
if not exist ".env" (
    echo [WARN] 未找到 .env 文件。
    echo [INFO] 请参考 README.md 创建并配置 .env 文件。
)

echo [INFO] 准备启动后端服务...
echo [INFO] 请确保 MongoDB 和 Ollama 已在后台运行。
echo.

uvicorn app.main:app --reload

if errorlevel 1 (
    echo [ERROR] 服务启动失败。
    pause
)

pause
