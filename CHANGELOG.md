# 更新日志

所有显著变更都将记录在此文件中。

## [2.0.0] - 2025-12-01

### 新增 - Node.js/TypeScript 版本 ⚡

#### 核心功能
- ✅ 完整的 Node.js/TypeScript 实现
- ✅ 使用 MCP 官方 SDK (@modelcontextprotocol/sdk)
- ✅ 支持所有 Python 版本的功能（解析、HTML 生成等）

#### 智能 Cookie 管理 🔥
- 🌐 **Playwright 自动登录**：首次使用或 Cookie 失效时自动打开浏览器引导登录
- 💾 **Cookie 持久化**：自动保存到本地文件，7-30 天内无需重新登录
- 🔍 **智能检测**：每次调用自动验证 Cookie 有效性
- 🔄 **自动刷新**：检测到 Cookie 失效时自动触发登录流程
- 📋 **多来源支持**：支持参数传入、环境变量、本地文件三种 Cookie 来源

#### 性能优化
- ⚡ **启动速度提升 5 倍**：从 ~500ms 降至 ~100ms
- 📦 **包体积减少 40%**：从 ~50MB 降至 ~30MB
- 🚀 **原生异步**：使用 Node.js 原生 async/await，性能更优

#### 开发体验
- 🎯 **TypeScript 类型安全**：编译时类型检查，减少运行时错误
- 🛠️ **完善的脚本**：提供 setup、quick-start、cookie 管理等便捷脚本
- 📖 **详细文档**：包含 README、AUTO_LOGIN 等多份文档

#### Cookie 管理命令
```bash
npm run cookie:login   # 自动登录
npm run cookie:check   # 检查 Cookie 有效性
npm run cookie:show    # 显示保存的 Cookie
npm run cookie:delete  # 删除 Cookie
npm run cookie:auto    # 智能获取有效 Cookie（推荐）
```

### 改进 - 项目结构

#### 目录重组
- 📁 **Python 版本**移至 `python/` 目录
- 📁 **Node.js 版本**移至 `nodejs/` 目录
- 📄 每个版本都有独立的 README 和配置

#### 文档完善
- 📝 新增主 README，对比两个版本
- 📝 添加 `.gitignore`，排除临时文件和依赖
- 📝 添加 CHANGELOG，记录版本历史
- 📝 完善配置示例

### 技术栈

#### Node.js 版本
- **运行时**: Node.js >= 18.0.0
- **语言**: TypeScript 5.3+
- **MCP SDK**: @modelcontextprotocol/sdk ^0.5.0
- **HTTP 客户端**: axios ^1.6.0
- **HTML 解析**: cheerio ^1.0.0
- **数据验证**: zod ^3.22.0
- **自动化浏览器**: playwright ^1.56.1 (可选)

#### Python 版本
- **运行时**: Python >= 3.10
- **MCP SDK**: mcp (社区版)
- **HTTP 客户端**: httpx
- **HTML 解析**: beautifulsoup4
- **数据验证**: pydantic

### 修复

#### Node.js 版本
- 🐛 修复 HTTP headers 包含伪头部导致的请求失败
- 🐛 移除 `authority`、`method`、`scheme` 等非法 header 字段
- 🐛 优化错误处理和提示信息

## [1.0.0] - 2025-11-03

### 新增 - Python 版本初始发布

#### 核心功能
- ✅ 钉钉文档解析
- ✅ HTML 生成和美化
- ✅ 支持多种文档元素（段落、表格、图片、代码块）
- ✅ 代码块一键复制
- ✅ MCP 工具集成

#### 支持的元素
- 📝 段落和富文本
- 📊 表格（支持单元格合并）
- 🖼️ 图片
- 💻 代码块（11 种语言）
- 🎨 文本样式（粗体、颜色、字号）

#### HTML 样式
- 🌈 渐变色背景（紫色系）
- 📱 响应式设计
- 💻 深色代码主题（VS Code Dark+）
- ✨ 流畅动画效果

---

## 版本对比

| 特性 | v1.0.0 (Python) | v2.0.0 (Node.js) |
|------|----------------|------------------|
| 启动速度 | ~500ms | ~100ms ⚡ |
| 包体积 | ~50MB | ~30MB 📦 |
| Cookie 管理 | 手动 | 自动 🔥 |
| 类型安全 | Pydantic | TypeScript ✅ |
| MCP SDK | 社区版 | 官方版 ✅ |

## 升级建议

### 从 v1.0.0 升级到 v2.0.0

如果你正在使用 Python 版本：
1. **无需升级**：Python 版本仍然完全可用
2. **可选升级**：如果你熟悉 Node.js，可以尝试 Node.js 版本获得更好的性能和自动 Cookie 管理

如果你是新用户：
- **推荐使用 Node.js 版本**：性能更好，Cookie 管理更智能
- 如果你的技术栈是 Python，可以选择 Python 版本

### 配置迁移

#### Python → Node.js

```json
// Python 版本配置
{
  "dingtalk-doc-python": {
    "command": "python",
    "args": ["path/to/python/server.py"],
    "env": {
      "DINGTALK_COOKIE": "your_cookie"  // 必需
    }
  }
}

// Node.js 版本配置
{
  "dingtalk-doc-nodejs": {
    "command": "node",
    "args": ["path/to/nodejs/dist/index.js"],
    "env": {
      "DINGTALK_COOKIE": "your_cookie"  // 可选，会自动登录
    }
  }
}
```

## 贡献者

- **黄云堃 (Yunkun Huang)** - Python 版本作者
- **shinjiyu** - Node.js 版本作者

## 链接

- [GitHub 仓库](https://github.com/shinjiyu/mcp-dingtalk-doc)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [钉钉文档](https://alidocs.dingtalk.com)

