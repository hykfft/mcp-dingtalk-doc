/**
 * 工具函数
 */

import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * 从 URL 中提取 node_id
 */
export function extractNodeId(urlOrNodeId: string): string {
  if (urlOrNodeId.startsWith('http')) {
    const match = urlOrNodeId.match(/\/i\/nodes\/([^?/]+)/);
    if (!match) {
      throw new Error(`无法从URL中提取node_id: ${urlOrNodeId}`);
    }
    return match[1];
  }
  return urlOrNodeId;
}

/**
 * 检查 Cookie（支持自动加载和失效检测）
 */
export async function checkCookie(cookie?: string): Promise<string> {
  try {
    // 使用智能 Cookie 管理
    const { getSmartCookie } = await import('./smart-cookie.js');
    return await getSmartCookie(cookie);
  } catch (error) {
    // 如果智能管理失败，回退到简单检查
    if (cookie) return cookie;
    if (process.env.DINGTALK_COOKIE) return process.env.DINGTALK_COOKIE;

    throw new Error(
      '缺少钉钉Cookie。请使用以下方式之一：\n\n' +
        '方式 1 - 自动获取（推荐）：\n' +
        '  npm run cookie:login\n\n' +
        '方式 2 - 手动配置：\n' +
        '  1. 浏览器打开 https://alidocs.dingtalk.com\n' +
        '  2. 按 F12 → Network → 复制 Cookie\n' +
        '  3. 设置环境变量：DINGTALK_COOKIE\n'
    );
  }
}

/**
 * 从 HTML 中提取 mainsite_server_content
 */
export function extractMainsiteContent(html: string): any {
  const $ = cheerio.load(html);
  const script = $('#mainsite_server_content').html();

  if (!script) {
    throw new Error('未找到 mainsite_server_content');
  }

  try {
    return JSON.parse(script.trim());
  } catch (error) {
    throw new Error(`JSON解析失败: ${error}`);
  }
}

/**
 * 从 mainsite_content 中提取 dentryKey
 */
export function extractDentryKey(mainsiteContent: any): string {
  // 尝试从 dentryInfo 中获取
  if (mainsiteContent.dentryInfo?.data?.dentryKey) {
    return mainsiteContent.dentryInfo.data.dentryKey;
  }

  // 尝试从 data 中获取 nodeId
  if (mainsiteContent.data?.nodeId) {
    return mainsiteContent.data.nodeId;
  }

  throw new Error('未找到 dentryKey 或 nodeId');
}

/**
 * 从 document_data 中提取文档内容
 */
export function extractDocumentContent(documentData: any): any | null {
  try {
    const contentStr = documentData.data.documentContent.checkpoint.content;
    return JSON.parse(contentStr);
  } catch {
    return null;
  }
}

/**
 * 从 mainsite_content 中提取文档标题
 */
export function getDocumentTitle(mainsiteContent: any): string {
  try {
    return mainsiteContent.dentryInfo?.data?.name || '钉钉文档';
  } catch {
    return '钉钉文档';
  }
}

/**
 * 清理文件名
 */
export function sanitizeFilename(filename: string): string {
  const illegalChars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];
  let clean = filename;

  for (const char of illegalChars) {
    clean = clean.replace(new RegExp(`\\${char}`, 'g'), '_');
  }

  // 移除 .adoc 后缀
  if (clean.toLowerCase().endsWith('.adoc')) {
    clean = clean.slice(0, -5);
  }

  clean = clean.trim();

  if (!clean) {
    clean = '未命名文档';
  }

  if (clean.length > 200) {
    clean = clean.slice(0, 200);
  }

  return clean;
}

/**
 * 确保目录存在
 */
export async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // 忽略已存在的目录
  }
}

/**
 * 保存 JSON 文件
 */
export async function saveJsonFile(
  dir: string,
  filename: string,
  data: any
): Promise<void> {
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 保存文本文件
 */
export async function saveTextFile(
  dir: string,
  filename: string,
  content: string
): Promise<void> {
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * HTML 转义
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

