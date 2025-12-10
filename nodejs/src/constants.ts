/**
 * 常量定义
 */

export const BASE_URL = 'https://alidocs.dingtalk.com';
export const API_DOCUMENT_DATA = `${BASE_URL}/api/document/data`;

export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export const DEFAULT_TIMEOUT = 30000;

export const COMMON_HEADERS = {
  'accept-encoding': 'gzip, deflate, br, zstd',
  'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
  'user-agent': USER_AGENT,
};

