# 🚀 MCP 服务器部署指南

本文档介绍如何将钉钉文档解析服务作为 MCP 服务器部署和分发。

## 📦 两种部署模式

### 模式 1: 基础版（推荐，无需虚拟环境）

**特点**：
- ✅ 轻量级，只需核心依赖（~50MB）
- ✅ 安装快速，无需下载浏览器
- ✅ 兼容性好，不会产生依赖冲突
- ⚠️ 需要手动配置 Cookie

**安装方式**：

```bash
# 用户只需运行
pip install mcp-dingtalk-doc

# 或者从源码安装
pip install -e .
```

**配置 MCP（Cursor）**：

```json
{
  "mcpServers": {
    "dingtalk-doc": {
      "command": "python",
      "args": ["-m", "mcp_dingtalk_doc.server"],
      "env": {
        "DINGTALK_COOKIE": "你的Cookie"
      }
    }
  }
}
```

**Cookie 获取方法**：

```
1. 浏览器打开：https://alidocs.dingtalk.com
2. 登录钉钉账号
3. F12 开发者工具 → Network 标签
4. 刷新页面，点击任意请求
5. 找到 Request Headers 中的 Cookie
6. 复制完整的 Cookie 值
```

---

### 模式 2: 增强版（可选，支持自动 Cookie）

**特点**：
- ✅ 自动获取和刷新 Cookie
- ✅ 用户体验更好
- ⚠️ 需要额外安装 Playwright（~165MB）
- ⚠️ 可能有依赖冲突

**安装方式**：

```bash
# 安装基础版 + 自动 Cookie 功能
pip install mcp-dingtalk-doc[auto-cookie]

# 安装浏览器驱动
playwright install chromium
```

**首次配置**：

```bash
# 运行一次自动登录
python -m mcp_dingtalk_doc.cookie_manager --login
```

---

## 🎯 作为 MCP 发布的最佳实践

### 1. 项目结构

```
mcp-dingtalk-doc/
├── mcp_dingtalk_doc/          # 包目录
│   ├── __init__.py
│   ├── server.py              # MCP 服务器主文件
│   └── cookie_manager.py      # 可选的 Cookie 管理器
├── pyproject.toml             # 项目配置
├── README.md                  # 用户文档
└── DEPLOYMENT.md             # 部署文档
```

### 2. pyproject.toml 配置

```toml
[project]
name = "mcp-dingtalk-doc"
version = "1.0.0"

# 核心依赖（必须）
dependencies = [
    "mcp>=1.0.0",
    "httpx>=0.27.0",
    "beautifulsoup4>=4.12.0",
    "pydantic>=2.0.0",
    "urllib3>=2.0.0",
]

# 可选依赖
[project.optional-dependencies]
auto-cookie = ["playwright>=1.40.0"]
```

### 3. 用户安装流程

**最简单的方式**：

```bash
# 1. 安装
pip install mcp-dingtalk-doc

# 2. 配置 Cursor
# 编辑 ~/Library/Application Support/Cursor/mcp.json (Mac)
# 或 %APPDATA%\Cursor\mcp.json (Windows)

# 3. 获取 Cookie（30秒）
# 浏览器 F12 → Network → 复制 Cookie

# 4. 设置环境变量
export DINGTALK_COOKIE="your_cookie"

# 5. 重启 Cursor
```

---

## 📊 两种模式对比

| 特性 | 基础版 | 增强版 |
|------|-------|--------|
| **安装大小** | ~50MB | ~215MB |
| **安装时间** | 10秒 | 1-2分钟 |
| **依赖冲突** | 极少 | 可能有 |
| **Cookie 获取** | 手动（30秒） | 自动（2分钟） |
| **Cookie 刷新** | 手动更新 | 自动刷新 |
| **适用场景** | 个人使用 | 频繁使用 |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🔧 开发者指南

### 发布到 PyPI

```bash
# 1. 构建
python -m build

# 2. 上传到 TestPyPI（测试）
python -m twine upload --repository testpypi dist/*

# 3. 测试安装
pip install --index-url https://test.pypi.org/simple/ mcp-dingtalk-doc

# 4. 上传到正式 PyPI
python -m twine upload dist/*
```

