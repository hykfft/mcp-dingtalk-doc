# 🔐 自动登录流程说明

## ✨ 智能 Cookie 管理

本工具实现了**完全自动化的 Cookie 管理**，用户无需手动获取或配置 Cookie！

## 🔄 工作流程

### 首次使用

```
用户执行：在 Cursor 中请求解析钉钉文档
    ↓
工具检测：没有有效的 Cookie
    ↓
自动操作：
    1. ✅ 自动安装 Playwright 浏览器（首次）
    2. 🌐 自动打开浏览器窗口
    3. 📱 显示钉钉登录页面
    ↓
用户操作：扫码登录（或密码登录）
    ↓
工具操作：
    1. 💾 自动保存 Cookie 到本地
    2. 📄 继续解析文档
    3. ✅ 完成任务
```

### 后续使用

```
用户执行：在 Cursor 中请求解析钉钉文档
    ↓
工具检测：有有效的 Cookie
    ↓
工具操作：
    1. 📄 直接解析文档
    2. ✅ 完成任务
```

### Cookie 失效时

```
用户执行：在 Cursor 中请求解析钉钉文档
    ↓
工具检测：Cookie 已失效
    ↓
自动操作：
    1. ⚠️ 提示 Cookie 失效
    2. 🌐 自动打开浏览器
    3. 📱 显示登录页面
    ↓
用户操作：重新扫码登录
    ↓
工具操作：
    1. 💾 更新 Cookie
    2. 📄 继续解析文档
    3. ✅ 完成任务
```

## 🎯 使用 npx 时的自动登录

### 配置 MCP

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

### 实际使用流程

#### 第一次使用

```
1. 用户在 Cursor 中说：
   "请帮我解析这个钉钉文档：https://alidocs.dingtalk.com/i/nodes/xxx"

2. npx 自动下载包（首次）
   ⏬ Downloading mcp-dingtalk-doc...

3. 安装 Playwright 浏览器（首次，postinstall 脚本）
   ⏬ Installing Playwright browsers...

4. 工具检测到没有 Cookie
   🔍 Checking for valid cookies...
   ❌ No valid cookie found

5. 自动打开浏览器
   🌐 Opening browser for login...
   📱 Please scan QR code with DingTalk app

6. 用户扫码登录
   [浏览器窗口显示钉钉登录页面]
   [用户用钉钉 App 扫码]

7. 登录成功，自动保存 Cookie
   ✅ Login successful!
   💾 Cookie saved to: dingtalk_cookies.json

8. 继续解析文档
   📄 Parsing document...
   ✅ HTML generated: ~/Documents/cursor-mcp/dingDoc/...
```

#### 后续使用（Cookie 有效）

```
1. 用户在 Cursor 中说：
   "请帮我解析这个钉钉文档：https://alidocs.dingtalk.com/i/nodes/yyy"

2. 工具使用保存的 Cookie
   ✅ Using saved cookie

3. 直接解析文档
   📄 Parsing document...
   ✅ HTML generated: ~/Documents/cursor-mcp/dingDoc/...
```

#### Cookie 过期时（7-30天后）

```
1. 用户在 Cursor 中请求解析文档

2. 工具检测到 Cookie 失效
   ⚠️ Saved cookie has expired

3. 自动重新登录
   🔐 Cookie expired, need to re-login
   🌐 Opening browser for login...

4. 用户重新扫码

5. 更新 Cookie 并继续
   ✅ Login successful!
   💾 Cookie updated
   📄 Parsing document...
```

## 💡 关键特性

### 1. 零配置

用户**完全不需要**：
- ❌ 手动安装 Playwright
- ❌ 手动获取 Cookie
- ❌ 配置环境变量
- ❌ 运行额外命令

只需要：
- ✅ 配置 MCP（一行 npx 命令）
- ✅ 首次使用时扫码登录
- ✅ 之后自动使用

### 2. 智能检测

工具会**自动检测**：
- ✅ Cookie 是否存在
- ✅ Cookie 是否有效
- ✅ Cookie 是否过期
- ✅ Playwright 是否安装

### 3. 自动处理

遇到问题时**自动处理**：
- ✅ Cookie 无效 → 自动打开浏览器登录
- ✅ Cookie 过期 → 自动引导重新登录
- ✅ 浏览器未安装 → 自动安装（postinstall）

### 4. 持久化存储

Cookie 自动保存到：
- 📁 `dingtalk_cookies.json`（本地文件）
- ⏱️ 有效期：7-30 天
- 🔄 过期后自动刷新

## 🔧 技术实现

### Cookie 验证逻辑

```typescript
async function getSmartCookie(providedCookie?: string): Promise<string> {
  // 1. 尝试提供的 Cookie
  if (providedCookie && await testCookie(providedCookie)) {
    return providedCookie;
  }

  // 2. 尝试环境变量
  if (process.env.DINGTALK_COOKIE && await testCookie(process.env.DINGTALK_COOKIE)) {
    return process.env.DINGTALK_COOKIE;
  }

  // 3. 尝试本地保存的 Cookie
  const savedCookie = await loadSavedCookie();
  if (savedCookie && await testCookie(savedCookie)) {
    return savedCookie;
  }

  // 4. 都失效 → 自动登录
  console.error('🔐 Cookie 失效，需要重新登录');
  console.error('浏览器将自动打开，请完成登录...');
  
  const newCookie = await autoLogin();
  return newCookie;
}
```

### 自动登录实现

```typescript
async autoLogin(): Promise<string> {
  const browser = await playwright.chromium.launch({
    headless: false,  // 显示浏览器窗口
    channel: 'chromium'
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 打开钉钉文档登录页
  await page.goto('https://alidocs.dingtalk.com');

  // 等待用户登录（检测特定元素出现）
  await page.waitForURL(/alidocs.dingtalk.com\/(?!login)/, {
    timeout: 300000  // 5 分钟超时
  });

  // 获取 Cookie
  const cookies = await context.cookies();
  
  // 保存到本地
  await saveCookies(cookies);

  await browser.close();
  return cookieString;
}
```

## 📊 用户体验对比

### 传统方式

```
1. 安装工具
2. 打开钉钉文档
3. F12 开发者工具
4. Network 标签
5. 刷新页面
6. 找到请求
7. 复制 Cookie
8. 设置环境变量或配置文件
9. 重启 Cursor
10. 开始使用
```

### 本工具方式

```
1. 配置 MCP（npx 一行命令）
2. 重启 Cursor
3. 请求解析文档
4. 扫码登录（首次）
5. 完成！
```

**节省步骤**：10 步 → 5 步（减少 50%）  
**技术门槛**：高 → 低（无需了解 Cookie）  
**维护成本**：高 → 零（自动刷新）

## 🎉 总结

使用 **npx + 自动登录**，用户获得：

- ✅ **零配置体验** - 无需手动获取 Cookie
- ✅ **自动化管理** - Cookie 自动保存和刷新
- ✅ **无缝体验** - 过期自动重新登录
- ✅ **简单易用** - 只需扫码，无需技术知识

这就是为什么我们推荐使用 npx 方式！🚀

