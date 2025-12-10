/**
 * 文档解析器主流程
 */

import * as path from 'path';
import * as os from 'os';
import {
  extractNodeId,
  checkCookie,
  extractMainsiteContent,
  extractDentryKey,
  extractDocumentContent,
  getDocumentTitle,
  sanitizeFilename,
  ensureDir,
  saveJsonFile,
  saveTextFile,
} from './utils.js';
import { fetchNodeByGet, fetchDocumentData } from './http-client.js';
import { generateHtmlFromContent } from './html-generator.js';
import { DocumentResult } from './types.js';

/**
 * 完整获取钉钉文档数据的流程
 */
export async function getCompleteDocumentData(
  urlOrNodeId: string,
  cookie: string,
  saveFiles: boolean = true,
  outputDir?: string
): Promise<DocumentResult> {
  const nodeId = extractNodeId(urlOrNodeId);

  // 步骤1: GET 请求获取 HTML
  console.error('📄 正在获取文档页面...');
  const html = await fetchNodeByGet(nodeId, cookie);

  // 保存 HTML 用于调试
  if (saveFiles) {
    const debugDir = outputDir || path.join(os.homedir(), 'Documents', 'cursor-mcp', 'dingDoc', 'debug');
    await ensureDir(debugDir);
    await saveTextFile(debugDir, 'page_response.html', html);
    console.error(`📝 页面响应已保存: ${debugDir}/page_response.html (${html.length} 字符)`);
  }

  // 步骤2: 提取 JSON
  console.error('🔍 正在提取文档信息...');
  const mainsiteContent = extractMainsiteContent(html);

  // 步骤2.5: 提取文档标题
  const docTitle = getDocumentTitle(mainsiteContent);
  console.error(`📝 文档标题: ${docTitle}`);

  // 步骤2.6: 如果保存文件，创建以标题命名的文件夹
  let outputPath: string | undefined;
  if (saveFiles) {
    const folderName = sanitizeFilename(docTitle);
    const baseDir = outputDir || path.join(os.homedir(), 'Documents', 'cursor-mcp', 'dingDoc');
    outputPath = path.join(baseDir, folderName);
    await ensureDir(outputPath);
    console.error(`📁 输出目录: ${outputPath}`);
  }

  if (saveFiles && outputPath) {
    await saveJsonFile(outputPath, `${nodeId}_mainsite.json`, mainsiteContent);
  }

  // 步骤3: 提取 dentryKey
  const dentryKey = extractDentryKey(mainsiteContent);
  console.error(`🔑 Dentry Key: ${dentryKey}`);

  // 步骤4: POST 请求获取文档数据
  console.error('📡 正在获取文档内容...');
  const documentData = await fetchDocumentData(cookie, dentryKey);

  if (saveFiles && outputPath) {
    await saveJsonFile(outputPath, `${nodeId}_document.json`, documentData);
  }

  // 步骤5: 提取内容
  const content = extractDocumentContent(documentData);

  let htmlContent: string | undefined;
  if (content) {
    if (saveFiles && outputPath) {
      await saveJsonFile(outputPath, `${nodeId}_content.json`, content);
    }

    // 步骤6: 生成 HTML
    console.error('🎨 正在生成 HTML...');
    htmlContent = generateHtmlFromContent(content, docTitle);

    if (saveFiles && htmlContent && outputPath) {
      await saveTextFile(outputPath, `${nodeId}.html`, htmlContent);
      console.error('✅ HTML 生成成功');
    }
  } else {
    console.error('⚠️ 无法提取文档内容（可能是OSS加密）');
  }

  return {
    node_id: nodeId,
    dentry_key: dentryKey,
    mainsite_content: mainsiteContent,
    document_data: documentData,
    content: content,
    html: htmlContent,
    output_dir: outputPath,
  };
}

