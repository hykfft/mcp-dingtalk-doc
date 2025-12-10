#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
钉钉文档解析 MCP 服务器
提供钉钉文档内容提取、解析和HTML生成功能
"""

from typing import Annotated, Optional, Dict, Any, List
import os
import json
import asyncio
import re
import html as html_module
import random
import urllib3
from pathlib import Path
from dataclasses import dataclass

import httpx
from mcp.shared.exceptions import McpError
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    ErrorData,
    GetPromptResult,
    Prompt,
    PromptArgument,
    PromptMessage,
    TextContent,
    Tool,
    INVALID_PARAMS,
    INTERNAL_ERROR,
)
from pydantic import BaseModel, Field
from bs4 import BeautifulSoup
import hashlib
import mimetypes

# 禁用SSL警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ==================== 常量定义 ====================
BASE_URL = "https://alidocs.dingtalk.com"
API_DOCUMENT_DATA = f"{BASE_URL}/api/document/data"
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
DEFAULT_TIMEOUT = 30.0

# HTTP请求通用Headers
COMMON_HEADERS = {
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    "user-agent": USER_AGENT,
}

# 代码语言映射
CODE_LANGUAGE_MAP = {
    'text/x-java': 'java',
    'text/x-python': 'python',
    'text/x-javascript': 'javascript',
    'text/x-go': 'go',
    'text/x-c++': 'cpp',
    'text/x-sql': 'sql',
    'text/x-sh': 'bash',
    'text/plain': 'text',
    'application/json': 'json',
    'text/html': 'html',
    'text/css': 'css'
}

# 从环境变量获取钉钉Cookie
DINGTALK_COOKIE = os.getenv("DINGTALK_COOKIE")


# ==================== 数据模型 ====================
@dataclass
class DocumentResult:
    """文档解析结果"""
    node_id: str
    dentry_key: str
    mainsite_content: Optional[Dict[str, Any]] = None
    document_data: Optional[Dict[str, Any]] = None
    content: Optional[Dict[str, Any]] = None
    html: Optional[str] = None
    output_dir: Optional[str] = None


class DingTalkDocRequest(BaseModel):
    """钉钉文档请求参数"""
    url_or_node_id: Annotated[
        str,
        Field(description="钉钉文档的完整URL或NODE_ID")
    ]
    cookie: Annotated[
        Optional[str],
        Field(description="钉钉登录Cookie（可选，未提供则使用环境变量）", default=None)
    ]
    save_files: Annotated[
        Optional[bool],
        Field(description="是否保存中间文件", default=True)
    ]
    output_dir: Annotated[
        Optional[str],
        Field(description="输出目录路径（可选）", default=None)
    ]


class DingTalkDocParseRequest(BaseModel):
    """钉钉文档解析参数（仅生成HTML）"""
    url_or_node_id: Annotated[
        str,
        Field(description="钉钉文档的完整URL或NODE_ID")
    ]
    cookie: Annotated[
        Optional[str],
        Field(description="钉钉登录Cookie（可选，未提供则使用环境变量）", default=None)
    ]


# ==================== 工具函数 ====================
def check_cookie(cookie: Optional[str] = None) -> str:
    """
    检查并返回有效的Cookie
    
    Args:
        cookie: 可选的Cookie字符串，如果未提供则使用环境变量
        
    Returns:
        有效的Cookie字符串
        
    Raises:
        McpError: 当Cookie不存在时
    """
    final_cookie = cookie or DINGTALK_COOKIE
    if not final_cookie:
        raise McpError(ErrorData(
            code=INTERNAL_ERROR,
            message="缺少钉钉Cookie。请通过参数传递或设置环境变量 DINGTALK_COOKIE"
        ))
    return final_cookie


def extract_node_id_from_url(url_or_node_id: str) -> str:
    """
    从完整URL中提取node_id，如果已经是node_id则直接返回
    
    Args:
        url_or_node_id: 钉钉文档的完整URL或NODE_ID
        
    Returns:
        提取的node_id
        
    Raises:
        ValueError: 当无法从URL中提取node_id时
    """
    if url_or_node_id.startswith('http'):
        match = re.search(r'/i/nodes/([^?/]+)', url_or_node_id)
        if match:
            return match.group(1)
        raise ValueError(f"无法从URL中提取node_id: {url_or_node_id}")
    return url_or_node_id


# ==================== HTTP请求函数 ====================
async def fetch_node_by_get(node_id: str, cookie: str) -> str:
    """
    通过GET请求获取钉钉文档节点数据
    
    Args:
        node_id: 文档节点ID
        cookie: 钉钉登录Cookie
        
    Returns:
        HTML响应文本
        
    Raises:
        McpError: 当HTTP请求失败时
    """
    url = f"{BASE_URL}/i/nodes/{node_id}"
    
    headers = {
        **COMMON_HEADERS,
        "authority": "alidocs.dingtalk.com",
        "method": "GET",
        "scheme": "https",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "cookie": cookie,
    }
    
    async with httpx.AsyncClient(verify=False, timeout=DEFAULT_TIMEOUT) as client:
        try:
            response = await client.get(url, headers=headers, params={"rnd": random.random()})
            response.raise_for_status()
            return response.text
        except httpx.HTTPError as e:
            raise McpError(ErrorData(
                code=INTERNAL_ERROR,
                message=f"GET请求失败: {str(e)}"
            ))


async def fetch_document_data(cookie: str, dentry_key: str) -> Dict[str, Any]:
    """
    获取钉钉文档数据（POST请求）
    
    Args:
        cookie: 钉钉登录Cookie
        dentry_key: 文档entry key
        
    Returns:
        文档数据字典
        
    Raises:
        McpError: 当HTTP请求失败时
    """
    headers = {
        **COMMON_HEADERS,
        "authority": "alidocs.dingtalk.com",
        "a-dentry-key": dentry_key,
        "accept": "*/*",
        "content-type": "application/json",
        "cookie": cookie,
        "origin": BASE_URL,
    }
    
    payload = {"fetchBody": True}
    
    async with httpx.AsyncClient(verify=False, timeout=DEFAULT_TIMEOUT) as client:
        try:
            response = await client.post(API_DOCUMENT_DATA, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise McpError(ErrorData(
                code=INTERNAL_ERROR,
                message=f"POST请求失败: {str(e)}"
            ))


async def download_image(url: str, cookie: str, output_dir: Path) -> Optional[str]:
    """
    下载图片并保存到本地
    
    Args:
        url: 图片URL
        cookie: 钉钉登录Cookie
        output_dir: 输出目录路径
        
    Returns:
        本地图片路径（相对于HTML文件的路径），如果下载失败则返回None
    """
    if not url:
        return None
    
    # 确保图片目录存在
    images_dir = output_dir / "images"
    images_dir.mkdir(exist_ok=True)
    
    try:
        # 构建完整的URL
        original_url = url
        if not url.startswith('http'):
            url = f'{BASE_URL}{url}'
        
        # 生成文件名（使用原始URL的hash值，确保一致性）
        url_hash = hashlib.md5(original_url.encode()).hexdigest()
        
        # 下载图片
        headers = {
            **COMMON_HEADERS,
            "authority": "alidocs.dingtalk.com",
            "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "referer": f"{BASE_URL}/",
            "cookie": cookie,
        }
        
        async with httpx.AsyncClient(
            verify=False, 
            timeout=DEFAULT_TIMEOUT,
            follow_redirects=True  # 明确启用重定向跟随
        ) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            
            # 从响应头获取Content-Type来确定文件扩展名
            ext = None
            content_type = response.headers.get('content-type', '')
            if content_type:
                ext = mimetypes.guess_extension(content_type.split(';')[0].strip())
            
            # 如果无法从Content-Type获取，尝试从最终URL获取
            if not ext:
                final_url = str(response.url)  # 获取重定向后的最终URL
                parsed_url = final_url.split('?')[0]  # 移除查询参数
                ext = mimetypes.guess_extension(mimetypes.guess_type(parsed_url)[0] or 'image/jpeg')
            
            # 如果还是无法确定，使用默认扩展名
            if not ext:
                ext = '.jpg'
            
            filename = f"{url_hash}{ext}"
            file_path = images_dir / filename
            
            # 如果文件已存在，直接返回路径
            if file_path.exists():
                return f"images/{filename}"
            
            # 保存图片
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            return f"images/{filename}"
            
    except Exception as e:
        # 下载失败时返回None，使用原始URL
        print(f"下载图片失败 {url}: {str(e)}")
        return None


# ==================== 数据提取函数 ====================
def extract_mainsite_content(html: str) -> Dict[str, Any]:
    """
    从HTML中提取mainsite_server_content的JSON数据
    
    Args:
        html: HTML页面内容
        
    Returns:
        解析后的JSON数据字典
        
    Raises:
        McpError: 当无法找到或解析JSON数据时
    """
    soup = BeautifulSoup(html, 'html.parser')
    script = soup.find('script', {'id': 'mainsite_server_content'})
    
    if not script or not script.string:
        raise McpError(ErrorData(
            code=INTERNAL_ERROR,
            message="未找到mainsite_server_content"
        ))
    
    try:
        return json.loads(script.string.strip())
    except json.JSONDecodeError as e:
        raise McpError(ErrorData(
            code=INTERNAL_ERROR,
            message=f"JSON解析失败: {str(e)}"
        ))


def extract_document_content(document_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    从document_data中提取文档内容
    
    Args:
        document_data: 文档数据字典
        
    Returns:
        文档内容字典，如果无法提取则返回None
    """
    if not document_data:
        return None
    
    try:
        # 方式1: 直接从JSON中获取content
        content_str = document_data['data']['documentContent']['checkpoint']['content']
        return json.loads(content_str)
    except (KeyError, json.JSONDecodeError):
        # 方式2: OSS加密存储（暂不支持完整解密）
        return None


