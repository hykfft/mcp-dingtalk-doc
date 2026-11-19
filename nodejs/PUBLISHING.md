# NPM 发布指南

本文档说明如何将包发布到 npm。

## 前置要求

1. **npm 账号**
   ```bash
   # 如果没有账号，先注册
   npm adduser
   
   # 如果已有账号，登录
   npm login
   ```

2. **验证登录状态**
   ```bash
   npm whoami
   ```

3. **确保包名可用**
   ```bash
   npm view mcp-dingtalk-doc
   ```
   如果返回 404，说明包名可用。

## 发布前检查清单

### 1. 更新版本号

编辑 `package.json` 中的 `version` 字段，遵循语义化版本规范：

- **major** (x.0.0): 破坏性更新
- **minor** (0.x.0): 新功能，向后兼容
- **patch** (0.0.x): Bug 修复

或使用命令：
```bash
# 补丁版本（bug 修复）
npm version patch

# 小版本（新功能）
npm version minor

# 大版本（破坏性更新）
npm version major
```

### 2. 更新 CHANGELOG.md

记录本次发布的所有更改：
```markdown
## [1.0.1] - 2025-12-11

### Fixed
- 修复了 XXX 问题

### Added
- 添加了 XXX 功能
```

### 3. 确保代码已构建

```bash
# 清理旧的构建
rm -rf dist/

# 重新构建
npm run build

# 验证构建产物
ls -la dist/
```

### 4. 测试包

在本地测试包是否正常工作：

```bash
# 在另一个目录测试全局安装
npm install -g .

# 测试命令
mcp-dingtalk-doc --help

# 或使用 npm link 测试
npm link
cd /tmp/test-project
npm link mcp-dingtalk-doc
```

### 5. 检查要发布的文件

```bash
# 预览将要发布的文件
npm pack --dry-run

# 或创建一个 tarball 并检查
npm pack
tar -tzf mcp-dingtalk-doc-1.0.0.tgz
```

确保：
- ✅ 包含 `dist/` 目录
- ✅ 包含 `README.md`
- ✅ 包含 `LICENSE`
- ✅ 包含 `package.json`
- ❌ 不包含 `src/` 目录
- ❌ 不包含 `.env` 文件
- ❌ 不包含测试文件

## 发布流程

### 首次发布

```bash
# 1. 确保在 nodejs 目录
cd nodejs

# 2. 登录 npm（如果还没登录）
npm login

# 3. 发布（公共包需要 --access public）
npm publish --access public
```

### 后续发布

```bash
# 1. 更新版本号
npm version patch  # 或 minor/major

# 2. 更新 CHANGELOG.md

# 3. 重新构建
npm run build

# 4. 发布
npm publish
```

## 发布后验证

### 1. 检查 npm 网站

访问：https://www.npmjs.com/package/mcp-dingtalk-doc

验证：
- ✅ 版本号正确
- ✅ README 显示正常
- ✅ 依赖列表正确
- ✅ 文件列表正确

### 2. 测试安装

```bash
# 在新环境测试安装
npm install -g mcp-dingtalk-doc

# 验证版本
npm list -g mcp-dingtalk-doc

# 测试功能
mcp-dingtalk-doc --version
```

### 3. 标记 Git

```bash
# 创建 git tag
git tag v1.0.0
git push origin v1.0.0

# 或推送所有标签
git push --tags
```

## 常见问题

### 问题 1: 包名已存在

**错误**：`403 Forbidden - PUT https://registry.npmjs.org/mcp-dingtalk-doc - Package name too similar to existing package`

**解决**：更改 `package.json` 中的 `name` 字段。

### 问题 2: 权限不足

**错误**：`403 Forbidden - You do not have permission to publish`

**解决**：
```bash
# 确保已登录
npm whoami

# 确保包是公开的（无 scope 包默认公开）
npm access public mcp-dingtalk-doc
```

### 问题 3: 版本号已存在

**错误**：`403 Forbidden - cannot modify pre-existing version`

**解决**：
```bash
# 更新版本号
npm version patch
npm publish
```

### 问题 4: 构建文件缺失

**错误**：用户安装后无法运行

**解决**：
```bash
# 确保 package.json 中包含正确的 files 字段
"files": ["dist", "README.md", "LICENSE"]

# 确保 prepublishOnly 脚本存在
"scripts": {
  "prepublishOnly": "npm run build"
}
```

## 版本管理策略

### 语义化版本

- **1.0.0** - 首次正式发布
- **1.0.1** - Bug 修复
- **1.1.0** - 新增功能（向后兼容）
- **2.0.0** - 破坏性更新

### Beta 版本

如果需要发布测试版：

```bash
# 设置版本为 beta
npm version 1.1.0-beta.0

# 发布到 beta tag
npm publish --tag beta

# 用户安装 beta 版
npm install mcp-dingtalk-doc@beta
```

## 撤销发布

⚠️ **警告**：只能在发布后 72 小时内撤销

```bash
# 撤销特定版本
npm unpublish mcp-dingtalk-doc@1.0.0

# 撤销所有版本（慎用！）
npm unpublish mcp-dingtalk-doc --force
```

## 最佳实践

1. ✅ 每次发布前运行测试
2. ✅ 更新 CHANGELOG.md
3. ✅ 使用语义化版本
4. ✅ 发布后创建 Git tag
5. ✅ 在 README 中说明安装和使用方法
6. ✅ 包含 LICENSE 文件
7. ✅ 使用 .npmignore 排除不必要的文件
8. ❌ 不要发布包含密钥或敏感信息的版本
9. ❌ 不要频繁发布（建议攒一批更新再发布）

## 自动化发布

可以使用 GitHub Actions 自动发布：

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

## 参考资源

- [npm 文档 - Publishing packages](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)

