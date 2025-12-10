#!/bin/bash
# 快速启动脚本 - Linux/Mac

echo "========================================"
echo "钉钉文档 MCP 服务器 - Node.js 版本"
echo "快速启动向导"
echo "========================================"
echo ""

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo "[1/4] 安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败！"
        exit 1
    fi
else
    echo "[1/4] 依赖已安装 ✓"
fi
echo ""

# 检查 dist
if [ ! -d "dist" ]; then
    echo "[2/4] 构建项目..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "[错误] 构建失败！"
        exit 1
    fi
else
    echo "[2/4] 项目已构建 ✓"
fi
echo ""

# 检查 Cookie
echo "[3/4] 检查 Cookie..."
need_login=0

if [ -f "dingtalk_cookies.json" ]; then
    echo "Cookie 文件已存在"
    npm run cookie:check > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "Cookie 已失效，需要重新登录"
        need_login=1
    else
        echo "Cookie 有效 ✓"
    fi
else
    echo "未找到 Cookie 文件"
    need_login=1
fi
echo ""

if [ $need_login -eq 1 ]; then
    echo "========================================"
    echo "需要获取 Cookie"
    echo "========================================"
    echo ""
    echo "选择方式："
    echo "  1. 自动登录（推荐，需要 Playwright）"
    echo "  2. 手动配置 Cookie"
    echo "  3. 跳过（使用环境变量）"
    echo ""
    read -p "请选择 (1/2/3): " choice
    
    case $choice in
        1)
            echo ""
            echo "检查 Playwright..."
            npm list playwright > /dev/null 2>&1
            if [ $? -ne 0 ]; then
                echo "Playwright 未安装，正在安装..."
                npm install playwright
                npx playwright install chromium
            fi
            echo ""
            echo "启动自动登录..."
            npm run cookie:login
            ;;
        2)
            echo ""
            echo "请按以下步骤手动获取 Cookie："
            echo "  1. 浏览器打开 https://alidocs.dingtalk.com"
            echo "  2. F12 开发者工具 -> Network"
            echo "  3. 复制任意请求的 Cookie"
            echo "  4. 设置环境变量或更新 mcp.json"
            echo ""
            exit 0
            ;;
        3)
            echo ""
            echo "跳过 Cookie 配置"
            echo "请确保已设置环境变量 DINGTALK_COOKIE"
            echo ""
            ;;
    esac
fi

echo "[4/4] 配置说明"
echo "========================================"
echo "配置 Cursor MCP"
echo "========================================"
echo ""
echo "编辑文件: ~/.cursor/mcp.json"
echo "或: ~/Library/Application Support/Cursor/mcp.json (Mac)"
echo ""
echo "添加配置："
echo "{"
echo "  \"mcpServers\": {"
echo "    \"dingtalk-doc-nodejs\": {"
echo "      \"command\": \"node\","
echo "      \"args\": [\"$(pwd)/dist/index.js\"],"
echo "      \"env\": {"
echo "        \"DINGTALK_COOKIE\": \"你的Cookie（可选）\""
echo "      }"
echo "    }"
echo "  }"
echo "}"
echo ""
echo "========================================"
echo "✅ 准备完成！"
echo "========================================"
echo ""
echo "下一步："
echo "  1. 重启 Cursor"
echo "  2. 在聊天框输入：请解析这个钉钉文档 [URL]"
echo ""
echo "测试运行：npm run dev"
echo ""

