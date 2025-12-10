#!/bin/bash
# 钉钉文档 MCP 服务器环境配置脚本（Linux/Mac）
# 创建干净的虚拟环境，避免依赖冲突

echo "================================"
echo "钉钉文档 MCP 服务器环境配置"
echo "================================"
echo ""

# 检查是否已存在虚拟环境
if [ -d "venv_dingtalk" ]; then
    echo "[警告] 检测到已存在虚拟环境 venv_dingtalk"
    read -p "是否删除并重新创建？(y/n): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        echo "[删除] 正在删除旧的虚拟环境..."
        rm -rf venv_dingtalk
    else
        echo "[跳过] 使用现有虚拟环境"
    fi
fi

echo ""
echo "[1/5] 创建虚拟环境..."
python3 -m venv venv_dingtalk
if [ $? -ne 0 ]; then
    echo "[错误] 创建虚拟环境失败！"
    exit 1
fi
echo "[成功] 虚拟环境创建完成"

echo ""
echo "[2/5] 激活虚拟环境..."
source venv_dingtalk/bin/activate

echo ""
echo "[3/5] 升级 pip..."
pip install --upgrade pip

echo ""
echo "[4/5] 安装项目依赖..."
pip install -r requirements.txt

echo ""
echo "[5/5] 安装 Playwright 浏览器驱动..."
playwright install chromium

echo ""
echo "================================"
echo "✅ 环境配置完成！"
echo "================================"
echo ""
echo "下一步操作："
echo "  1. 运行: python cookie_manager.py --login"
echo "  2. 测试: python test_cookie.py"
echo "  3. 启动: python server.py"
echo ""
echo "注意：每次使用前需要激活虚拟环境"
echo "  命令: source venv_dingtalk/bin/activate"
echo ""

