/**
 * Cookie 自动管理器
 * 使用 Playwright 实现自动登录和 Cookie 管理
 */

import axios from 'axios';
import * as fs from 'fs/promises';
import https from 'https';
import * as path from 'path';

// 检查 Playwright 是否可用
let playwright: any = null;
let PLAYWRIGHT_AVAILABLE = false;

try {
  playwright = await import('playwright');
  PLAYWRIGHT_AVAILABLE = true;
} catch {
  PLAYWRIGHT_AVAILABLE = false;
}

interface CookieData {
  cookies: any[];
  cookie_string: string;
  timestamp: string;
  mode: string;
}

export class DingTalkCookieManager {
  private cookieFile: string;
  private cookies: any[] | null = null;
  private cookieString: string | null = null;

  constructor(cookieFile: string = 'dingtalk_cookies.json') {
    this.cookieFile = cookieFile;
  }

  /**
   * 智能获取 Cookie（先验证现有 Cookie，失败则弹窗登录）
   * @param testDocUrl 用于验证 Cookie 的测试文档 URL（可选）
   */
  async autoLogin(headless: boolean = false, timeout: number = 300000, testDocUrl?: string): Promise<string | null> {
    if (!PLAYWRIGHT_AVAILABLE) {
      throw new Error(
        '\n❌ Playwright 未安装\n\n' +
        '自动 Cookie 管理功能需要 Playwright 支持。\n\n' +
        '安装方法：\n' +
        '  npm install playwright\n' +
        '  npx playwright install chromium\n\n' +
        '或者使用手动方式获取 Cookie：\n' +
        '  1. 浏览器访问 https://alidocs.dingtalk.com\n' +
        '  2. F12 开发者工具 → Network → 复制 Cookie\n' +
        '  3. 设置环境变量：export DINGTALK_COOKIE="your_cookie"\n'
      );
    }

    // 第一步：检查是否有保存的 Cookie
    console.log('🔍 检查现有 Cookie...');
    await this.loadCookies();
    const existingCookie = this.getCookieString();

    if (existingCookie) {
      console.log(`✅ 找到保存的 Cookie (${existingCookie.length} 字符)`);

      // 第二步：用 HTTP request 验证 Cookie 是否有效
      console.log('🔍 验证 Cookie 有效性...');
      const isValid = await this.testCookieWithRequest(existingCookie, testDocUrl);

      if (isValid) {
        console.log('✅ Cookie 有效，无需重新登录');
        return existingCookie;
      }

      console.log('⚠️  Cookie 已过期或无效');
    } else {
      console.log('⚠️  没有找到保存的 Cookie');
    }

    // 第三步：需要登录，打开可见浏览器
    console.log('\n' + '='.repeat(70));
    console.log('🌐 正在打开浏览器，请完成登录操作');
    console.log('='.repeat(70));

    console.log();
    console.log('📝 操作步骤：');
    console.log('  1. 浏览器将自动打开钉钉文档页面');
    console.log('  2. 请扫码或输入账号密码登录');
    console.log('  3. 登录成功后，随便打开一个文档验证能否访问');
    console.log('  4. 确认能看到文档内容后，【手动关闭浏览器窗口】');
    console.log('  5. 浏览器关闭后，Cookie 将自动保存');
    console.log();
    console.log('⚠️  重要：请务必手动关闭浏览器，不要在控制台按 Ctrl+C');
    console.log('='.repeat(70));
    console.log();

    const browser = await playwright.chromium.launch({
      headless: false,  // 强制可见模式
      args: [
        '--disable-blink-features=AutomationControlled',
        '--start-maximized',
      ],
    });

    try {
      // 创建上下文（模拟真实浏览器）
      const context = await browser.newContext({
        viewport: null,  // 使用最大化窗口
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      const page = await context.newPage();

      // 访问钉钉文档
      console.log('📄 正在打开钉钉文档页面...');

      // 如果有测试文档 URL，直接打开；否则打开首页
      const targetUrl = testDocUrl || 'https://alidocs.dingtalk.com';
      await page.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      console.log('✅ 页面已打开');
      console.log();
      console.log('⏳ 等待您完成登录...');
      console.log();
      console.log('💡 完成登录后有两种方式继续：');
      console.log('   方式1: 关闭浏览器窗口（推荐）');
      console.log('   方式2: 在此控制台按 Enter 键');
      console.log();

      // 定期获取 Cookie，直到浏览器关闭或用户按 Enter
      let latestCookies: any[] = [];
      let browserClosed = false;
      let userPressedEnter = false;

      // 监听浏览器关闭事件
      browser.on('disconnected', () => {
        console.log('   [检测到浏览器断开连接]');
        browserClosed = true;
      });

      // 监听页面关闭事件
      page.on('close', () => {
        console.log('   [检测到页面关闭]');
        browserClosed = true;
      });

      // 监听用户输入 Enter
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.on('line', () => {
        console.log('   [检测到 Enter 键]');
        userPressedEnter = true;
        rl.close();
      });

      // 定期获取 Cookie（每 2 秒一次）
      const cookieInterval = setInterval(async () => {
        try {
          if (!browserClosed && !userPressedEnter) {
            latestCookies = await context.cookies();
          }
        } catch (error) {
          // 忽略错误，可能是浏览器正在关闭
          browserClosed = true;
        }
      }, 2000);

      // 定期检查浏览器状态
      const checkInterval = setInterval(async () => {
        try {
          // 尝试获取 Cookie 来检查浏览器是否还活着
          if (!browserClosed && !userPressedEnter) {
            await context.cookies();
          }
        } catch (error) {
          console.log('   [检测到浏览器无法访问]');
          browserClosed = true;
        }
      }, 1000);

      // 等待浏览器关闭或用户按 Enter
      await new Promise<void>((resolve) => {
        const waitInterval = setInterval(() => {
          if (browserClosed || userPressedEnter) {
            clearInterval(waitInterval);
            clearInterval(cookieInterval);
            clearInterval(checkInterval);
            rl.close();
            resolve();
          }
        }, 100);
      });

      console.log('\n✅ 继续执行...');

      // 使用最后获取的 Cookie
      console.log('🔍 正在保存 Cookie...');
      const cookies = latestCookies;

      // 保存 Cookie
      await this.saveCookies(cookies);

      console.log(`✅ Cookie 已保存到: ${path.resolve(this.cookieFile)}`);

      return this.getCookieString();
    } finally {
      await browser.close();
    }
  }

  /**
   * 保存 Cookie 到本地文件
   */
  private async saveCookies(cookies: any[]): Promise<void> {
    const data: CookieData = {
      cookies,
      cookie_string: cookies.map((c) => `${c.name}=${c.value}`).join('; '),
      timestamp: new Date().toISOString(),
      mode: 'auto_login',
    };

    await fs.writeFile(this.cookieFile, JSON.stringify(data, null, 2), 'utf-8');

    this.cookies = cookies;
    this.cookieString = data.cookie_string;
  }

  /**
   * 从本地文件加载 Cookie
   */
  async loadCookies(): Promise<any[] | null> {
    try {
      const content = await fs.readFile(this.cookieFile, 'utf-8');
      const data: CookieData = JSON.parse(content);
      this.cookies = data.cookies;
      this.cookieString = data.cookie_string;
      return this.cookies;
    } catch {
      return null;
    }
  }

  /**
   * 获取 Cookie 字符串
   */
  getCookieString(): string | null {
    if (!this.cookieString && this.cookies) {
      this.cookieString = this.cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    }
    return this.cookieString;
  }

  /**
   * 检查 Cookie 是否有效
   */
  async isCookieValid(): Promise<boolean> {
    const cookieStr = this.getCookieString();

    if (!cookieStr) {
      return false;
    }

    // 检查文件修改时间（超过7天认为可能过期）
    try {
      const stats = await fs.stat(this.cookieFile);
      const fileTime = stats.mtime;
      const now = new Date();
      const daysDiff = (now.getTime() - fileTime.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff > 7) {
        console.log('⚠️ Cookie 文件已超过 7 天，可能已过期');
        return false;
      }
    } catch {
      // 文件不存在
      return false;
    }

    // 发起测试请求验证 Cookie
    try {
      const client = axios.create({
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        timeout: 10000,
      });

      const response = await client.get('https://alidocs.dingtalk.com/api/user/info', {
        headers: {
          cookie: cookieStr,
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        validateStatus: () => true,
      });

      if (response.status === 200) {
        console.log('✅ Cookie 验证成功');
        return true;
      } else if (response.status === 401 || response.status === 403) {
        console.log('❌ Cookie 已失效（需要重新登录）');
        return false;
      } else {
        console.log(`⚠️ Cookie 验证返回状态码: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log(`⚠️ Cookie 验证请求失败: ${error}`);
      return false;
    }
  }

  /**
   * 获取有效的 Cookie（自动刷新）
   */
  async getValidCookie(forceRefresh: boolean = false): Promise<string> {
    // 1. 如果强制刷新，直接重新登录
    if (forceRefresh) {
      console.log('🔄 强制刷新 Cookie...');
      const cookie = await this.autoLogin();
      if (!cookie) {
        throw new Error('获取 Cookie 失败，请检查登录流程');
      }
      return cookie;
    }

    // 2. 尝试加载现有 Cookie
    await this.loadCookies();
    const cookieStr = this.getCookieString();

    if (cookieStr) {
      // 3. 验证 Cookie 是否有效
      const isValid = await this.isCookieValid();

      if (isValid) {
        console.log('✅ 使用已保存的 Cookie');
        return cookieStr;
      }
    }

    // 4. Cookie 不存在或已失效，重新登录
    console.log('⚠️ Cookie 不存在或已失效，需要重新登录...');
    const cookie = await this.autoLogin();

    if (!cookie) {
      throw new Error('获取 Cookie 失败，请检查登录流程');
    }

    return cookie;
  }

  /**
   * 删除保存的 Cookie
   */
  async deleteCookies(): Promise<void> {
    try {
      await fs.unlink(this.cookieFile);
      console.log('✅ Cookie 已删除');
    } catch {
      console.log('⚠️ Cookie 文件不存在');
    }
  }

  /**
   * 用 HTTP request 测试 Cookie 是否有效
   * @param cookie Cookie 字符串
   * @param testUrl 测试文档 URL（可选）
   */
  private async testCookieWithRequest(cookie: string, testUrl?: string): Promise<boolean> {
    try {
      const client = axios.create({
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        timeout: 15000,
      });

      // 如果提供了测试 URL，尝试访问该文档
      const targetUrl = testUrl || 'https://alidocs.dingtalk.com';

      const response = await client.get(targetUrl, {
        headers: {
          cookie: cookie,
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        validateStatus: () => true,  // 接受所有状态码
        maxRedirects: 0,  // 不自动跟随重定向
      });

      // 检查响应
      const html = response.data;

      // 如果包含登录相关内容，说明 Cookie 无效
      if (
        html.includes('needLogin: true') ||
        html.includes('LOGIN_PAGE_VARS') ||
        html.includes('身份认证') ||
        response.status === 302 ||  // 重定向
        response.status === 401 ||  // 未授权
        response.status === 403     // 禁止访问
      ) {
        console.log(`   HTTP 验证失败（状态码: ${response.status}）`);
        return false;
      }

      // 如果能获取到文档内容，说明 Cookie 有效
      if (html.includes('mainsite_server_content') || html.includes('dentryInfo')) {
        console.log('   HTTP 验证成功，可以访问文档');
        return true;
      }

      // 其他情况，保守认为可能有效（可能只是首页）
      if (response.status === 200 && html.length > 1000) {
        console.log('   HTTP 请求成功，Cookie 可能有效');
        return true;
      }

      console.log('   无法确定 Cookie 有效性');
      return false;

    } catch (error) {
      console.log(`   HTTP 验证出错: ${error}`);
      return false;
    }
  }


  /**
   * 检查 Playwright 是否可用
   */
  static isPlaywrightAvailable(): boolean {
    return PLAYWRIGHT_AVAILABLE;
  }
}

// ==================== 命令行工具 ====================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || '--help';

  const manager = new DingTalkCookieManager();

  switch (command) {
    case '--login':
      {
        const headless = args.includes('--headless');
        console.log('🚀 开始登录流程...\n');
        const cookie = await manager.autoLogin(headless);
        if (cookie) {
          console.log(`\n✅ 登录成功！Cookie 长度: ${cookie.length}`);
          console.log(`Cookie 预览: ${cookie.substring(0, 100)}...`);
        } else {
          console.log('\n❌ 登录失败');
          process.exit(1);
        }
      }
      break;

    case '--check':
      {
        console.log('🔍 检查 Cookie 有效性...\n');
        await manager.loadCookies();
        const isValid = await manager.isCookieValid();
        if (isValid) {
          console.log('\n✅ Cookie 有效');
          process.exit(0);
        } else {
          console.log('\n❌ Cookie 无效或已过期');
          process.exit(1);
        }
      }
      break;

    case '--show':
      {
        await manager.loadCookies();
        const cookie = manager.getCookieString();
        if (cookie) {
          console.log(`Cookie: ${cookie.substring(0, 100)}...`);
          console.log(`完整长度: ${cookie.length}`);
        } else {
          console.log('⚠️ 没有保存的 Cookie');
        }
      }
      break;

    case '--delete':
      await manager.deleteCookies();
      break;

    case '--auto':
      {
        console.log('🚀 自动获取有效 Cookie...\n');
        try {
          const cookie = await manager.getValidCookie();
          console.log(`\n✅ 获取到有效 Cookie`);
          console.log(`Cookie 长度: ${cookie.length}`);
          console.log(`Cookie 预览: ${cookie.substring(0, 100)}...`);
        } catch (error) {
          console.log(`\n❌ 获取 Cookie 失败: ${error}`);
          process.exit(1);
        }
      }
      break;

    case '--help':
    default:
      console.log('钉钉文档 Cookie 管理工具\n');
      console.log('用法：');
      console.log('  tsx src/cookie-manager.ts [命令]\n');
      console.log('命令：');
      console.log('  --login      手动登录并保存 Cookie');
      console.log('  --login --headless  无头模式登录（需要提前配置）');
      console.log('  --check      检查 Cookie 是否有效');
      console.log('  --show       显示保存的 Cookie');
      console.log('  --delete     删除保存的 Cookie');
      console.log('  --auto       自动获取有效 Cookie（推荐）');
      console.log('  --help       显示此帮助信息\n');
      console.log('示例：');
      console.log('  npm run cookie:login   # 自动登录');
      console.log('  npm run cookie:check   # 检查 Cookie');
      break;
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  });
}