def extract_dentry_key(mainsite_content: Dict[str, Any]) -> str:
    """
    从mainsite_content中提取dentryKey
    
    Args:
        mainsite_content: mainsite内容字典
        
    Returns:
        dentryKey字符串
        
    Raises:
        McpError: 当无法找到dentryKey时
    """
    # 尝试从dentryInfo中获取
    if 'dentryInfo' in mainsite_content and 'data' in mainsite_content['dentryInfo']:
        dentry_key = mainsite_content['dentryInfo']['data'].get('dentryKey')
        if dentry_key:
            return dentry_key
    
    # 尝试从data中获取nodeId
    dentry_key = mainsite_content.get('data', {}).get('nodeId')
    if dentry_key:
        return dentry_key
    
    raise McpError(ErrorData(
        code=INTERNAL_ERROR,
        message="未找到dentryKey或nodeId"
    ))


# ==================== HTML解析函数 ====================
def parse_code_block(code_elem: List[Any]) -> str:
    """
    解析代码块元素
    
    Args:
        code_elem: 代码块元素列表
        
    Returns:
        HTML格式的代码块字符串
    """
    if not isinstance(code_elem, list) or len(code_elem) < 2 or code_elem[0] != 'code':
        return ''
    
    attrs = code_elem[1] if len(code_elem) > 1 else {}
    syntax = attrs.get('syntax', 'text/plain')
    code = attrs.get('code', '')
    
    if not code:
        return ''
    
    # 获取语言标识
    language = CODE_LANGUAGE_MAP.get(syntax, syntax.replace('text/x-', '').replace('text/', ''))
    code_escaped = html_module.escape(code)
    
    return f'''<div class="code-block">
    <div class="code-header">
        <span class="code-language">{language}</span>
        <button class="code-copy" onclick="copyCode(this)" title="复制代码">📋 复制</button>
    </div>
    <pre><code class="language-{language}">{code_escaped}</code></pre>
</div>'''


