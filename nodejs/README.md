# mcp-dingtalk-doc

<div align="center">

[![npm version](https://img.shields.io/npm/v/mcp-dingtalk-doc.svg)](https://www.npmjs.com/package/mcp-dingtalk-doc)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue)](https://www.typescriptlang.org/)

🚀 DingTalk Docs（钉钉文档）解析 MCP Server - Node.js/TypeScript 实现

**Keywords**: DingTalk Docs / 钉钉文档 / MCP / Model Context Protocol / Cursor MCP

</div>

## ✨ 特性

- 🚀 **高性能** - 启动时间约 100ms
- 📦 **轻量级** - 包体积约 30MB
- 🍪 **智能 Cookie 管理** - 自动检测失效并引导登录
- 🌐 **Playwright 自动登录** - 浏览器自动弹出，扫码即用
- 💾 **Cookie 持久化** - 7-30 天内无需重新登录
- 🎯 **类型安全** - TypeScript 原生类型检查
- ⚡ **原生异步** - async/await 原生支持
- 📊 **多元素支持** - 段落、表格、图片、代码块、富文本
- 🎨 **美观渲染** - 渐变色 UI + 深色代码主题
- 🔄 **零配置** - 首次使用自动引导登录，无需手动配置 Cookie

## 📦 安装

> **平台差异**：**Windows** 需全局安装，MCP 配置里直接使用命令 `mcp-dingtalk-doc`；**macOS** 可用 npx，无需全局安装。

### macOS：npx 直接使用（推荐）✨

**仅 macOS/Linux** 支持。无需安装，MCP 配置中使用 `npx` 即可（完整示例见下方「配置 MCP」章节）：

```json
"command": "npx",
"args": ["-y", "mcp-dingtalk-doc"]
```

### Windows：必须全局安装

**Windows 下无法使用 npx**，请先全局安装，再在 MCP 里配置命令 `mcp-dingtalk-doc`：

```bash
npm install -g mcp-dingtalk-doc
```

MCP 配置中直接写：

```json
"command": "mcp-dingtalk-doc"
```

### 从源码安装（所有平台）

```bash
# 克隆仓库
git clone https://github.com/hykfft/mcp-dingtalk-doc.git
cd mcp-dingtalk-doc/nodejs

# 安装依赖
npm install

# 构建
npm run build
```

## ⚡ 快速开始

### 方式 1: 自动 Cookie 管理（推荐）⭐

```bash
# 1. 安装 Playwright（可选）
npm install playwright
npx playwright install chromium

# 2. 自动登录获取 Cookie
npm run cookie:login
# 浏览器会自动打开，扫码登录后自动保存 Cookie

# 3. 验证 Cookie
npm run cookie:check
```

**优点**：
- ✅ 一次登录，自动保存
- ✅ 7-30 天内无需重新登录
- ✅ Cookie 过期自动刷新

### 方式 2: 手动 Cookie 配置（传统方式）

1. 浏览器打开：https://alidocs.dingtalk.com
2. 登录你的钉钉账号
3. 按 **F12** 打开开发者工具
4. 切换到 **Network** 标签
5. 刷新页面，点击任意请求
6. 在 Request Headers 中找到 **Cookie**，复制它

### 2. 配置环境变量（手动方式）

```bash
# Windows
set DINGTALK_COOKIE=你的Cookie

# Linux/Mac
export DINGTALK_COOKIE="你的Cookie"
```

### 3. 测试运行

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 4. 配置 MCP (Cursor/Claude Desktop)

配置文件路径：

- **Cursor**：Windows `%APPDATA%\Cursor\mcp.json`；Mac `~/.cursor/mcp.json` 或 `~/Library/Application Support/Cursor/mcp.json`
- **Claude Desktop**：Windows `%APPDATA%\Claude\claude_desktop_config.json`；Mac `~/Library/Application Support/Claude/claude_desktop_config.json`

---

## ⚠️ Windows 与 macOS 配置（必读）

| 平台 | 安装方式 | MCP 配置 |
|------|----------|----------|
| **Windows** | 必须全局安装：`npm install -g mcp-dingtalk-doc` | 直接配置命令 `mcp-dingtalk-doc` |
| **macOS / Linux** | 可不安装，用 npx | 使用 `npx` + `mcp-dingtalk-doc` |

### 🪟 Windows：全局安装 + 直接配 mcp-dingtalk-doc

1. 全局安装：
   ```bash
   npm install -g mcp-dingtalk-doc
   ```
2. MCP 配置里**只写命令** `mcp-dingtalk-doc`（不要用 npx）：
   ```json
   {
     "mcpServers": {
       "dingtalk-doc": {
         "command": "mcp-dingtalk-doc"
       }
     }
   }
   ```
3. 重启 Cursor。

### 🍎 macOS / Linux：可用 npx（无需全局安装）

MCP 配置示例：

```json
{
  "mcpServers": {
    "dingtalk-doc": {
      "command": "npx",
      "args": ["-y", "mcp-dingtalk-doc"]
    }
  }
}
```

- 仅 Mac/Linux 支持此种方式；Windows 请用上方「Windows」配置。

### 🔍 为什么 Windows 不能用 npx？

Windows 下 npx 执行 bin 脚本存在兼容问题，需通过全局安装得到 `.cmd` 包装脚本，因此 **Windows 必须全局安装，MCP 直接配置 `mcp-dingtalk-doc`**。

---

#### 从源码使用（所有平台）

如果从源码克隆安装：

```json
{
  "mcpServers": {
    "dingtalk-doc": {
      "command": "node",
      "args": [
        "/path/to/nodejs/dist/index.js"
      ]
    }
  }
}
```

⚠️ 注意：Windows 路径使用 `C:/path/to/...` 或 `C:\\path\\to\\...`

## 🎯 使用方法

在 Cursor 中对 AI 说：

```
请帮我解析这个钉钉文档：
https://alidocs.dingtalk.com/i/nodes/xxx
```

AI 会自动调用工具，生成 HTML 文件到：
```
~/Documents/cursor-mcp/dingDoc/文档标题/
```

## 🛠️ 可用工具

### 1. parse_document

解析钉钉文档，提取内容并生成HTML文件。

**参数**：
- `url_or_node_id` (必需): 钉钉文档URL或NODE_ID
- `cookie` (可选): Cookie，未提供则使用环境变量
- `save_files` (可选): 是否保存文件，默认true
- `output_dir` (可选): 输出目录路径

**示例**：
```json
{
  "url_or_node_id": "https://alidocs.dingtalk.com/i/nodes/xxx",
  "save_files": true
}
```

### 2. get_html

快速获取HTML内容（不保存文件）。

**参数**：
- `url_or_node_id` (必需): 钉钉文档URL或NODE_ID
- `cookie` (可选): Cookie

## 📂 项目结构

```
mcp-dingtalk-doc-nodejs/
├── src/
│   ├── index.ts              # MCP 服务器入口
│   ├── types.ts              # 类型定义
│   ├── constants.ts          # 常量定义
│   ├── utils.ts              # 工具函数
│   ├── http-client.ts        # HTTP 客户端
│   ├── html-generator.ts     # HTML 生成器
│   └── document-parser.ts    # 文档解析器
├── dist/                     # 编译输出
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
└── README.md                 # 本文件
```

## 🆚 与 Python 版本对比

| 特性 | Python 版本 | Node.js 版本 |
|------|------------|--------------|
| **启动时间** | ~500ms | ~100ms |
| **包体积** | ~50MB | ~30MB |
| **代码量** | ~1500 行 | ~600 行 |
| **MCP SDK** | 社区版 | 官方 SDK |
| **异步处理** | asyncio | async/await |
| **类型安全** | Pydantic | TypeScript |
| **Cookie 管理** | 手动配置 | 智能自动管理 |
| **自动登录** | ❌ | ✅ Playwright |

## 📖 支持的元素

- ✅ 段落和富文本
- ✅ 表格（支持单元格合并）
- ✅ 图片
- ✅ 代码块（11种语言）
- ✅ 文本样式（粗体、颜色、字号）

## 🚀 开发

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 构建
npm run build

# 运行构建后的版本
npm start

# 监听模式（自动编译）
npm run watch
```

## 🍪 Cookie 管理（新功能）

### 自动 Cookie 管理

```bash
# 自动登录
npm run cookie:login

# 检查 Cookie 是否有效
npm run cookie:check

# 查看 Cookie
npm run cookie:show

# 自动获取有效 Cookie（推荐）
npm run cookie:auto

# 删除 Cookie
npm run cookie:delete
```

### 测试无头浏览器

```bash
# 测试自动登录功能
npm run test:browser

# 无头模式测试
npm run test:browser -- --headless
```

**详细说明**：查看 [COOKIE_GUIDE.md](COOKIE_GUIDE.md)

## 📝 脚本命令

```bash
# 构建项目
npm run build

# 开发模式运行
npm run dev

# 生产模式运行
npm start

# 监听文件变化
npm run watch
```

## ⚠️ 已知限制

- OSS 加密的文档内容暂不支持完整解密
- 部分特殊元素（列表、引用块等）待支持
- Cookie 会过期，需定期更新（7-30天）

## 🔧 故障排查

### 问题 1: 找不到模块

```bash
# 确保已构建
npm run build

# 确保 node_modules 存在
npm install
```

### 问题 2: Cookie 失效

```bash
# 重新从浏览器获取 Cookie
# 更新环境变量或 mcp.json
```

### 问题 3: 端口被占用

MCP 使用 stdio 通信，不需要端口。

## 📦 依赖说明

### 核心依赖

- `@modelcontextprotocol/sdk` - MCP 官方 SDK
- `axios` - HTTP 客户端
- `cheerio` - HTML 解析（类似 BeautifulSoup）
- `zod` - 数据验证（类似 Pydantic）

### 可选依赖

- `playwright` - 自动 Cookie 管理（未实现，可扩展）

## 🎯 下一步计划

- [x] ~~实现 Cookie 自动管理~~ ✅
- [x] ~~发布到 npm~~ ✅
- [ ] 支持更多文档元素（列表、引用块）
- [ ] 图片自动下载到本地
- [ ] 支持批量文档解析
- [ ] 支持文档导出为 Markdown

## 📄 许可证

MIT License

## 👨‍💻 作者

- **shinjiyu** - TypeScript 重写 + 智能 Cookie 管理
- **原作者**: 黄云堃 (Yunkun Huang) - Python 版本

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📚 相关链接

- [GitHub 仓库](https://github.com/hykfft/mcp-dingtalk-doc)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [钉钉文档](https://alidocs.dingtalk.com)
- [MCP SDK (TypeScript)](https://github.com/modelcontextprotocol/typescript-sdk)

---

**快速开始**：`npm install -g mcp-dingtalk-doc` → 配置 MCP → 使用！🚀
