@echo off
REM 钉钉文档 MCP 服务器环境配置脚本（Windows）
REM 创建干净的虚拟环境，避免依赖冲突

echo ================================
echo 钉钉文档 MCP 服务器环境配置
echo ================================
echo.

REM 检查是否已存在虚拟环境
if exist venv_dingtalk (
    echo [警告] 检测到已存在虚拟环境 venv_dingtalk
    set /p "confirm=是否删除并重新创建？(y/n): "
    if /i "%confirm%"=="y" (
        echo [删除] 正在删除旧的虚拟环境...
        rmdir /s /q venv_dingtalk
    ) else (
        echo [跳过] 使用现有虚拟环境
        goto activate
    )
)

echo.
echo [1/5] 创建虚拟环境...
python -m venv venv_dingtalk
if errorlevel 1 (
    echo [错误] 创建虚拟环境失败！
    pause
    exit /b 1
)
echo [成功] 虚拟环境创建完成

:activate
echo.
echo [2/5] 激活虚拟环境...
call venv_dingtalk\Scripts\activate.bat

echo.
echo [3/5] 升级 pip...
python -m pip install --upgrade pip

echo.
echo [4/5] 安装项目依赖...
pip install -r requirements.txt

echo.
echo [5/5] 安装 Playwright 浏览器驱动...
playwright install chromium

echo.
echo ================================
echo ✅ 环境配置完成！
echo ================================
echo.
echo 下一步操作：
echo   1. 运行: python cookie_manager.py --login
echo   2. 测试: python test_cookie.py
echo   3. 启动: python server.py
echo.
echo 注意：每次使用前需要激活虚拟环境
echo   命令: venv_dingtalk\Scripts\activate
echo.
pause

