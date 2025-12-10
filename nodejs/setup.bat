@echo off
REM Node.js 版本钉钉文档 MCP 服务器安装脚本 (Windows)

echo ========================================
echo 钉钉文档 MCP 服务器 - Node.js 版本
echo 自动安装脚本
echo ========================================
echo.

REM 检查 Node.js
echo [1/4] 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js！
    echo 请访问 https://nodejs.org/ 下载安装
    pause
    exit /b 1
)

echo [成功] Node.js 已安装
node --version
echo.

REM 安装依赖
echo [2/4] 安装依赖...
call npm install
if errorlevel 1 (
    echo [错误] 依赖安装失败！
    pause
    exit /b 1
)
echo.

REM 构建项目
echo [3/4] 构建项目...
call npm run build
if errorlevel 1 (
    echo [错误] 构建失败！
    pause
    exit /b 1
)
echo.

REM 显示配置说明
echo [4/4] 配置说明
echo ========================================
echo 安装完成！
echo ========================================
echo.
echo 下一步操作：
echo.
echo 1. 获取钉钉 Cookie（30秒）
echo    - 浏览器打开 https://alidocs.dingtalk.com
echo    - F12 开发者工具 ^> Network
echo    - 复制任意请求的 Cookie
echo.
echo 2. 配置 MCP (Cursor)
echo    - 编辑文件: %%APPDATA%%\Cursor\mcp.json
echo    - 添加配置：
echo.
echo    {
echo      "mcpServers": {
echo        "dingtalk-doc-nodejs": {
echo          "command": "node",
echo          "args": ["%cd%\dist\index.js"],
echo          "env": {
echo            "DINGTALK_COOKIE": "你的Cookie"
echo          }
echo        }
echo      }
echo    }
echo.
echo 3. 重启 Cursor
echo.
echo ========================================
echo 测试运行：npm run dev
echo ========================================
echo.
pause

