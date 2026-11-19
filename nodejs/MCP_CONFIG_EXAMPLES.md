# MCP 配置示例

发布到 npm 后，用户可以通过多种方式配置和使用本工具。

## ⚠️ 重要提示：平台差异

> **Windows 和 macOS/Linux 的配置方式不同！请根据你的操作系统选择正确的配置方式。**

| 平台 | 推荐方式 | npx 支持 |
|------|---------|---------|
| 🍎 **macOS** | npx | ✅ 支持 |
| 🐧 **Linux** | npx | ✅ 支持 |
| 🪟 **Windows** | 全局安装 | ❌ 不支持 |

## 📍 配置文件位置

### Cursor

- **Windows**: `%APPDATA%\Cursor\mcp.json`
- **Mac**: `~/Library/Application Support/Cursor/mcp.json`
- **Linux**: `~/.cursor/mcp.json`

### Claude Desktop

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

---

## 🍎 macOS / Linux 配置

### ⭐ 方式 1: 使用 npx（推荐）

**优点**：
- ✅ 无需安装
- ✅ 自动使用最新版本
- ✅ 节省磁盘空间
- ✅ 配置简单

**配置**：

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

**说明**：
- `-y` 参数：自动确认安装，无需用户交互
- 首次运行时 npx 会自动下载包
- 后续运行会使用缓存的版本

---

## 🪟 Windows 配置

### ⭐ 必须使用全局安装（唯一方式）

> ⚠️ **Windows 不支持 npx 方式！** 由于 Windows 需要 `.cmd` 包装脚本来执行 Node.js 脚本，`npx` 无法正确处理。

**步骤 1：全局安装**

```bash
npm install -g mcp-dingtalk-doc
```

**步骤 2：配置 MCP**

```json
{
  "mcpServers": {
    "dingtalk-doc": {
      "command": "mcp-dingtalk-doc"
    }
  }
}
```

**步骤 3：重启 Cursor**

**更新版本**：

```bash
npm update -g mcp-dingtalk-doc
```

### 🔍 为什么 Windows 不支持 npx？

- Windows 需要 `.cmd` 包装脚本来执行 Node.js 脚本
- `npx` 的临时目录处理在 Windows 上无法正确创建这些脚本
- `npm install -g` 会自动创建正确的 `.cmd` 包装脚本到全局 bin 目录

---

## 📊 所有平台通用方式

### 🚀 方式: 全局安装（所有平台都支持）

**优点**：
- ✅ 启动速度更快（无需 npx 检查）
- ✅ 可离线使用
- ✅ 版本固定，稳定可控
- ✅ **Windows 唯一可用方式**

**缺点**：
- ⚠️ 需要手动更新版本
- ⚠️ 占用磁盘空间

**安装**：

```bash
npm install -g mcp-dingtalk-doc
```

**配置**：

```json
{
  "mcpServers": {
    "dingtalk-doc": {
      "command": "mcp-dingtalk-doc"
    }
  }
}
```

**更新**：

```bash
npm update -g mcp-dingtalk-doc
```

---

### 🛠️ 方式 3: 从源码使用（开发者）

**适用场景**：
- 需要修改源码
- 需要调试
- 参与项目贡献

**步骤**：

```bash
# 克隆仓库
git clone https://github.com/hykfft/mcp-dingtalk-doc.git
cd mcp-dingtalk-doc/nodejs

# 安装依赖
npm install

# 构建
npm run build
```

**配置**：

```json
{
  "mcpServers": {
    "dingtalk-doc": {
      "command": "node",
      "args": [
        "C:/Users/YourName/mcp-dingtalk-doc/nodejs/dist/index.js"
      ],
      "env": {
        "DINGTALK_COOKIE": "可选"
      }
    }
  }
}
```

⚠️ **注意**：路径需要改为你的实际路径

---

### 🔧 方式 4: 使用特定版本

如果需要使用特定版本（例如测试新功能）：

```json
{
  "mcpServers": {
    "dingtalk-doc": {
      "command": "npx",
      "args": ["-y", "mcp-dingtalk-doc@1.0.0"],
      "env": {
        "DINGTALK_COOKIE": "可选"
      }
    }
  }
}
```

---

## 🍪 Cookie 配置说明

### 不配置 Cookie（推荐）

工具会自动打开浏览器让你登录：

```json
{
  "mcpServers": {
    "dingtalk-doc": {
      "command": "npx",
      "args": ["-y", "mcp-dingtalk-doc"]
      // 无需 env.DINGTALK_COOKIE
    }
  }
}
```

### 手动配置 Cookie

如果你已经有 Cookie：

```json
{
  "mcpServers": {
    "dingtalk-doc": {
      "command": "npx",
      "args": ["-y", "mcp-dingtalk-doc"],
      "env": {
        "DINGTALK_COOKIE": "你的钉钉Cookie"
      }
    }
  }
}
```

**如何获取 Cookie**：
1. 浏览器打开 https://alidocs.dingtalk.com
2. 登录你的钉钉账号
3. 按 F12 打开开发者工具
4. 切换到 Network 标签
5. 刷新页面，点击任意请求
6. 在 Request Headers 中找到 Cookie，复制完整值

---

## 🎨 完整配置示例

### 单个服务器

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

### 多个 MCP 服务器

```json
{
  "mcpServers": {
    "dingtalk-doc": {
      "command": "npx",
      "args": ["-y", "mcp-dingtalk-doc"],
      "env": {
        "DINGTALK_COOKIE": "可选"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/directory"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your_token_here"
      }
    }
  }
}
```

---

## 🔄 版本对比

| 配置方式 | 安装 | 启动速度 | 更新 | 离线使用 | 推荐度 |
|---------|------|---------|------|---------|--------|
| **npx** | 无需 | 慢（首次）/中等 | 自动 | ❌ | ⭐⭐⭐⭐⭐ |
| **全局安装** | 需要 | 快 | 手动 | ✅ | ⭐⭐⭐⭐ |
| **源码** | 需要 | 快 | 手动 | ✅ | ⭐⭐⭐ |

---

## 🆘 常见问题

### Q: npx 每次都会重新下载吗？

A: 不会。npx 会缓存已下载的包，只有首次运行或版本更新时才会下载。

### Q: 如何强制使用最新版本？

A: 清除 npx 缓存：

```bash
# 清除 npm 缓存
npm cache clean --force

# 或直接指定最新版
npx -y mcp-dingtalk-doc@latest
```

### Q: 全局安装和 npx 哪个更好？

A: 
- **日常使用推荐 npx**：无需管理，自动更新
- **频繁使用推荐全局安装**：启动更快

### Q: Cookie 会过期吗？

A: 会的，钉钉 Cookie 一般 7-30 天过期。不过工具会自动检测并引导你重新登录。

### Q: 多人使用需要各自配置 Cookie 吗？

A: 是的，每个用户需要使用自己的钉钉账号 Cookie。

---

## 💡 最佳实践

1. **个人使用**：使用 npx，简单方便
2. **团队使用**：建议文档说明配置方式，让成员自行选择
3. **CI/CD**：使用全局安装或源码方式，确保稳定性
4. **开发调试**：使用源码方式

---

## 📚 相关链接

- [npm 包页面](https://www.npmjs.com/package/mcp-dingtalk-doc)
- [GitHub 仓库](https://github.com/hykfft/mcp-dingtalk-doc)
- [使用文档](./README.md)
- [发布指南](./PUBLISHING.md)

---

**推荐配置（复制粘贴即用）**：

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

🎉 就这么简单！无需安装，直接使用！

