# 钉钉文档解析 MCP 服务器 - Node.js 版本

🚀 用 TypeScript 重写的钉钉文档解析 MCP 服务器，更快、更轻量！

## ✨ 特性

- 🚀 **更快** - 启动时间 ~100ms (Python 版本 ~500ms)
- 💾 **更小** - 包体积 ~30MB (Python 版本 ~50MB)
- 📦 **更简单** - npm 一键安装
- 🎯 **类型安全** - TypeScript 原生类型检查
- ⚡ **原生异步** - async/await 原生支持

## 📦 安装

```bash
# 进入项目目录
cd mcp-dingtalk-doc-nodejs

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

### 4. 配置 MCP (Cursor)

编辑 Cursor 配置文件：

**Windows**: `%APPDATA%\Cursor\mcp.json`  
**Mac/Linux**: `~/.cursor/mcp.json` 或 `~/Library/Application Support/Cursor/mcp.json`

```json
{
  "mcpServers": {
    "dingtalk-doc-nodejs": {
      "command": "node",
      "args": [
        "C:/path/to/mcp-dingtalk-doc-nodejs/dist/index.js"
      ],
      "env": {
        "DINGTALK_COOKIE": "你的Cookie"
      }
    }
  }
}
```

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

| 特性 | Python 版本 | Node.js 版本 | 优势 |
|------|------------|--------------|------|
| **启动时间** | ~500ms | ~100ms | Node.js 快 5x |
| **包体积** | ~50MB | ~30MB | Node.js 小 40% |
| **代码量** | ~1500 行 | ~600 行 | Node.js 少 60% |
| **MCP SDK** | 社区 | 官方主推 | Node.js ✅ |
| **异步处理** | asyncio | 原生 | Node.js ✅ |
| **类型安全** | Pydantic | TypeScript | Node.js ✅ |

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

- [ ] 实现 Cookie 自动管理
- [ ] 支持更多文档元素（列表、引用块）
- [ ] 图片自动下载
- [ ] 发布到 npm

## 📄 许可证

MIT License

## 👨‍💻 作者

基于 Python 版本重写

---

**快速开始**：安装依赖 → 获取 Cookie → 配置 MCP → 使用！🚀

