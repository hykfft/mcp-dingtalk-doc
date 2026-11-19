/**
 * 智能 Cookie 管理
 * 自动检测失效并引导用户刷新
 */

import { DingTalkCookieManager } from './cookie-manager.js';
import axios from 'axios';
import https from 'https';

/**
 * 智能获取 Cookie（支持失效检测和自动登录）
 */
export async function getSmartCookie(providedCookie?: string): Promise<string> {
  // 1. 如果提供了 Cookie，先验证它
  if (providedCookie) {
    const isValid = await testCookie(providedCookie);
    if (isValid) {
      return providedCookie;
    }
    console.error('⚠️ 提供的 Cookie 已失效');
  }

  // 2. 尝试从环境变量获取
  if (process.env.DINGTALK_COOKIE) {
    const isValid = await testCookie(process.env.DINGTALK_COOKIE);
    if (isValid) {
      console.error('✅ 使用环境变量 Cookie');
      return process.env.DINGTALK_COOKIE;
    }
    console.error('⚠️ 环境变量中的 Cookie 已失效');
  }

  // 3. 尝试从文件加载
  let savedCookieValid = false;
  try {
    const manager = new DingTalkCookieManager();
    await manager.loadCookies();
    const savedCookie = manager.getCookieString();

    if (savedCookie) {
      const isValid = await testCookie(savedCookie);
      if (isValid) {
        console.error('✅ 使用保存的 Cookie');
        return savedCookie;
      }
      console.error('⚠️ 保存的 Cookie 已失效');
      savedCookieValid = false;
    }
  } catch (error) {
    // 忽略，继续下一步
  }

  // 4. 所有 Cookie 都失效或不存在 → 自动登录
  console.error('\n' + '='.repeat(70));
  console.error('🔐 Cookie 失效，需要重新登录');
  console.error('='.repeat(70));
  console.error('\n浏览器将自动打开，请完成登录...\n');

  try {
    const manager = new DingTalkCookieManager();
    
    // 自动调用登录
    const newCookie = await manager.autoLogin(
      false,  // 不使用 headless，显示浏览器
      300000  // 5 分钟超时
    );

    if (newCookie) {
      console.error('\n✅ 登录成功！继续执行任务...\n');
      return newCookie;
    }

    // 登录失败
    throw new Error('登录失败或超时，请稍后重试');

  } catch (error) {
    // 自动登录失败，抛出错误
    throw new Error(
      '❌ 自动登录失败\n\n' +
        `错误: ${error instanceof Error ? error.message : String(error)}\n\n` +
        '请手动运行以下命令重试：\n' +
        '  npm run cookie:login\n\n' +
        '或手动设置环境变量：\n' +
        '  set DINGTALK_COOKIE=你的Cookie'
    );
  }
}

/**
 * 测试 Cookie 是否有效
 */
async function testCookie(cookie: string): Promise<boolean> {
  try {
    const client = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: 10000,
    });

    // 访问钉钉文档首页
    const response = await client.get('https://alidocs.dingtalk.com', {
      headers: {
        cookie: cookie,
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      validateStatus: () => true,
      maxRedirects: 0,
    });

    const html = typeof response.data === 'string' ? response.data : '';

    // 如果返回登录页，说明 Cookie 无效
    if (
      html.includes('needLogin: true') ||
      html.includes('LOGIN_PAGE_VARS') ||
      response.status === 302 ||
      response.status === 401 ||
      response.status === 403
    ) {
      return false;
    }

    // 其他情况认为有效
    return true;
  } catch (error) {
    // 网络错误，保守认为 Cookie 可能有效
    return true;
  }
}