### GitHub 发布

```bash
# 1. 创建 Release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 2. 在 README 中添加安装徽章
[![PyPI version](https://badge.fury.io/py/mcp-dingtalk-doc.svg)](https://pypi.org/project/mcp-dingtalk-doc/)
```

---

## 🌐 用户文档示例

在 README.md 中应该这样写：

```markdown
## 安装

### 快速安装（推荐）

\`\`\`bash
pip install mcp-dingtalk-doc
\`\`\`

### 配置

1. **获取钉钉 Cookie**（30秒）

   - 浏览器打开 https://alidocs.dingtalk.com
   - 按 F12，切换到 Network 标签
   - 刷新页面，复制任意请求的 Cookie

2. **配置 MCP 服务器**

   编辑 Cursor 的 MCP 配置文件：

   \`\`\`json
   {
     "mcpServers": {
       "dingtalk-doc": {
         "command": "python",
         "args": ["-m", "mcp_dingtalk_doc.server"],
         "env": {
           "DINGTALK_COOKIE": "你的Cookie"
         }
       }
     }
   }
   \`\`\`

3. **重启 Cursor**

### 可选：自动 Cookie 管理

如果你希望自动获取和刷新 Cookie：

\`\`\`bash
pip install mcp-dingtalk-doc[auto-cookie]
playwright install chromium
python -m mcp_dingtalk_doc.cookie_manager --login
\`\`\`
```

---

## 💡 给用户的建议

### 推荐配置（最简单）

```
1. 使用基础版（不需要 Playwright）
2. 手动获取 Cookie（只需 30 秒）
3. Cookie 有效期通常 7-30 天
4. 过期后重新获取即可
```

**优点**：
- ✅ 安装快速（10秒完成）
- ✅ 兼容性好（不会冲突）
- ✅ 维护简单（无需浏览器驱动）

### 高级配置（可选）

```
1. 安装增强版（需要 1-2 分钟）
2. 首次运行自动登录
3. 之后自动管理 Cookie
```

**适合**：
- 频繁使用的用户
- 不想手动更新 Cookie
- 有技术背景的用户

---

## 🐛 故障排查

### 问题 1: 依赖冲突

```bash
# 使用虚拟环境隔离
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install mcp-dingtalk-doc
```

### 问题 2: Cookie 失效

```bash
# 方式 1: 手动更新
# 重新从浏览器获取 Cookie

# 方式 2: 自动刷新（需要增强版）
python -m mcp_dingtalk_doc.cookie_manager --login
```

### 问题 3: 找不到模块

```bash
# 确认安装路径
pip show mcp-dingtalk-doc

# 使用绝对路径
python -m pip install --upgrade mcp-dingtalk-doc
```

---

## 📈 版本规划

### v1.0.0（当前）
- ✅ 基础文档解析
- ✅ 支持表格、图片、代码块
- ✅ 手动 Cookie 配置

### v1.1.0（计划）
- ⭕ 可选的自动 Cookie 管理
- ⭕ 支持更多文档元素
- ⭕ 性能优化

### v2.0.0（未来）
- ⭕ 支持飞书文档
- ⭕ 支持腾讯文档
- ⭕ OAuth 认证（如果平台支持）

---

## 🎯 总结

**作为 MCP 发布的最佳实践**：

1. ✅ **默认轻量级** - 核心功能不依赖重型库
2. ✅ **可选增强** - 高级功能作为可选依赖
3. ✅ **简单配置** - 手动 Cookie 只需 30 秒
4. ✅ **清晰文档** - 提供两种安装方式说明
5. ✅ **优雅降级** - 没有 Playwright 也能正常工作

**推荐给用户的方式**：

```bash
# 最简单，最可靠
pip install mcp-dingtalk-doc

# 手动配置 Cookie（30秒）
# 7-30天更新一次
```

这种方式：
- 用户安装体验好
- 不会产生依赖冲突
- 维护成本低
- 适合大多数场景

