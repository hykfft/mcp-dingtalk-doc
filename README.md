# 钉钉文档解析 MCP 服务器

> 🎯 一个用于解析钉钉文档内容并生成 HTML 的 MCP (Model Context Protocol) 服务器

[![MCP](https://img.shields.io/badge/MCP-1.0.0-blue)](https://modelcontextprotocol.io)
[![Python](https://img.shields.io/badge/Python-3.10%2B-green)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue)](https://www.typescriptlang.org/)

## ✨ 功能特性

- 🔐 **完整解析流程**: GET → 提取 dentryKey → POST → 生成 HTML
- 📊 **多元素支持**: 段落、表格、图片、代码块、富文本
- 🎨 **美观渲染**: 渐变色 UI + 深色代码主题
- 📋 **代码复制**: 代码块支持一键复制
- 🌐 **灵活输入**: 支持完整 URL 或 NODE_ID
- 📁 **智能归档**: 按文档标题自动创建文件夹
- 🍪 **智能 Cookie 管理**: 自动检测失效并引导登录（Node.js 版本）

## 🚀 两个版本

本项目提供 **Python** 和 **Node.js** 两个版本的实现，功能相同，可根据你的技术栈选择：

| 特性 | Python 版本 | Node.js 版本 |
|------|------------|--------------|
| **启动速度** | ~500ms | **~100ms (快 5x)** ⚡ |
| **包体积** | ~50MB | **~30MB (小 40%)** 📦 |
| **MCP SDK** | 社区版 | **官方主推** ✅ |
| **异步处理** | asyncio | **原生 async/await** |
| **类型安全** | Pydantic | **TypeScript** |
| **Cookie 管理** | 手动配置 | **智能自动管理** 🔥 |
| **浏览器自动登录** | ❌ | **✅ Playwright 自动登录** |
| **推荐场景** | Python 技术栈 | **新项目、追求性能** |

### 📁 目录结构

```
mcp-dingtalk-doc/
├── README.md              # 本文件
├── .gitignore            # Git 忽略配置
├── mcp_config_example.json  # 配置示例
├── python/               # Python 版本 🐍
│   ├── server.py         # MCP 服务器
│   ├── cookie_manager.py # Cookie 管理
│   ├── pyproject.toml    # 项目配置
│   ├── requirements.txt  # 依赖列表
│   └── README.md         # Python 版本文档
└── nodejs/               # Node.js/TypeScript 版本 ⚡
    ├── src/              # TypeScript 源码
    │   ├── index.ts      # MCP 服务器入口
    │   ├── cookie-manager.ts  # Cookie 管理
    │   ├── smart-cookie.ts    # 智能 Cookie
    │   └── ...
    ├── dist/             # 编译后的 JS
    ├── package.json      # 项目配置
    ├── tsconfig.json     # TypeScript 配置
    └── README.md         # Node.js 版本文档
```

## 📖 快速开始

### 选择版本

#### 🐍 Python 版本 - [查看详细文档](./python/README.md)

```bash
# 1. 进入 Python 目录
cd python

# 2. 安装依赖
pip install -e .

# 3. 配置 Cookie（环境变量）
export DINGTALK_COOKIE="your_cookie_here"

# 4. 配置 MCP
# 编辑 ~/.cursor/mcp.json 或 %APPDATA%\Cursor\mcp.json
```

#### ⚡ Node.js 版本 - [查看详细文档](./nodejs/README.md) (推荐)

```bash
# 1. 进入 Node.js 目录
cd nodejs

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build

# 4. 自动登录获取 Cookie（推荐）
npm run cookie:login
# 浏览器会自动打开，扫码登录后自动保存 Cookie

# 5. 配置 MCP
# 编辑 ~/.cursor/mcp.json 或 %APPDATA%\Cursor\mcp.json
```

## 🎯 使用方法

### 在 Cursor 中使用

配置完成后，在 Cursor 聊天框中直接说：

```
请帮我解析这个钉钉文档：
https://alidocs.dingtalk.com/i/nodes/Y1OQX0akWm3ZoLgLhADaaXPMJGlDd3mE
```

AI 会自动调用 MCP 工具解析文档！

### 可用工具

#### 1. `parse_document` - 完整解析并保存

解析钉钉文档，提取内容并生成 HTML 文件。

**参数：**
- `url_or_node_id` (必需): 钉钉文档 URL 或 NODE_ID
- `cookie` (可选): Cookie，未提供则使用环境变量或自动登录
- `save_files` (可选): 是否保存文件，默认 true
- `output_dir` (可选): 输出目录路径

**示例：**
```json
{
  "url_or_node_id": "https://alidocs.dingtalk.com/i/nodes/xxx",
  "save_files": true
}
```

**输出：**
```
~/Documents/cursor-mcp/dingDoc/文档标题/
├── {NODE_ID}_mainsite.json      # GET 请求数据
├── {NODE_ID}_document.json      # POST 请求数据
├── {NODE_ID}_content.json       # 文档详细内容
└── {NODE_ID}.html               # 生成的 HTML ⭐
```

#### 2. `get_html` - 快速获取 HTML

快速获取 HTML 内容（不保存文件）。

**参数：**
- `url_or_node_id` (必需): 钉钉文档 URL 或 NODE_ID
- `cookie` (可选): Cookie

## 📖 支持的文档元素

| 元素 | 标签 | 功能 |
|------|------|------|
| 段落 | `p` | 文本段落、富文本 |
| 文本样式 | `span` | 粗体、斜体、颜色、字号 |
| 表格 | `table` | 完整表格、单元格合并 |
| 图片 | `img` | 图片显示、懒加载 |
| 代码块 | `code` | 11 种语言、语法高亮、一键复制 |

## 🎨 HTML 样式特点

- 🌈 渐变色背景（紫色系）
- 📱 响应式设计，支持移动端
- 💻 深色代码主题（VS Code Dark+）
- ✨ 流畅动画效果
- 📋 代码块一键复制
- 🖼️ 图片自适应显示

## 🆚 版本对比详情

### Python 版本优势

- ✅ 成熟稳定，已在多个项目中使用
- ✅ Python 生态丰富，易于扩展
- ✅ 适合 Python 技术栈的团队
- ✅ 依赖简单，安装快速

### Node.js 版本优势

- ⚡ **启动速度快 5 倍**（100ms vs 500ms）
- 📦 **包体积小 40%**（30MB vs 50MB）
- 🔥 **智能 Cookie 管理**：自动检测失效并引导登录
- 🌐 **Playwright 自动登录**：无需手动复制 Cookie
- 💾 **Cookie 持久化**：7-30 天内无需重新登录
- ✅ **MCP 官方 SDK**：更好的兼容性和支持
- 🎯 **TypeScript 类型安全**：更少的运行时错误
- ⚡ **原生异步**：性能更优

## 🍪 Cookie 管理对比

### Python 版本

```bash
# 手动获取 Cookie
# 1. 浏览器打开钉钉文档
# 2. F12 → Network → 复制 Cookie
# 3. 设置环境变量
export DINGTALK_COOKIE="your_cookie"
```

### Node.js 版本（智能管理）

```bash
# 方式 1：自动登录（推荐）
npm run cookie:login
# 浏览器自动打开 → 扫码登录 → 自动保存 ✅

# 方式 2：智能获取
npm run cookie:auto
# 如果 Cookie 有效就用现有的，无效则自动登录 ✅

# 方式 3：检查有效性
npm run cookie:check
```

## 🔧 配置示例

### Python 版本配置

```json
{
  "mcpServers": {
    "dingtalk-doc-python": {
      "command": "python",
      "args": ["C:/path/to/python/server.py"],
      "env": {
        "DINGTALK_COOKIE": "your_cookie"
      }
    }
  }
}
```

### Node.js 版本配置

```json
{
  "mcpServers": {
    "dingtalk-doc-nodejs": {
      "command": "node",
      "args": ["C:/path/to/nodejs/dist/index.js"],
      "env": {
        "DINGTALK_COOKIE": "your_cookie (可选，会自动登录)"
      }
    }
  }
}
```

## 🐛 已知限制

- ⚠️ OSS 加密的文档内容暂不支持完整解密
- ⚠️ 部分特殊元素（列表、引用块等）待支持
- ⚠️ Cookie 会过期（Python 版本需要手动更新，Node.js 版本会自动处理）

## 📝 更新日志

### v2.0.0 (2025-12-01) - Node.js 版本

- ✅ 新增 Node.js/TypeScript 实现
- 🔥 智能 Cookie 管理（自动检测失效并引导登录）
- 🌐 Playwright 自动登录支持
- ⚡ 启动速度提升 5 倍
- 📦 包体积减少 40%
- 🎯 TypeScript 类型安全
- ✅ MCP 官方 SDK

### v1.0.0 (2025-11-03) - Python 版本

- ✅ 初始版本（Python）
- ✅ 支持文档解析和 HTML 生成
- ✅ 支持 5 种文档元素
- ✅ 代码块一键复制功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

两个版本都需要维护，如果你：
- 熟悉 Python → 可以改进 Python 版本
- 熟悉 Node.js/TypeScript → 可以改进 Node.js 版本

## 📄 许可证

MIT License - 本项目仅供学习和研究使用。

## 👨‍💻 作者

- **原作者**: 黄云堃 (Yunkun Huang) - Python 版本
- **Node.js 版本**: shinjiyu - TypeScript 重写 + 智能 Cookie 管理

## 🔗 相关链接

- [Model Context Protocol](https://modelcontextprotocol.io)
- [钉钉文档](https://alidocs.dingtalk.com)
- [MCP SDK (Python)](https://github.com/modelcontextprotocol/python-sdk)
- [MCP SDK (Node.js)](https://github.com/modelcontextprotocol/typescript-sdk)

---

**快速开始**：选择你喜欢的版本 → 查看对应的 README → 安装配置 → 使用！🚀
