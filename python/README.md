# DingTalk Docs（钉钉文档）解析 MCP Server

一个用于解析 **钉钉文档（DingTalk Docs / AliDocs）** 内容并生成 HTML 的 **MCP（Model Context Protocol）** 服务器。

**Keywords**: 钉钉文档 / DingTalk Docs / MCP / Model Context Protocol / Cursor MCP

## ✨ 功能特性

- 🔐 **完整解析流程**: GET → 提取dentryKey → POST → 生成HTML
- 📊 **多元素支持**: 段落、表格、图片、代码块
- 🎨 **美观渲染**: 渐变色UI + 深色代码主题
- 📋 **代码复制**: 代码块支持一键复制
- 🌐 **灵活输入**: 支持完整URL或NODE_ID
- 📁 **自动归档**: 按NODE_ID创建独立文件夹

## 📦 安装

### 方式一: 从源码安装

```bash
cd mcp_dingtalk_doc
pip install -e .
```

### 方式二: 使用 uv

```bash
uv pip install -e mcp_dingtalk_doc
```

## ⚙️ 配置

### 环境变量

在使用前，需要设置钉钉Cookie：

```bash
export DINGTALK_COOKIE="your_dingtalk_cookie_here"
```

### 获取Cookie方法

1. 打开钉钉文档页面
2. 按 F12 打开开发者工具
3. 切换到 Network 标签
4. 刷新页面
5. 找到请求，复制 Cookie 字段


### 测试运行 (5秒)

```bash
cd ~/Documents/AIGC/dingtalk_api/mcp_dingtalk_doc
python3 server.py
```

看到服务启动（没有错误）就OK！按 `Ctrl+C` 停止。


### MCP 配置

在 Cursor 或其他支持MCP的客户端中配置：

```json
{
  "mcpServers": {
    "dingtalk-doc": {
      "command": "python3",
      "args": [
        "/Users/huangyunkun/Documents/AIGC/dingtalk_api/mcp_dingtalk_doc/server.py"
      ],
      "env": {
        "DINGTALK_COOKIE": "你的Cookie"
      }
    }
  }
}
```
注：
command： 如果你有很多python版本，可以写python的绝对路径例如："/Users/hykfft/anaconda3/envs/coderunner/bin/python"
args：改成你自己文件夹的地址



## 🚀 使用方法

重启Cursor，然后在聊天框输入：

```
请帮我解析这个钉钉文档：
https://alidocs.dingtalk.com/i/nodes/em7AML0b9lBV2Kxqa19qJnNyqOD6vwro
```

AI会自动调用 `parse_document` 工具！

### Tool 1: parse_document

prompt:

使用 dingtalk-doc 服务的 parse_document 工具，解析这个文档：https://alidocs.dingtalk.com/i/nodes/oP0MALyR8k7Aow9wCZ092D9N83bzYmDO 请保存所有文件。

文件夹默认地址：~/Documents/cursor-mcp/dingDoc 

**参数：**
- `url_or_node_id` (必需): 钉钉文档URL或NODE_ID
- `save_files` (可选): 是否保存文件，默认true
- `output_dir` (可选): 输出目录路径

**示例：**
```json
{
  "url_or_node_id": "https://alidocs.dingtalk.com/i/nodes/em7AML0b9lBV2Kxqa19qJnNyqOD6vwro",
  "save_files": true
}
```

**输出：**
```
dingtalk_doc_{NODE_ID}/
├── {NODE_ID}_mainsite.json      # GET请求数据，用于获取nodeId
├── {NODE_ID}_document.json      # POST请求数据 获取文档的内容documentContent.content
├── {NODE_ID}_content.json       # 文档的详细内容，里面是钉钉自定义的标签
└── {NODE_ID}.html               # 生成的HTML ⭐
```

### Tool 2: get_html
prompt:
使用 dingtalk-doc 服务的 get_html 工具，快速获取这个文档的HTML内容（不保存文件）：https://alidocs.dingtalk.com/i/nodes/oP0MALyR8k7Aow9wCZ092D9N83bzYmDO 

**参数：**
- `url_or_node_id` (必需): 钉钉文档URL或NODE_ID
- `cookie` (可选): 钉钉Cookie

**示例：**
```json
{
  "url_or_node_id": "em7AML0b9lBV2Kxqa19qJnNyqOD6vwro"
}
```

## 📖 支持的元素

| 元素 | 标签 | 功能 |
|------|------|------|
| 段落 | `p` | 文本段落、富文本 |
| 文本样式 | `span` | 粗体、颜色、字号 |
| 表格 | `table` | 完整表格、单元格合并 |
| 图片 | `img` | 图片显示、懒加载 |
| 代码块 | `code` | 11种语言、一键复制 |

## 🎨 HTML样式特点

- 🌈 渐变色背景（紫色系）
- 📱 响应式设计
- 💻 深色代码主题（VS Code Dark+）
- ✨ 流畅动画效果
- 📋 一键复制代码

## 🔧 开发

### 项目结构

```
mcp_dingtalk_doc/
├── __init__.py
├── server.py          # MCP服务器主文件
├── pyproject.toml     # 项目配置
└── README.md          # 说明文档
```

## 🐛 已知限制

- ⚠️ OSS加密的文档内容暂不支持完整解密
- ⚠️ 部分特殊元素（列表、引用块等）待支持
- ⚠️ 需要有效的Cookie（会话过期需要更新）

## 📝 版本历史

### v1.0.0 (2025-11-03)
- ✅ 初始版本
- ✅ 支持文档解析和HTML生成
- ✅ 支持5种文档元素
- ✅ 代码块一键复制功能

## 📄 许可

本项目仅供学习和研究使用。

## 👨‍💻 作者

黄云堃 (Yunkun Huang)

---

**MCP版本**: 1.0.0  
**Python版本**: >=3.10  
**最后更新**: 2025-11-03