def parse_text_style(style_obj: Dict[str, Any]) -> str:
    """
    解析文本样式
    
    Args:
        style_obj: 样式对象字典
        
    Returns:
        CSS样式字符串
    """
    styles = []
    if style_obj.get('bold'):
        styles.append('font-weight: bold')
    if style_obj.get('color'):
        styles.append(f'color: {style_obj["color"]}')
    if style_obj.get('sz') and style_obj.get('szUnit'):
        styles.append(f'font-size: {style_obj["sz"]}{style_obj["szUnit"]}')
    return '; '.join(styles) if styles else ''


def parse_span(span_elem: List[Any]) -> str:
    """
    解析span元素
    
    Args:
        span_elem: span元素列表
        
    Returns:
        HTML格式的span字符串
    """
    if not isinstance(span_elem, list) or len(span_elem) < 2 or span_elem[0] != 'span':
        return ''
    
    attrs = span_elem[1] if len(span_elem) > 1 else {}
    html_parts = []
    
    for i in range(2, len(span_elem)):
        child = span_elem[i]
        if isinstance(child, str):
            text = child.replace('\n', '<br>')
            if text:
                style = parse_text_style(attrs)
                html_parts.append(f'<span style="{style}">{text}</span>' if style else text)
        elif isinstance(child, list):
            html_parts.append(parse_span(child))
    
    return ''.join(html_parts)


