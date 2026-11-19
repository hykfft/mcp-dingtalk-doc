# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-12-10

### Added

- 📚 添加 Windows 和 macOS/Linux 平台配置差异说明
- ⚠️ Windows 不支持 npx 的警告和解决方案
- 📊 平台对比表格

### Fixed

- 🪟 修复 Windows 平台配置说明，明确需要全局安装

### Documentation

- 更新 README.md 添加平台差异说明
- 更新 MCP_CONFIG_EXAMPLES.md 添加详细平台对比
- 添加 Windows 专用安装步骤

## [1.0.0] - 2025-12-10

### Added

- 🎉 首次发布到 npm (包名: mcp-dingtalk-doc)
- ✨ 完整的钉钉文档解析功能
- 🍪 智能 Cookie 管理系统
  - 自动检测 Cookie 失效
  - Playwright 自动登录
  - Cookie 持久化存储（7-30天）
- 🎨 HTML 生成功能
  - 渐变色 UI 设计
  - 深色代码主题
  - 代码块一键复制
- 📊 支持多种文档元素
  - 段落和富文本
  - 表格（支持单元格合并）
  - 图片显示
  - 代码块（11种语言高亮）
  - 文本样式（粗体、颜色、字号）
- 🔧 MCP 工具集成
  - `parse_document` - 完整解析并保存
  - `get_html` - 快速获取 HTML
- 📦 TypeScript 完整类型定义
- ⚡ 高性能异步处理
- 🛠️ 完善的命令行工具
  - `cookie:login` - 自动登录
  - `cookie:check` - 检查有效性
  - `cookie:show` - 显示 Cookie
  - `cookie:auto` - 智能获取
  - `cookie:delete` - 删除 Cookie

### Technical Details

- 使用 TypeScript 5.3+
- 基于 MCP 官方 SDK (@modelcontextprotocol/sdk ^0.5.0)
- 使用 Playwright 实现自动登录
- 使用 Axios 处理 HTTP 请求
- 使用 Cheerio 解析 HTML
- 使用 Zod 进行数据验证

### Performance

- 启动时间：~100ms
- 包体积：~30MB
- 代码行数：~600 行

## [Unreleased]

### Planned

- 支持更多文档元素（列表、引用块）
- 图片自动下载到本地
- 批量文档解析
- 文档导出为 Markdown
- 文档差异对比
- 增量更新支持

---

**Note**: 本项目基于 Python 版本重写，增加了智能 Cookie 管理和更好的性能。

