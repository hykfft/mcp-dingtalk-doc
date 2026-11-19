#!/usr/bin/env node
/**
 * 钉钉文档解析 MCP 服务器 - Node.js/TypeScript 版本
 * 主入口文件
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { checkCookie } from './utils.js';
import { getCompleteDocumentData } from './document-parser.js';
import { DingTalkCookieManager } from './cookie-manager.js';

/** 文档请求未授权时的错误特征（需触发登录弹窗） */
const UNAUTHORIZED_MESSAGE = '未找到 mainsite_server_content';

async function runWithLoginRetry<T>(
  initialCookie: string | undefined,
  urlOrNodeId: string,
  run: (cookie: string) => Promise<T>
): Promise<T> {
  const cookie = await checkCookie(initialCookie);

  try {
    const result = await run(cookie);
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    if (!msg.includes(UNAUTHORIZED_MESSAGE)) {
      throw err;
    }

    // 文档页未授权：弹窗让用户登录，再重试一次
    console.error('\n⚠️ 文档页面需要登录，正在打开浏览器...');

    try {
      const manager = new DingTalkCookieManager();
      const newCookie = await manager.autoLogin(false, 300000, undefined, true);
      if (!newCookie) {
        throw new Error('登录失败或超时，请稍后重试');
      }

      const retryResult = await run(newCookie);
      return retryResult;
    } catch (loginErr) {
      throw loginErr;
    }
  }
}

// ==================== 数据验证 ====================
const DingTalkDocRequestSchema = z.object({
  url_or_node_id: z.string().describe('钉钉文档的完整URL或NODE_ID'),
  cookie: z.string().optional().describe('钉钉登录Cookie（可选）'),
  save_files: z.boolean().optional().default(true).describe('是否保存中间文件'),
  output_dir: z.string().optional().describe('输出目录路径（可选）'),
});

const DingTalkDocParseRequestSchema = z.object({
  url_or_node_id: z.string().describe('钉钉文档的完整URL或NODE_ID'),
  cookie: z.string().optional().describe('钉钉登录Cookie（可选）'),
});

// ==================== MCP 服务器 ====================
const server = new Server(
  {
    name: 'mcp-dingtalk-doc-nodejs',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 列出可用工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'parse_document',
        description: '解析钉钉文档，提取内容并生成HTML文件',
        inputSchema: {
          type: 'object',
          properties: {
            url_or_node_id: {
              type: 'string',
              description: '钉钉文档的完整URL或NODE_ID',
            },
            cookie: {
              type: 'string',
              description: '钉钉登录Cookie（可选，未提供则使用环境变量）',
            },
            save_files: {
              type: 'boolean',
              description: '是否保存中间文件',
              default: true,
            },
            output_dir: {
              type: 'string',
              description: '输出目录路径（可选）',
            },
          },
          required: ['url_or_node_id'],
        },
      } as Tool,
      {
        name: 'get_html',
        description: '快速获取钉钉文档的HTML内容（不保存文件）',
        inputSchema: {
          type: 'object',
          properties: {
            url_or_node_id: {
              type: 'string',
              description: '钉钉文档的完整URL或NODE_ID',
            },
            cookie: {
              type: 'string',
              description: '钉钉登录Cookie（可选，未提供则使用环境变量）',
            },
          },
          required: ['url_or_node_id'],
        },
      } as Tool,
    ],
  };
});

// 调用工具
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'parse_document') {
    try {
      const args = DingTalkDocRequestSchema.parse(request.params.arguments);

      const result = await runWithLoginRetry(
        args.cookie,
        args.url_or_node_id,
        (cookie) =>
          getCompleteDocumentData(
            args.url_or_node_id,
            cookie,
            args.save_files,
            args.output_dir
          )
      );

      const output = ['✅ 钉钉文档解析成功！', `\n📌 节点ID: ${result.node_id}`, `🔑 Dentry Key: ${result.dentry_key}`];

      if (result.document_data) {
        const docInfo = result.document_data.data?.fileMetaInfo || {};
        output.push(`📄 文档名称: ${docInfo.name || '未知'}`);
        output.push(`📝 文档类型: ${docInfo.type || '未知'}`);
      }

      if (result.content) {
        output.push('\n✅ 内容提取成功');
        const partsCount = Object.keys(result.content.parts || {}).length;
        output.push(`   - Parts数量: ${partsCount}`);
      }

      if (result.html) {
        output.push('\n✅ HTML生成成功');
      }

      if (result.output_dir) {
        output.push(`\n📁 输出目录: ${result.output_dir}`);
        output.push(`   - ${result.node_id}_mainsite.json`);
        output.push(`   - ${result.node_id}_document.json`);
        if (result.content) {
          output.push(`   - ${result.node_id}_content.json`);
        }
        if (result.html) {
          output.push(`   - ${result.node_id}.html`);
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: output.join('\n'),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ 文档解析失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  } else if (request.params.name === 'get_html') {
    try {
      const args = DingTalkDocParseRequestSchema.parse(request.params.arguments);

      const result = await runWithLoginRetry(
        args.cookie,
        args.url_or_node_id,
        (cookie) =>
          getCompleteDocumentData(
            args.url_or_node_id,
            cookie,
            false // 不保存文件
          )
      );

      if (result.html) {
        const docName =
          result.document_data?.data?.fileMetaInfo?.name || '未知';
        const output = [
          '✅ HTML生成成功\n',
          `文档: ${docName}\n`,
          '--- HTML 内容 ---\n',
          result.html,
        ];
        return {
          content: [
            {
              type: 'text',
              text: output.join('\n'),
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: '⚠️ 无法提取文档内容（可能是OSS加密）',
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
            {
              type: 'text',
              text: `❌ 文档解析失败: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        isError: true,
      };
    }
  }

  throw new Error(`未知工具: ${request.params.name}`);
});

// ==================== 启动服务器 ====================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 钉钉文档解析 MCP 服务器已启动 (Node.js)');
}

main().catch((error) => {
  console.error('❌ 服务器启动失败:', error);
  process.exit(1);
});

