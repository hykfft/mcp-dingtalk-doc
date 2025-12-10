@echo off
chcp 65001 >nul
echo ========================================
echo 配置 Cursor MCP - 钉钉文档解析服务器
echo ========================================
echo.

REM 获取当前目录
set "PROJECT_DIR=%~dp0"
set "DIST_PATH=%PROJECT_DIR%dist\index.js"

echo [1/5] 检查项目构建...
if not exist "%DIST_PATH%" (
    echo ❌ 项目未构建，正在构建...
    call npm run build
    if errorlevel 1 (
        echo ❌ 构建失败，请检查错误信息
        pause
        exit /b 1
    )
    echo ✅ 构建完成
) else (
    echo ✅ 项目已构建
)
echo.

echo [2/5] 检查 Cookie 配置...
if exist "%PROJECT_DIR%dingtalk_cookies.json" (
    echo ✅ 找到 Cookie 文件
    echo.
    choice /C YN /M "是否重新获取 Cookie"
    if errorlevel 2 goto skip_cookie
    if errorlevel 1 (
        call npm run cookie:login
    )
) else (
    echo ⚠️  未找到 Cookie 文件
    echo.
    choice /C YN /M "是否现在获取 Cookie"
    if errorlevel 2 goto skip_cookie
    if errorlevel 1 (
        call npm run cookie:login
    )
)
:skip_cookie
echo.

echo [3/5] 查找 Cursor 配置文件...
set "MCP_CONFIG=%APPDATA%\Cursor\mcp.json"
echo 配置文件路径: %MCP_CONFIG%
echo.

if not exist "%APPDATA%\Cursor" (
    echo ❌ 未找到 Cursor 目录
    echo 请确保已安装 Cursor
    pause
    exit /b 1
)

echo [4/5] 生成 MCP 配置...
echo.
echo 请复制以下配置到 %MCP_CONFIG%:
echo.
echo {
echo   "mcpServers": {
echo     "dingtalk-doc": {
echo       "command": "node",
echo       "args": [
echo         "%DIST_PATH:\=\\%"
echo       ]
echo     }
echo   }
echo }
echo.
echo 提示：路径已自动转换为双反斜杠格式
echo.

echo [5/5] 打开配置文件...
choice /C YN /M "是否现在打开配置文件进行编辑"
if errorlevel 2 goto skip_open
if errorlevel 1 (
    if exist "%MCP_CONFIG%" (
        notepad "%MCP_CONFIG%"
    ) else (
        echo 创建新配置文件...
        (
            echo {
            echo   "mcpServers": {
            echo     "dingtalk-doc": {
            echo       "command": "node",
            echo       "args": [
            echo         "%DIST_PATH:\=\\%"
            echo       ]
            echo     }
            echo   }
            echo }
        ) > "%MCP_CONFIG%"
        notepad "%MCP_CONFIG%"
    )
)
:skip_open
echo.

echo ========================================
echo ✅ 配置完成！
echo ========================================
echo.
echo 下一步：
echo 1. 确保配置文件已正确编辑
echo 2. 重启 Cursor
echo 3. 在 Cursor 中测试：
echo    "请帮我解析这个钉钉文档：https://alidocs.dingtalk.com/i/nodes/xxx"
echo.
pause

