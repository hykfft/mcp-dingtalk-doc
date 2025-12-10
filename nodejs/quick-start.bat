@echo off
REM 快速启动脚本 - Windows

echo ========================================
echo 钉钉文档 MCP 服务器 - Node.js 版本
echo 快速启动向导
echo ========================================
echo.

REM 检查 node_modules
if not exist node_modules (
    echo [1/4] 安装依赖...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败！
        pause
        exit /b 1
    )
) else (
    echo [1/4] 依赖已安装 ✓
)
echo.

REM 检查 dist
if not exist dist (
    echo [2/4] 构建项目...
    call npm run build
    if errorlevel 1 (
        echo [错误] 构建失败！
        pause
        exit /b 1
    )
) else (
    echo [2/4] 项目已构建 ✓
)
echo.

REM 检查 Cookie
echo [3/4] 检查 Cookie...
if exist dingtalk_cookies.json (
    echo Cookie 文件已存在
    call npm run cookie:check
    if errorlevel 1 (
        echo Cookie 已失效，需要重新登录
        set need_login=1
    ) else (
        echo Cookie 有效 ✓
        set need_login=0
    )
) else (
    echo 未找到 Cookie 文件
    set need_login=1
)
echo.

if %need_login%==1 (
    echo ========================================
    echo 需要获取 Cookie
    echo ========================================
    echo.
    echo 选择方式：
    echo   1. 自动登录（推荐，需要 Playwright）
    echo   2. 手动配置 Cookie
    echo   3. 跳过（使用环境变量）
    echo.
    set /p choice="请选择 (1/2/3): "
    
    if "%choice%"=="1" (
        echo.
        echo 检查 Playwright...
        call npm list playwright >nul 2>&1
        if errorlevel 1 (
            echo Playwright 未安装，正在安装...
            call npm install playwright
            call npx playwright install chromium
        )
        echo.
        echo 启动自动登录...
        call npm run cookie:login
    ) else if "%choice%"=="2" (
        echo.
        echo 请按以下步骤手动获取 Cookie：
        echo   1. 浏览器打开 https://alidocs.dingtalk.com
        echo   2. F12 开发者工具 -^> Network
        echo   3. 复制任意请求的 Cookie
        echo   4. 设置环境变量或更新 mcp.json
        echo.
        pause
        exit /b 0
    ) else (
        echo.
        echo 跳过 Cookie 配置
        echo 请确保已设置环境变量 DINGTALK_COOKIE
        echo.
    )
)

echo [4/4] 配置说明
echo ========================================
echo 配置 Cursor MCP
echo ========================================
echo.
echo 编辑文件: %%APPDATA%%\Cursor\mcp.json
echo.
echo 添加配置：
echo {
echo   "mcpServers": {
echo     "dingtalk-doc-nodejs": {
echo       "command": "node",
echo       "args": ["%cd%\dist\index.js"],
echo       "env": {
echo         "DINGTALK_COOKIE": "你的Cookie（可选）"
echo       }
echo     }
echo   }
echo }
echo.
echo ========================================
echo ✅ 准备完成！
echo ========================================
echo.
echo 下一步：
echo   1. 重启 Cursor
echo   2. 在聊天框输入：请解析这个钉钉文档 [URL]
echo.
echo 测试运行：npm run dev
echo.
pause