def collect_image_urls(content: Dict[str, Any]) -> set:
    """
    收集文档中所有图片URL
    
    Args:
        content: 文档内容字典
        
    Returns:
        图片URL集合
    """
    image_urls = set()
    
    def _traverse(elem):
        if isinstance(elem, list) and len(elem) > 0:
            if elem[0] == 'img' and len(elem) > 1:
                attrs = elem[1] if isinstance(elem[1], dict) else {}
                src = attrs.get('src', '')
                if src:
                    # 构建完整URL
                    if not src.startswith('http'):
                        src = f'{BASE_URL}{src}'
                    image_urls.add(src)
            else:
                # 递归遍历子元素
                for item in elem:
                    _traverse(item)
        elif isinstance(elem, dict):
            for value in elem.values():
                _traverse(value)
    
    if content:
        main_key = content.get('main')
        if main_key:
            parts = content.get('parts', {})
            main_part = parts.get(main_key, {})
            data = main_part.get('data', {})
            body = data.get('body', [])
            _traverse(body)
    
    return image_urls


def parse_image(img_elem: List[Any], image_url_map: Optional[Dict[str, str]] = None) -> str:
    """
    解析图片元素
    
    Args:
        img_elem: 图片元素列表
        image_url_map: 图片URL到本地路径的映射
        
    Returns:
        HTML格式的图片字符串
    """
    if not isinstance(img_elem, list) or len(img_elem) < 2 or img_elem[0] != 'img':
        return ''
    
    attrs = img_elem[1] if len(img_elem) > 1 else {}
    src = attrs.get('src', '')
    name = attrs.get('name', '图片')
    width = attrs.get('width', 'auto')
    
    if not src:
        return f'<p style="color: #999;">[图片: {name}]</p>'
    
    # 构建完整URL用于查找映射
    original_src = src
    if not src.startswith('http'):
        full_url = f'{BASE_URL}{src}'
    else:
        full_url = src
    
    # 如果有映射，使用本地路径
    if image_url_map and full_url in image_url_map:
        src = image_url_map[full_url]
    else:
        # 如果没有映射，说明图片下载失败或未下载
        # 使用原始URL（可能需要Cookie，浏览器可能无法显示）
        if not src.startswith('http'):
            src = f'{BASE_URL}{original_src}'
        # 如果下载失败且有映射表（说明尝试过下载），显示提示
        if image_url_map is not None:
            return f'<div class="image-container"><p style="color: #999; padding: 1rem; border: 1px dashed #ddd; border-radius: 4px;">[图片下载失败: {name}]<br><small>原始链接: <a href="{src}" target="_blank">{src[:50]}...</a></small></p></div>'
    
    return f'<div class="image-container"><img src="{src}" alt="{name}" style="max-width: {width}px; height: auto;" loading="lazy" /></div>'


def parse_paragraph(para_elem: List[Any], image_url_map: Optional[Dict[str, str]] = None) -> str:
    """
    解析段落元素
    
    Args:
        para_elem: 段落元素列表
        image_url_map: 图片URL到本地路径的映射
        
    Returns:
        HTML格式的段落字符串
    """
    if not isinstance(para_elem, list) or len(para_elem) < 2:
        return ''
    
    tag = para_elem[0]
    
    if tag == 'p':
        content_parts = []
        for i in range(2, len(para_elem)):
            child = para_elem[i]
            if isinstance(child, list) and len(child) > 0:
                if child[0] == 'img':
                    content_parts.append(parse_image(child, image_url_map))
                else:
                    content_parts.append(parse_span(child))
            elif isinstance(child, str):
                content_parts.append(child)
        
        paragraph_html = ''.join(content_parts)
        if not paragraph_html.strip():
            paragraph_html = '&nbsp;'
        
        return f'<p>{paragraph_html}</p>'
    
    if tag == 'img':
        return parse_image(para_elem, image_url_map)
    
    return ''


def parse_table(table_elem: List[Any]) -> str:
    """
    解析表格元素
    
    Args:
        table_elem: 表格元素列表
        
    Returns:
        HTML格式的表格字符串
    """
    if not isinstance(table_elem, list) or len(table_elem) < 2 or table_elem[0] != 'table':
        return ''
    
    rows_html = []
    for i in range(2, len(table_elem)):
        child = table_elem[i]
        if isinstance(child, list) and len(child) > 0 and child[0] == 'tr':
            row_html = parse_table_row(child)
            if row_html:
                rows_html.append(row_html)
    
    if not rows_html:
        return ''
    
    return f'''<div class="table-container">
    <table class="doc-table">
        {''.join(rows_html)}
    </table>
</div>'''


