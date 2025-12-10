#!/bin/bash
# Node.js 版本钉钉文档 MCP 服务器安装脚本 (Linux/Mac)

echo "========================================"
echo "钉钉文档 MCP 服务器 - Node.js 版本"
echo "自动安装脚本"
echo "========================================"
echo ""

# 检查 Node.js
echo "[1/4] 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js！"
    echo "请访问 https://nodejs.org/ 下载安装"
    exit 1
fi

echo "[成功] Node.js 已安装"
node --version
echo ""

# 安装依赖
echo "[2/4] 安装依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "[错误] 依赖安装失败！"
    exit 1
fi
echo ""

# 构建项目
echo "[3/4] 构建项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "[错误] 构建失败！"
    exit 1
fi
echo ""

# 显示配置说明
echo "[4/4] 配置说明"
echo "========================================"
echo "安装完成！"
echo "========================================"
echo ""
echo "下一步操作："
echo ""
echo "1. 获取钉钉 Cookie（30秒）"
echo "   - 浏览器打开 https://alidocs.dingtalk.com"
echo "   - F12 开发者工具 > Network"
echo "   - 复制任意请求的 Cookie"
echo ""
echo "2. 配置 MCP (Cursor)"
echo "   - 编辑文件: ~/.cursor/mcp.json"
echo "   - 或: ~/Library/Application Support/Cursor/mcp.json (Mac)"
echo "   - 添加配置："
echo ""
echo "   {"
echo "     \"mcpServers\": {"
echo "       \"dingtalk-doc-nodejs\": {"
echo "         \"command\": \"node\","
echo "         \"args\": [\"$(pwd)/dist/index.js\"],"
echo "         \"env\": {"
echo "           \"DINGTALK_COOKIE\": \"你的Cookie\""
echo "         }"
echo "       }"
echo "     }"
echo "   }"
echo ""
echo "3. 重启 Cursor"
echo ""
echo "========================================"
echo "测试运行：npm run dev"
echo "========================================"
echo ""

