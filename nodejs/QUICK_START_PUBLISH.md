# 🚀 快速发布指南

## ✅ 当前配置

- **包名**: `mcp-dingtalk-doc`
- **GitHub**: `https://github.com/hykfft/mcp-dingtalk-doc`
- **版本**: `1.0.0`
- **状态**: ✅ 准备完成

## 📋 发布前检查

```bash
cd nodejs

# 1. 验证包名可用
npm view mcp-dingtalk-doc
# 应该返回 404 (包名可用)

# 2. 运行预检查
npm run precheck
# 检查所有配置是否正确

# 3. 本地打包测试
npm pack
# 查看打包文件：mcp-dingtalk-doc-1.0.0.tgz
```

## 🎯 发布步骤（3 步走）

### 步骤 1: 发布到 npm

```bash
# 登录 npm（使用你的账号）
npm login

# 发布（会自动构建）
npm publish

# 验证发布成功
npm view mcp-dingtalk-doc
```

### 步骤 2: 提交到 GitHub

```bash
# 返回项目根目录
cd ..

# 添加所有更改
git add .

# 提交
git commit -m "feat(nodejs): v1.0.0 - 首次发布到 npm

- 包名: mcp-dingtalk-doc
- 完整的 npm 发布配置
- 智能 Cookie 管理
- Playwright 自动登录
- 完善的文档"

# 推送到你的开发库
git push origin main
```

### 步骤 3: 创建 GitHub Release

```bash
# 创建标签
git tag v1.0.0 -m "v1.0.0 - 首次发布到 npm"

# 推送标签
git push origin v1.0.0

# 然后在 GitHub 网页创建 Release：
# https://github.com/hykfft/mcp-dingtalk-doc/releases/new
```

## 📦 发布后验证

```bash
# 1. 检查 npm 包页面
# https://www.npmjs.com/package/mcp-dingtalk-doc

# 2. 全局安装测试
npm install -g mcp-dingtalk-doc

# 3. 测试命令
mcp-dingtalk-doc --version

# 4. 或使用 npx
npx mcp-dingtalk-doc
```

## 🎉 用户如何使用

发布后，用户可以：

### 安装

```bash
npm install -g mcp-dingtalk-doc
```

### 配置 MCP

编辑 `~/.cursor/mcp.json` 或 `%APPDATA%\Cursor\mcp.json`：

#### 方式 1: 使用 npx（推荐）✨

**无需安装，直接使用**：

```json
{
  "mcpServers": {
    "dingtalk-doc": {
      "command": "npx",
      "args": ["-y", "mcp-dingtalk-doc"],
      "env": {
        "DINGTALK_COOKIE": "可选"
      }
    }
  }
}
```

#### 方式 2: 全局安装后使用

```bash
npm install -g mcp-dingtalk-doc
```

```json
{
  "mcpServers": {
    "dingtalk-doc": {
      "command": "mcp-dingtalk-doc",
      "env": {
        "DINGTALK_COOKIE": "可选"
      }
    }
  }
}
```

### 使用

在 Cursor 中对 AI 说：
```
请帮我解析这个钉钉文档：
https://alidocs.dingtalk.com/i/nodes/xxx
```

## ⚠️ 注意事项

1. **首次发布无 scope 包是公开的**
   - 无需 `--access public` 标志
   - 默认就是 public

2. **确保已构建**
   - `npm publish` 会自动运行 `prepublishOnly` 脚本
   - 自动执行 `npm run build`

3. **版本号不可重复**
   - 一旦发布，该版本号不能再次使用
   - 如有错误，只能发布新版本

4. **72 小时内可撤销**
   - `npm unpublish mcp-dingtalk-doc@1.0.0`
   - 谨慎使用！

## 📚 相关文档

- **详细发布指南**: [PUBLISHING.md](./PUBLISHING.md)
- **发布检查清单**: [PUBLISH_CHECKLIST.md](./PUBLISH_CHECKLIST.md)
- **最终配置**: [FINAL_CONFIG.md](./FINAL_CONFIG.md)
- **项目状态**: [PROJECT_STATUS.md](./PROJECT_STATUS.md)

## 🆘 遇到问题？

### 包名被占用
```bash
# 改为带后缀的名称
"name": "mcp-dingtalk-doc-parser"
```

### 权限错误
```bash
# 确保已登录
npm whoami

# 重新登录
npm login
```

### 构建失败
```bash
# 清理重新构建
rm -rf dist/
npm run build
```

---

**准备好了吗？** 运行 `npm run precheck` 然后 `npm publish` 吧！🚀

**预计耗时**: 5-10 分钟  
**难度**: ⭐⭐☆☆☆ (简单)