def parse_table_row(tr_elem: List[Any]) -> str:
    """
    解析表格行
    
    Args:
        tr_elem: 表格行元素列表
        
    Returns:
        HTML格式的表格行字符串
    """
    if not isinstance(tr_elem, list) or len(tr_elem) < 2 or tr_elem[0] != 'tr':
        return ''
    
    cells_html = []
    for i in range(2, len(tr_elem)):
        child = tr_elem[i]
        if isinstance(child, list) and len(child) > 0 and child[0] == 'tc':
            cell_html = parse_table_cell(child)
            if cell_html:
                cells_html.append(cell_html)
    
    if not cells_html:
        return ''
    
    return f'<tr>{"".join(cells_html)}</tr>'


def parse_table_cell(tc_elem: List[Any]) -> str:
    """
    解析表格单元格
    
    Args:
        tc_elem: 表格单元格元素列表
        
    Returns:
        HTML格式的表格单元格字符串
    """
    if not isinstance(tc_elem, list) or len(tc_elem) < 2 or tc_elem[0] != 'tc':
        return ''
    
    attrs = tc_elem[1] if len(tc_elem) > 1 else {}
    row_span = attrs.get('rowSpan', 1)
    col_span = attrs.get('colSpan', 1)
    fill = attrs.get('fill', '')
    v_align = attrs.get('vAlign', 'top')
    
    styles = []
    if fill:
        styles.append(f'background-color: {fill}')
    if v_align:
        styles.append(f'vertical-align: {v_align}')
    
    style_str = f' style="{"; ".join(styles)}"' if styles else ''
    
    content_parts = []
    for i in range(2, len(tc_elem)):
        child = tc_elem[i]
        if isinstance(child, list) and len(child) > 0 and child[0] == 'p':
            p_content = []
            for j in range(2, len(child)):
                p_child = child[j]
                if isinstance(p_child, list):
                    p_content.append(parse_span(p_child))
                elif isinstance(p_child, str):
                    p_content.append(p_child)
            content_parts.append(''.join(p_content))
    
    cell_content = '<br>'.join(content_parts) if content_parts else '&nbsp;'
    
    rowspan_attr = f' rowspan="{row_span}"' if row_span > 1 else ''
    colspan_attr = f' colspan="{col_span}"' if col_span > 1 else ''
    
    return f'<td{rowspan_attr}{colspan_attr}{style_str}>{cell_content}</td>'


