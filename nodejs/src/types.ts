/**
 * 类型定义
 */

export interface DocumentResult {
  node_id: string;
  dentry_key: string;
  mainsite_content?: any;
  document_data?: any;
  content?: any;
  html?: string;
  output_dir?: string;
}

export interface DingTalkDocRequest {
  url_or_node_id: string;
  cookie?: string;
  save_files?: boolean;
  output_dir?: string;
}

export interface CookieItem {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
}

export interface CodeLanguageMap {
  [key: string]: string;
}

export const CODE_LANGUAGE_MAP: CodeLanguageMap = {
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
  'text/css': 'css',
};

