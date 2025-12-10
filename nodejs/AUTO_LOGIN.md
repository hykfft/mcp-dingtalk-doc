# 🔐 自动登录功能说明

## ✨ 功能特性

MCP 服务器现在包含**完全自动化的 Cookie 管理**，当 Cookie 失效时会自动处理登录流程。

## 🚀 工作流程

### 正常情况（Cookie 有效）

```
用户在 Cursor 中请求解析文档
    ↓
MCP 检查 Cookie
    ↓
✅ Cookie 有效
    ↓
直接执行任务 → 返回结果
```

**用户体验：** 无感知，秒级响应

---

### Cookie 失效情况（自动登录）

```
用户在 Cursor 中请求解析文档
    ↓
MCP 检查 Cookie
    ↓
❌ Cookie 失效（或不存在）
    ↓
🌐 自动打开浏览器
    ↓
👤 用户扫码/账号登录
    ↓
🔓 用户完成登录（关闭浏览器或按 Enter）
    ↓
💾 自动保存新 Cookie
    ↓
✅ 继续执行任务 → 返回结果
```

**用户体验：** 
- Cursor 显示："正在等待登录..."
- 浏览器自动弹出
- 用户登录完成
- 任务自动继续

---

## 📋 详细步骤

### 第 1 步：MCP 检测到 Cookie 失效

当你在 Cursor 中请求解析文档时，MCP 会：

1. 检查参数中的 Cookie
2. 检查环境变量中的 Cookie
3. 检查保存的 Cookie 文件
4. **验证每个 Cookie 是否有效**

如果所有 Cookie 都失效或不存在 → 触发自动登录

### 第 2 步：自动打开浏览器

MCP 会在控制台显示：

```
======================================================================
🔐 Cookie 失效，需要重新登录
======================================================================

浏览器将自动打开，请完成登录...
```

然后 Chrome 浏览器自动打开，显示钉钉文档登录页。

### 第 3 步：用户完成登录

在打开的浏览器中：

1. **扫码登录** 或 **账号密码登录**
2. 登录成功后，随便打开一个文档验证能访问
3. 确认能看到文档内容后：
   - **方式1**：关闭浏览器窗口
   - **方式2**：在控制台按 **Enter** 键

### 第 4 步：自动保存并继续

- ✅ Cookie 自动保存到 `dingtalk_cookies.json`
- ✅ MCP 使用新 Cookie 继续执行任务
- ✅ 任务结果返回到 Cursor

控制台显示：
```
✅ 登录成功！继续执行任务...
```

---

## 🎯 使用场景

### 场景 1：首次使用

```
用户：（Cursor 中）请解析这个钉钉文档
MCP：检测到没有 Cookie
    → 打开浏览器
用户：扫码登录 → 关闭浏览器
MCP：保存 Cookie → 完成解析
```

### 场景 2：Cookie 过期（7-30天后）

```
用户：（Cursor 中）请解析这个钉钉文档
MCP：检测到 Cookie 已失效
    → 打开浏览器
用户：重新登录 → 关闭浏览器
MCP：更新 Cookie → 完成解析
```

### 场景 3：Cookie 有效（常规使用）

```
用户：（Cursor 中）请解析这个钉钉文档
MCP：使用保存的 Cookie
    → 直接完成解析（秒级）
```

---

## 💡 优势

### 1. 零配置

不需要：
- ❌ 手动运行 `npm run cookie:login`
- ❌ 手动复制 Cookie
- ❌ 手动设置环境变量

只需：
- ✅ 在 Cursor 中正常使用
- ✅ Cookie 失效时登录一次
- ✅ 其他都自动处理

### 2. 无缝体验

- 用户感知最小化
- 只在必要时才打断
- 登录后自动继续任务

### 3. 智能检测

- 每次使用前验证 Cookie
- 实时检测失效状态
- 避免任务执行到一半失败

### 4. 安全可靠

- Cookie 保存在本地
- 自动加密存储
- 不上传到云端

---

## 🔧 技术实现

### Cookie 验证逻辑

```typescript
async function testCookie(cookie: string): Promise<boolean> {
  // 1. 访问钉钉文档首页
  const response = await axios.get('https://alidocs.dingtalk.com', {
    headers: { cookie }
  });

  // 2. 检查是否返回登录页
  if (response.data.includes('needLogin: true')) {
    return false;  // Cookie 无效
  }

  return true;  // Cookie 有效
}
```

### 自动登录流程

```typescript
async function getSmartCookie(): Promise<string> {
  // 1. 检查并验证现有 Cookie
  // 2. 如果都失效 → 调用 autoLogin()
  // 3. 打开浏览器 → 等待用户登录
  // 4. 保存新 Cookie → 返回
}
```

---

## ⚙️ 配置说明

### 默认配置（推荐）

**Cursor mcp.json：**

```json
{
  "mcpServers": {
    "dingtalk-doc": {
      "command": "node",
      "args": [
        "C:/path/to/mcp-dingtalk-doc-nodejs/dist/index.js"
      ]
    }
  }
}
```

**不需要配置 Cookie！** 会自动管理。

### 可选：预设 Cookie（跳过首次登录）

如果你已经有 Cookie，可以预设：

```json
{
  "mcpServers": {
    "dingtalk-doc": {
      "command": "node",
      "args": ["..."],
      "env": {
        "DINGTALK_COOKIE": "你的Cookie"
      }
    }
  }
}
```

MCP 会先使用这个 Cookie，失效后再自动登录。

---

## 📊 性能影响

| 情况 | 响应时间 | 用户操作 |
|------|---------|---------|
| Cookie 有效 | ~1-2秒 | 无 |
| Cookie 失效（首次） | ~10-30秒 | 登录一次 |
| Cookie 过期后 | ~10-30秒 | 重新登录 |

**Cookie 有效期：** 7-30 天，过期频率很低

---

## ⚠️ 注意事项

### 1. 需要安装 Playwright

自动登录功能需要 Playwright：

```bash
npm install playwright
npx playwright install chromium
```

如果没有安装，自动登录会失败并提示手动配置。

### 2. 浏览器窗口

- 自动打开的是 Chrome/Chromium
- 不是你的默认浏览器
- 登录状态独立（不会影响你的其他浏览器）

### 3. 超时设置

- 默认等待 5 分钟
- 如果超时未登录，任务会失败
- 可以重新尝试

---

## 🐛 故障排查

### 问题 1：浏览器没有自动打开

**原因：** Playwright 未安装

**解决：**
```bash
npm install playwright
npx playwright install chromium
npm run build
```

### 问题 2：登录后任务仍然失败

**原因：** 可能没有真正完成登录

**解决：**
1. 确保登录成功
2. 打开一个文档验证能访问
3. 再关闭浏览器

### 问题 3：每次都要登录

**原因：** Cookie 文件被删除或权限问题

**检查：**
```bash
# 查看 Cookie 文件
cat dingtalk_cookies.json

# 验证 Cookie
npm run cookie:check
```

---

## 🎉 总结

**自动登录让 MCP 使用更简单：**

1. ✅ 首次使用：登录一次，后续自动
2. ✅ Cookie 过期：自动检测，自动登录
3. ✅ 零配置：不需要手动管理 Cookie
4. ✅ 智能化：只在必要时才打断用户

**用户只需要：**
- 在 Cursor 中正常使用
- Cookie 失效时登录一次
- 其他都不用管！

---

*最后更新：2025-11-11*

