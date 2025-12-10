# 项目结构说明

## 📁 目录结构

```
mcp-dingtalk-doc/
│
├── 📄 README.md                      # 主说明文档（对比两个版本）
├── 📄 .gitignore                     # Git 忽略配置
├── 📄 CHANGELOG.md                   # 版本更新日志
├── 📄 COMMIT_MESSAGE.md              # Git 提交说明（参考）
├── 📄 PROJECT_STRUCTURE.md           # 本文件
├── 📄 mcp_config_example.json        # MCP 配置示例
│
├── 📁 python/                        # Python 版本 🐍
│   ├── 📄 __init__.py                # Python 包初始化
│   ├── 📄 server.py                  # MCP 服务器主文件
│   ├── 📄 cookie_manager.py          # Cookie 管理器
│   ├── 📄 pyproject.toml             # Python 项目配置
│   ├── 📄 requirements.txt           # Python 依赖列表
│   ├── 📄 requirements_minimal.txt   # 最小依赖
│   ├── 📄 README.md                  # Python 版本文档
│   ├── 📄 DEPLOYMENT.md              # 部署说明
│   ├── 📜 setup_env.bat              # Windows 环境配置脚本
│   └── 📜 setup_env.sh               # Linux/Mac 环境配置脚本
│
└── 📁 nodejs/                        # Node.js/TypeScript 版本 ⚡
    ├── 📁 src/                       # TypeScript 源代码
    │   ├── 📄 index.ts               # MCP 服务器入口
    │   ├── 📄 cookie-manager.ts      # Cookie 管理器
    │   ├── 📄 smart-cookie.ts        # 智能 Cookie 管理
    │   ├── 📄 document-parser.ts     # 文档解析器
    │   ├── 📄 html-generator.ts      # HTML 生成器
    │   ├── 📄 http-client.ts         # HTTP 客户端
    │   ├── 📄 utils.ts               # 工具函数
    │   ├── 📄 types.ts               # TypeScript 类型定义
    │   └── 📄 constants.ts           # 常量定义
    │
    ├── 📁 dist/                      # 编译后的 JavaScript 代码
    │   ├── 📄 *.js                   # 编译后的 JS 文件
    │   ├── 📄 *.d.ts                 # TypeScript 类型声明
    │   └── 📄 *.map                  # Source Map 文件
    │
    ├── 📁 node_modules/              # Node.js 依赖（忽略）
    │
    ├── 📄 package.json               # Node.js 项目配置
    ├── 📄 package-lock.json          # 依赖锁定文件
    ├── 📄 tsconfig.json              # TypeScript 编译配置
    ├── 📄 README.md                  # Node.js 版本文档
    ├── 📄 AUTO_LOGIN.md              # 自动登录说明
    │
    ├── 📜 setup.bat                  # Windows 安装脚本
    ├── 📜 setup.sh                   # Linux/Mac 安装脚本
    ├── 📜 quick-start.bat            # Windows 快速启动
    ├── 📜 quick-start.sh             # Linux/Mac 快速启动
    └── 📜 configure-cursor.bat       # Cursor 配置脚本
```

## 📋 文件说明

### 根目录文件

| 文件 | 说明 |
|------|------|
| `README.md` | 主文档，介绍项目、对比两个版本、快速开始 |
| `.gitignore` | Git 忽略配置，排除 node_modules、__pycache__ 等 |
| `CHANGELOG.md` | 版本更新日志，记录所有重要变更 |
| `COMMIT_MESSAGE.md` | Git 提交说明模板和提交步骤 |
| `PROJECT_STRUCTURE.md` | 本文件，项目结构说明 |
| `mcp_config_example.json` | MCP 配置示例，供参考 |

### Python 版本文件

| 文件 | 说明 | 功能 |
|------|------|------|
| `server.py` | MCP 服务器 | 主入口，处理 MCP 请求 |
| `cookie_manager.py` | Cookie 管理 | 手动 Cookie 配置和验证 |
| `pyproject.toml` | 项目配置 | Python 包信息和依赖 |
| `requirements.txt` | 依赖列表 | 完整依赖包 |
| `requirements_minimal.txt` | 最小依赖 | 核心依赖包 |
| `README.md` | Python 文档 | 安装、配置、使用说明 |
| `DEPLOYMENT.md` | 部署文档 | 详细的部署指南 |
| `setup_env.*` | 环境配置脚本 | 自动配置环境 |

### Node.js 版本文件

#### 源代码 (src/)

| 文件 | 说明 | 功能 |
|------|------|------|
| `index.ts` | MCP 服务器入口 | 主入口，处理 MCP 请求 |
| `cookie-manager.ts` | Cookie 管理器 | Playwright 自动登录、Cookie 持久化 |
| `smart-cookie.ts` | 智能 Cookie | 自动检测失效、智能获取 |
| `document-parser.ts` | 文档解析器 | 解析钉钉文档结构 |
| `html-generator.ts` | HTML 生成器 | 生成美化的 HTML |
| `http-client.ts` | HTTP 客户端 | 钉钉 API 请求 |
| `utils.ts` | 工具函数 | 通用辅助函数 |
| `types.ts` | 类型定义 | TypeScript 类型 |
| `constants.ts` | 常量定义 | 配置常量 |