# ==================== HTML生成函数 ====================
def generate_html_from_content(
    content: Dict[str, Any], 
    doc_title: str = "钉钉文档",
    image_url_map: Optional[Dict[str, str]] = None
) -> Optional[str]:
    """
    从content生成HTML
    
    Args:
        content: 文档内容字典
        doc_title: 文档标题
        image_url_map: 图片URL到本地路径的映射
        
    Returns:
        HTML字符串，如果无法生成则返回None
        
    Raises:
        McpError: 当生成HTML失败时
    """
    if not content:
        return None
    
    try:
        main_key = content.get('main')
        if not main_key:
            return None
        
        parts = content.get('parts', {})
        main_part = parts.get(main_key, {})
        data = main_part.get('data', {})
        body = data.get('body', [])
        
        html_parts = []
        for item in body[2:]:
            if not isinstance(item, list) or len(item) == 0:
                continue
            
            tag = item[0]
            # 根据标签类型选择解析函数
            parser_map = {
                'table': parse_table,
                'code': parse_code_block,
                'p': lambda x: parse_paragraph(x, image_url_map),
                'img': lambda x: parse_image(x, image_url_map),
            }
            
            parser = parser_map.get(tag, lambda x: parse_paragraph(x, image_url_map))
            parsed_html = parser(item)
            if parsed_html:
                html_parts.append(parsed_html)
        
        content_html = '\n'.join(html_parts)
        
        html_template = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{doc_title}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }}
        .container {{ max-width: 900px; margin: 0 auto; background: white; border-radius: 12px; 
                      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; 
                   padding: 2rem; text-align: center; }}
        .header h1 {{ font-size: 2rem; font-weight: 600; margin-bottom: 0.5rem; }}
        .content {{ padding: 2rem 3rem; }}
        .content p {{ margin-bottom: 1rem; font-size: 1rem; line-height: 1.8; }}
        .table-container {{ margin: 1.5rem 0; overflow-x: auto; }}
        .doc-table {{ width: 100%; border-collapse: collapse; margin: 1rem 0; background: white; 
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        .doc-table td {{ border: 1px solid #ddd; padding: 0.75rem; font-size: 0.95rem; }}
        .doc-table tr:hover {{ background-color: #f5f5f5; }}
        .image-container {{ margin: 1.5rem 0; text-align: center; }}
        .image-container img {{ max-width: 100%; height: auto; border-radius: 8px; 
                                box-shadow: 0 4px 12px rgba(0,0,0,0.15); }}
        .code-block {{ margin: 1.5rem 0; border-radius: 8px; overflow: hidden; background: #282c34; 
                       box-shadow: 0 4px 12px rgba(0,0,0,0.15); }}
        .code-header {{ background: #21252b; padding: 0.5rem 1rem; display: flex; 
                        justify-content: space-between; align-items: center; }}
        .code-language {{ color: #61dafb; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }}
        .code-copy {{ background: #61dafb; color: #282c34; border: none; padding: 0.25rem 0.75rem; 
                      border-radius: 4px; cursor: pointer; font-size: 0.85rem; }}
        .code-copy:hover {{ background: #4fa8c5; }}
        .code-block pre {{ margin: 0; padding: 1rem; overflow-x: auto; background: #282c34; }}
        .code-block code {{ font-family: 'Monaco', 'Menlo', 'Consolas', monospace; font-size: 0.9rem; 
                            line-height: 1.6; color: #abb2bf; display: block; white-space: pre; }}
        .footer {{ text-align: center; padding: 1.5rem; background: #f8f9fa; color: #666; 
                   font-size: 0.85rem; border-top: 1px solid #e9ecef; }}
    </style>
    <script>
        function copyCode(button) {{
            const codeBlock = button.closest('.code-block');
            const code = codeBlock.querySelector('code').textContent;
            navigator.clipboard.writeText(code).then(() => {{
                const originalText = button.textContent;
                button.textContent = '✓ 已复制';
                button.style.background = '#52c41a';
                setTimeout(() => {{
                    button.textContent = originalText;
                    button.style.background = '#61dafb';
                }}, 2000);
            }});
        }}
    </script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{doc_title}</h1>
            <div class="meta">钉钉文档内容解析</div>
        </div>
        <div class="content">
{content_html}
        </div>
        <div class="footer">
            由钉钉文档解析MCP服务生成 | Powered by Python
        </div>
    </div>
</body>
</html>"""
        
        return html_template
        
    except Exception as e:
        raise McpError(ErrorData(
            code=INTERNAL_ERROR,
            message=f"生成HTML失败: {str(e)}"
        ))


# ==================== 主流程函数 ====================
def _sanitize_filename(filename: str) -> str:
    """
    清理文件名，移除非法字符
    
    Args:
        filename: 原始文件名
        
    Returns:
        清理后的文件名
    """
    # 移除或替换文件系统中的非法字符
    illegal_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
    for char in illegal_chars:
        filename = filename.replace(char, '_')
    # 移除 .adoc 后缀（不区分大小写）
    if filename.lower().endswith('.adoc'):
        filename = filename[:-5]
    # 移除首尾空格和点
    filename = filename.strip(' .')
    # 如果为空，使用默认名称
    if not filename:
        filename = '未命名文档'
    # 限制文件名长度
    if len(filename) > 200:
        filename = filename[:200]
    return filename


def _get_document_title_from_mainsite(mainsite_content: Dict[str, Any]) -> str:
    """
    从mainsite_content中提取文档标题
    
    Args:
        mainsite_content: mainsite内容字典
        
    Returns:
        文档标题，如果无法获取则返回默认值
    """
    try:
        if 'dentryInfo' in mainsite_content and 'data' in mainsite_content['dentryInfo']:
            title = mainsite_content['dentryInfo']['data'].get('name')
            if title:
                return title
    except (KeyError, TypeError):
        pass
    return '钉钉文档'


def _save_json_file(output_dir: Path, filename: str, data: Dict[str, Any]) -> None:
    """保存JSON文件"""
    file_path = output_dir / filename
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _save_html_file(output_dir: Path, filename: str, content: str) -> None:
    """保存HTML文件"""
    file_path = output_dir / filename
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)


async def get_complete_document_data(
    url_or_node_id: str,
    cookie: str,
    save_files: bool = True,
    output_dir: Optional[str] = None
) -> DocumentResult:
    """
    完整获取钉钉文档数据的流程
    
    Args:
        url_or_node_id: 钉钉文档URL或NODE_ID
        cookie: 钉钉登录Cookie
        save_files: 是否保存中间文件
        output_dir: 输出目录路径
        
    Returns:
        DocumentResult对象，包含解析结果
        
    Raises:
        McpError: 当解析过程中出现错误时
    """
    node_id = extract_node_id_from_url(url_or_node_id)
    
    # 步骤1: GET请求获取HTML
    html = await fetch_node_by_get(node_id, cookie)
    
    # 步骤2: 提取JSON
    mainsite_content = extract_mainsite_content(html)
    
    # 步骤2.5: 从mainsite_content中提取文档标题
    doc_title = _get_document_title_from_mainsite(mainsite_content)
    
    # 步骤2.6: 如果保存文件，创建以标题命名的文件夹
    if save_files:
        # 清理标题作为文件夹名
        folder_name = _sanitize_filename(doc_title)
        
        # 确定基础输出目录
        if not output_dir:
            # 默认输出目录为 ~/Documents/cursor-mcp/dingDoc
            base_dir = os.path.expanduser("~/Documents/cursor-mcp/dingDoc")
        else:
            base_dir = output_dir
        
        # 创建以文档标题命名的文件夹
        output_path = Path(base_dir) / folder_name
        output_path.mkdir(parents=True, exist_ok=True)
    else:
        output_path = None
    
    if save_files and output_path:
        _save_json_file(output_path, f'{node_id}_mainsite.json', mainsite_content)
    
    # 步骤3: 提取dentryKey
    dentry_key = extract_dentry_key(mainsite_content)
    
    # 步骤4: POST请求获取文档数据
    document_data = await fetch_document_data(cookie, dentry_key)
    
    if save_files and output_path:
        _save_json_file(output_path, f'{node_id}_document.json', document_data)
    
    # 步骤5: 提取内容
    content = extract_document_content(document_data)
    
    html_content = None
    image_url_map = None
    if content:
        if save_files and output_path:
            _save_json_file(output_path, f'{node_id}_content.json', content)
        
        # 步骤5.5: 收集并下载所有图片
        if save_files and output_path:
            image_urls = collect_image_urls(content)
            if image_urls:
                image_url_map = {}
                # 批量下载图片
                download_tasks = [
                    download_image(url, cookie, output_path) 
                    for url in image_urls
                ]
                results = await asyncio.gather(*download_tasks, return_exceptions=True)
                
                # 构建URL到本地路径的映射
                for url, result in zip(image_urls, results):
                    if result and not isinstance(result, Exception):
                        image_url_map[url] = result
        
        # 步骤6: 生成HTML（使用从mainsite中获取的标题）
        html_content = generate_html_from_content(content, doc_title, image_url_map)
        
        if save_files and html_content and output_path:
            _save_html_file(output_path, f'{node_id}.html', html_content)
    
    return DocumentResult(
        node_id=node_id,
        dentry_key=dentry_key,
        mainsite_content=mainsite_content,
        document_data=document_data,
        content=content,
        html=html_content,
        output_dir=str(output_path) if output_path else None
    )


async def serve() -> None:
    """运行钉钉文档解析MCP服务器"""
    server = Server("mcp-dingtalk-doc")
    
    @server.list_tools()
    async def list_tools() -> list[Tool]:
        return [
            Tool(
                name="parse_document",
                description="解析钉钉文档，提取内容并生成HTML文件",
                inputSchema=DingTalkDocRequest.model_json_schema(),
            ),
            Tool(
                name="get_html",
                description="快速获取钉钉文档的HTML内容（不保存文件）",
                inputSchema=DingTalkDocParseRequest.model_json_schema(),
            )
        ]
    
    @server.list_prompts()
    async def list_prompts() -> list[Prompt]:
        return [
            Prompt(
                name="parse_document",
                description="解析钉钉文档并生成HTML",
                arguments=[
                    PromptArgument(
                        name="url_or_node_id",
                        description="钉钉文档URL或NODE_ID",
                        required=True
                    ),
                    PromptArgument(
                        name="cookie",
                        description="钉钉Cookie（可选）",
                        required=False
                    )
                ],
            )
        ]
    
    @server.call_tool()
    async def call_tool(name: str, arguments: dict) -> list[TextContent]:
        if name == "parse_document":
            try:
                args = DingTalkDocRequest(**arguments)
            except ValueError as e:
                raise McpError(ErrorData(code=INVALID_PARAMS, message=str(e)))
            
            cookie = check_cookie(args.cookie)
            
            try:
                result = await get_complete_document_data(
                    args.url_or_node_id,
                    cookie,
                    args.save_files,
                    args.output_dir
                )
                
                output = [f"✅ 钉钉文档解析成功！"]
                output.append(f"\n📌 节点ID: {result.node_id}")
                output.append(f"🔑 Dentry Key: {result.dentry_key}")
                
                if result.document_data:
                    doc_info = result.document_data.get('data', {}).get('fileMetaInfo', {})
                    output.append(f"📄 文档名称: {doc_info.get('name', '未知')}")
                    output.append(f"📝 文档类型: {doc_info.get('type', '未知')}")
                
                if result.content:
                    output.append(f"\n✅ 内容提取成功")
                    parts_count = len(result.content.get('parts', {}))
                    output.append(f"   - Parts数量: {parts_count}")
                
                if result.html:
                    output.append(f"\n✅ HTML生成成功")
                
                if result.output_dir:
                    output.append(f"\n📁 输出目录: {result.output_dir}")
                    output.append(f"   - {result.node_id}_mainsite.json")
                    output.append(f"   - {result.node_id}_document.json")
                    if result.content:
                        output.append(f"   - {result.node_id}_content.json")
                    if result.html:
                        output.append(f"   - {result.node_id}.html")
                
                return [TextContent(type="text", text="\n".join(output))]
                
            except McpError:
                raise
            except Exception as e:
                raise McpError(ErrorData(
                    code=INTERNAL_ERROR,
                    message=f"文档解析失败: {str(e)}"
                ))
        
        elif name == "get_html":
            try:
                args = DingTalkDocParseRequest(**arguments)
            except ValueError as e:
                raise McpError(ErrorData(code=INVALID_PARAMS, message=str(e)))
            
            cookie = check_cookie(args.cookie)
            
            try:
                result = await get_complete_document_data(
                    args.url_or_node_id,
                    cookie,
                    save_files=False
                )
                
                if result.html:
                    doc_name = result.document_data.get('data', {}).get('fileMetaInfo', {}).get('name', '未知') if result.document_data else '未知'
                    output = [f"✅ HTML生成成功\n"]
                    output.append(f"文档: {doc_name}\n")
                    output.append("--- HTML 内容 ---\n")
                    output.append(result.html)
                    return [TextContent(type="text", text="\n".join(output))]
                else:
                    return [TextContent(type="text", text="⚠️ 无法提取文档内容（可能是OSS加密）")]
                    
            except McpError:
                raise
            except Exception as e:
                raise McpError(ErrorData(
                    code=INTERNAL_ERROR,
                    message=f"文档解析失败: {str(e)}"
                ))
        
        else:
            raise McpError(ErrorData(
                code=INVALID_PARAMS,
                message=f"未知工具: {name}"
            ))
    
    @server.get_prompt()
    async def get_prompt(name: str, arguments: dict | None) -> GetPromptResult:
        if not arguments or "url_or_node_id" not in arguments:
            raise McpError(ErrorData(
                code=INVALID_PARAMS,
                message="必须提供url_or_node_id参数"
            ))
        
        url_or_node_id = arguments["url_or_node_id"]
        cookie = check_cookie(arguments.get("cookie"))
        
        try:
            result = await get_complete_document_data(url_or_node_id, cookie, save_files=False)
            
            output = [f"✅ 钉钉文档解析成功"]
            output.append(f"\n节点ID: {result.node_id}")
            
            if result.document_data:
                doc_info = result.document_data.get('data', {}).get('fileMetaInfo', {})
                output.append(f"文档名称: {doc_info.get('name', '未知')}")
            
            if result.html:
                output.append(f"\nHTML已生成")
            
            return GetPromptResult(
                description="钉钉文档解析结果",
                messages=[
                    PromptMessage(
                        role="user",
                        content=TextContent(type="text", text="\n".join(output))
                    )
                ]
            )
            
        except McpError as e:
            return GetPromptResult(
                description="解析失败",
                messages=[
                    PromptMessage(
                        role="user",
                        content=TextContent(type="text", text=f"错误: {e.error.message}")
                    )
                ]
            )
    
    options = server.create_initialization_options()
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, options, raise_exceptions=True)


def main():
    """主入口函数"""
    asyncio.run(serve())


if __name__ == "__main__":
    main()

