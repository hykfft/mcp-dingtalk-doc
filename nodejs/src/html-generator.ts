/**
 * HTML 生成器
 */

import { CODE_LANGUAGE_MAP } from './types.js';
import { escapeHtml } from './utils.js';

/**
 * 解析文本样式
 */
function parseTextStyle(styleObj: any): string {
  const styles: string[] = [];

  if (styleObj.bold) {
    styles.push('font-weight: bold');
  }
  if (styleObj.color) {
    styles.push(`color: ${styleObj.color}`);
  }
  if (styleObj.sz && styleObj.szUnit) {
    styles.push(`font-size: ${styleObj.sz}${styleObj.szUnit}`);
  }

  return styles.length > 0 ? styles.join('; ') : '';
}

/**
 * 解析 span 元素
 */
function parseSpan(spanElem: any[]): string {
  if (!Array.isArray(spanElem) || spanElem.length < 2 || spanElem[0] !== 'span') {
    return '';
  }

  const attrs = spanElem[1] || {};
  const htmlParts: string[] = [];

  for (let i = 2; i < spanElem.length; i++) {
    const child = spanElem[i];
    if (typeof child === 'string') {
      const text = child.replace(/\n/g, '<br>');
      if (text) {
        const style = parseTextStyle(attrs);
        htmlParts.push(style ? `<span style="${style}">${text}</span>` : text);
      }
    } else if (Array.isArray(child)) {
      htmlParts.push(parseSpan(child));
    }
  }

  return htmlParts.join('');
}

/**
 * 解析段落
 */
function parseParagraph(paraElem: any[]): string {
  if (!Array.isArray(paraElem) || paraElem.length < 2) {
    return '';
  }

  const tag = paraElem[0];

  if (tag === 'p') {
    const contentParts: string[] = [];
    for (let i = 2; i < paraElem.length; i++) {
      const child = paraElem[i];
      if (Array.isArray(child) && child.length > 0) {
        if (child[0] === 'img') {
          contentParts.push(parseImage(child));
        } else {
          contentParts.push(parseSpan(child));
        }
      } else if (typeof child === 'string') {
        contentParts.push(child);
      }
    }

    let paragraphHtml = contentParts.join('');
    if (!paragraphHtml.trim()) {
      paragraphHtml = '&nbsp;';
    }

    return `<p>${paragraphHtml}</p>`;
  }

  if (tag === 'img') {
    return parseImage(paraElem);
  }

  return '';
}

/**
 * 解析图片
 */
function parseImage(imgElem: any[]): string {
  if (!Array.isArray(imgElem) || imgElem.length < 2 || imgElem[0] !== 'img') {
    return '';
  }

  const attrs = imgElem[1] || {};
  const src = attrs.src || '';
  const name = attrs.name || '图片';
  const width = attrs.width || 'auto';

  if (!src) {
    return `<p style="color: #999;">[图片: ${name}]</p>`;
  }

  return `<div class="image-container"><img src="${src}" alt="${name}" style="max-width: ${width}px; height: auto;" loading="lazy" /></div>`;
}

/**
 * 解析代码块
 */
function parseCodeBlock(codeElem: any[]): string {
  if (!Array.isArray(codeElem) || codeElem.length < 2 || codeElem[0] !== 'code') {
    return '';
  }

  const attrs = codeElem[1] || {};
  const syntax = attrs.syntax || 'text/plain';
  const code = attrs.code || '';

  if (!code) {
    return '';
  }

  const language =
    CODE_LANGUAGE_MAP[syntax] || syntax.replace('text/x-', '').replace('text/', '');
  const codeEscaped = escapeHtml(code);

  return `<div class="code-block">
    <div class="code-header">
        <span class="code-language">${language}</span>
        <button class="code-copy" onclick="copyCode(this)" title="复制代码">📋 复制</button>
    </div>
    <pre><code class="language-${language}">${codeEscaped}</code></pre>
</div>`;
}

/**
 * 解析表格单元格
 */
function parseTableCell(tcElem: any[]): string {
  if (!Array.isArray(tcElem) || tcElem.length < 2 || tcElem[0] !== 'tc') {
    return '';
  }

  const attrs = tcElem[1] || {};
  const rowSpan = attrs.rowSpan || 1;
  const colSpan = attrs.colSpan || 1;
  const fill = attrs.fill || '';
  const vAlign = attrs.vAlign || 'top';

  const styles: string[] = [];
  if (fill) styles.push(`background-color: ${fill}`);
  if (vAlign) styles.push(`vertical-align: ${vAlign}`);

  const styleStr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';

  const contentParts: string[] = [];
  for (let i = 2; i < tcElem.length; i++) {
    const child = tcElem[i];
    if (Array.isArray(child) && child.length > 0 && child[0] === 'p') {
      const pContent: string[] = [];
      for (let j = 2; j < child.length; j++) {
        const pChild = child[j];
        if (Array.isArray(pChild)) {
          pContent.push(parseSpan(pChild));
        } else if (typeof pChild === 'string') {
          pContent.push(pChild);
        }
      }
      contentParts.push(pContent.join(''));
    }
  }

  const cellContent = contentParts.length > 0 ? contentParts.join('<br>') : '&nbsp;';

  const rowspanAttr = rowSpan > 1 ? ` rowspan="${rowSpan}"` : '';
  const colspanAttr = colSpan > 1 ? ` colspan="${colSpan}"` : '';

  return `<td${rowspanAttr}${colspanAttr}${styleStr}>${cellContent}</td>`;
}