#### 配置文件

| 文件 | 说明 |
|------|------|
| `package.json` | Node.js 项目配置、依赖、脚本 |
| `tsconfig.json` | TypeScript 编译配置 |
| `README.md` | Node.js 版本完整文档 |
| `AUTO_LOGIN.md` | 自动登录功能详细说明 |

#### 脚本文件

| 文件 | 说明 | 用途 |
|------|------|------|
| `setup.bat/sh` | 安装脚本 | 自动安装依赖并构建 |
| `quick-start.bat/sh` | 快速启动 | 一键启动开发环境 |
| `configure-cursor.bat` | Cursor 配置 | 自动配置 MCP |

#### 编译输出 (dist/)

- `*.js` - 编译后的 JavaScript 代码
- `*.d.ts` - TypeScript 类型声明文件
- `*.map` - Source Map（调试用）

## 🔄 文件流程

### Python 版本工作流

```
1. 用户请求 → server.py
2. 验证 Cookie → cookie_manager.py
3. 请求钉钉 API → server.py
4. 解析文档 → server.py
5. 生成 HTML → server.py
6. 返回结果
```

### Node.js 版本工作流

```
1. 用户请求 → index.ts
2. 检查 Cookie → utils.ts (checkCookie)
3. 智能获取 → smart-cookie.ts (getSmartCookie)
   ├─ 验证参数 Cookie
   ├─ 验证环境变量
   ├─ 验证保存的文件
   └─ 失效？→ cookie-manager.ts (autoLogin)
       └─ Playwright 打开浏览器 → 用户登录 → 保存 Cookie
4. 获取文档 → document-parser.ts
   ├─ HTTP GET → http-client.ts
   ├─ 提取 dentryKey → utils.ts
   └─ HTTP POST → http-client.ts
5. 生成 HTML → html-generator.ts
6. 保存文件（可选） → utils.ts
7. 返回结果
```

## 📦 依赖管理

### Python 版本

**安装依赖：**
```bash
cd python
pip install -r requirements.txt
# 或
pip install -e .
```

**核心依赖：**
- httpx (HTTP 客户端)
- beautifulsoup4 (HTML 解析)
- pydantic (数据验证)
- mcp (MCP SDK)

### Node.js 版本

**安装依赖：**
```bash
cd nodejs
npm install
```

**核心依赖：**
- @modelcontextprotocol/sdk (MCP 官方 SDK)
- axios (HTTP 客户端)
- cheerio (HTML 解析)
- zod (数据验证)

**可选依赖：**
- playwright (自动登录)

## 🚀 快速开始

### Python 版本

```bash
cd python
pip install -r requirements.txt
export DINGTALK_COOKIE="your_cookie"
python server.py  # 测试运行
```

### Node.js 版本

```bash
cd nodejs
npm install
npm run build
npm run cookie:login  # 自动登录
# 或 export DINGTALK_COOKIE="your_cookie"
npm start  # 测试运行
```

## 🔍 查找文件

### 我想修改...

**文档解析逻辑：**
- Python: `python/server.py`
- Node.js: `nodejs/src/document-parser.ts`

**HTML 样式：**
- Python: `python/server.py` (HTML 模板部分)
- Node.js: `nodejs/src/html-generator.ts`

**Cookie 管理：**
- Python: `python/cookie_manager.py`
- Node.js: `nodejs/src/cookie-manager.ts` 和 `smart-cookie.ts`

**HTTP 请求：**
- Python: `python/server.py`
- Node.js: `nodejs/src/http-client.ts`

**配置常量：**
- Python: `python/server.py` (顶部)
- Node.js: `nodejs/src/constants.ts`

## 📝 开发建议

1. **修改 Python 版本**：直接编辑 `python/*.py` 文件
2. **修改 Node.js 版本**：
   - 编辑 `nodejs/src/*.ts` 文件
   - 运行 `npm run build` 重新编译
   - 或运行 `npm run dev` 开发模式（热重载）

3. **测试修改**：
   - 两个版本互不干扰，可以分别测试
   - 建议在 MCP 配置中同时配置两个版本

4. **提交代码**：
   - 参考 `COMMIT_MESSAGE.md` 中的提交说明
   - 确保修改后两个版本都能正常运行

## 🎯 文件大小

- **Python 版本**: ~2 MB（不含 venv）
- **Node.js 版本**: ~32 MB（含 node_modules）
- **编译输出**: ~500 KB
- **源代码**: ~100 KB

## 📊 代码统计

### Python 版本
- `server.py`: ~1200 行
- `cookie_manager.py`: ~300 行
- 总计: ~1500 行

### Node.js 版本
- 所有 `.ts` 文件: ~1000 行
- 平均每文件: ~100-150 行
- 模块化程度更高

---

**更新时间**: 2025-12-01  
**项目版本**: v2.0.0

