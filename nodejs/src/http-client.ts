/**
 * HTTP 客户端
 */

import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { BASE_URL, API_DOCUMENT_DATA, USER_AGENT, DEFAULT_TIMEOUT } from './constants.js';

// 创建 axios 实例（禁用 SSL 验证）
const client: AxiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  timeout: DEFAULT_TIMEOUT,
});

/**
 * 通过 GET 请求获取钉钉文档节点数据
 */
export async function fetchNodeByGet(nodeId: string, cookie: string): Promise<string> {
  const url = `${BASE_URL}/i/nodes/${nodeId}`;

  const response = await client.get(url, {
    headers: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'cookie': cookie,
      'user-agent': USER_AGENT,
      'referer': BASE_URL,
    },
    params: {
      rnd: Math.random(),
    },
  });

  return response.data;
}

/**
 * 获取钉钉文档数据（POST 请求）
 */
export async function fetchDocumentData(cookie: string, dentryKey: string): Promise<any> {
  const response = await client.post(
    API_DOCUMENT_DATA,
    { fetchBody: true },
    {
      headers: {
        'a-dentry-key': dentryKey,
        'accept': '*/*',
        'content-type': 'application/json',
        'cookie': cookie,
        'origin': BASE_URL,
        'referer': BASE_URL,
        'user-agent': USER_AGENT,
      },
    }
  );

  return response.data;
}

/**
 * 下载图片
 */
export async function downloadImage(
  url: string,
  cookie: string,
  outputPath: string
): Promise<void> {
  if (!url.startsWith('http')) {
    url = `${BASE_URL}${url}`;
  }

  const response = await client.get(url, {
    headers: {
      'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'referer': `${BASE_URL}/`,
      'cookie': cookie,
      'user-agent': USER_AGENT,
    },
    responseType: 'arraybuffer',
  });

  const fs = await import('fs/promises');
  await fs.writeFile(outputPath, Buffer.from(response.data));
}