/**
 * 解析表格行
 */
function parseTableRow(trElem: any[]): string {
  if (!Array.isArray(trElem) || trElem.length < 2 || trElem[0] !== 'tr') {
    return '';
  }

  const cellsHtml: string[] = [];
  for (let i = 2; i < trElem.length; i++) {
    const child = trElem[i];
    if (Array.isArray(child) && child.length > 0 && child[0] === 'tc') {
      const cellHtml = parseTableCell(child);
      if (cellHtml) {
        cellsHtml.push(cellHtml);
      }
    }
  }

  if (cellsHtml.length === 0) {
    return '';
  }

  return `<tr>${cellsHtml.join('')}</tr>`;
}

/**
 * 解析表格
 */
function parseTable(tableElem: any[]): string {
  if (!Array.isArray(tableElem) || tableElem.length < 2 || tableElem[0] !== 'table') {
    return '';
  }

  const rowsHtml: string[] = [];
  for (let i = 2; i < tableElem.length; i++) {
    const child = tableElem[i];
    if (Array.isArray(child) && child.length > 0 && child[0] === 'tr') {
      const rowHtml = parseTableRow(child);
      if (rowHtml) {
        rowsHtml.push(rowHtml);
      }
    }
  }

  if (rowsHtml.length === 0) {
    return '';
  }

  return `<div class="table-container">
    <table class="doc-table">
        ${rowsHtml.join('')}
    </table>
</div>`;
}

/**
 * 从 content 生成 HTML
 */
export function generateHtmlFromContent(content: any, docTitle: string = '钉钉文档'): string {
  if (!content) {
    return '';
  }

  try {
    const mainKey = content.main;
    if (!mainKey) {
      return '';
    }

    const parts = content.parts || {};
    const mainPart = parts[mainKey] || {};
    const data = mainPart.data || {};
    const body = data.body || [];

    const htmlParts: string[] = [];

    for (let i = 2; i < body.length; i++) {
      const item = body[i];
      if (!Array.isArray(item) || item.length === 0) {
        continue;
      }

      const tag = item[0];
      let parsedHtml = '';

      switch (tag) {
        case 'table':
          parsedHtml = parseTable(item);
          break;
        case 'code':
          parsedHtml = parseCodeBlock(item);
          break;
        case 'p':
        case 'img':
          parsedHtml = parseParagraph(item);
          break;
        default:
          parsedHtml = parseParagraph(item);
      }

      if (parsedHtml) {
        htmlParts.push(parsedHtml);
      }
    }

    const contentHtml = htmlParts.join('\n');

    return generateHtmlTemplate(docTitle, contentHtml);
  } catch (error) {
    throw new Error(`生成HTML失败: ${error}`);
  }
}

/**
 * 生成 HTML 模板
 */
function generateHtmlTemplate(docTitle: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${docTitle}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 12px; 
                      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; 
                   padding: 2rem; text-align: center; }
        .header h1 { font-size: 2rem; font-weight: 600; margin-bottom: 0.5rem; }
        .content { padding: 2rem 3rem; }
        .content p { margin-bottom: 1rem; font-size: 1rem; line-height: 1.8; }
        .table-container { margin: 1.5rem 0; overflow-x: auto; }
        .doc-table { width: 100%; border-collapse: collapse; margin: 1rem 0; background: white; 
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .doc-table td { border: 1px solid #ddd; padding: 0.75rem; font-size: 0.95rem; }
        .doc-table tr:hover { background-color: #f5f5f5; }
        .image-container { margin: 1.5rem 0; text-align: center; }
        .image-container img { max-width: 100%; height: auto; border-radius: 8px; 
                                box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .code-block { margin: 1.5rem 0; border-radius: 8px; overflow: hidden; background: #282c34; 
                       box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .code-header { background: #21252b; padding: 0.5rem 1rem; display: flex; 
                        justify-content: space-between; align-items: center; }
        .code-language { color: #61dafb; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
        .code-copy { background: #61dafb; color: #282c34; border: none; padding: 0.25rem 0.75rem; 
                      border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
        .code-copy:hover { background: #4fa8c5; }
        .code-block pre { margin: 0; padding: 1rem; overflow-x: auto; background: #282c34; }
        .code-block code { font-family: 'Monaco', 'Menlo', 'Consolas', monospace; font-size: 0.9rem; 
                            line-height: 1.6; color: #abb2bf; display: block; white-space: pre; }
        .footer { text-align: center; padding: 1.5rem; background: #f8f9fa; color: #666; 
                   font-size: 0.85rem; border-top: 1px solid #e9ecef; }
    </style>
    <script>
        function copyCode(button) {
            const codeBlock = button.closest('.code-block');
            const code = codeBlock.querySelector('code').textContent;
            navigator.clipboard.writeText(code).then(() => {
                const originalText = button.textContent;
                button.textContent = '✓ 已复制';
                button.style.background = '#52c41a';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '#61dafb';
                }, 2000);
            });
        }
    </script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${docTitle}</h1>
            <div class="meta">钉钉文档内容解析</div>
        </div>
        <div class="content">
${contentHtml}
        </div>
        <div class="footer">
            由钉钉文档解析MCP服务生成 | Powered by Node.js
        </div>
    </div>
</body>
</html>`;
}

