#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
钉钉文档 Cookie 自动管理器
使用 Playwright 实现自动登录和 Cookie 管理
"""

import asyncio
import json
from pathlib import Path
from typing import Optional, Dict, List
from datetime import datetime, timedelta
import httpx

# 检查 Playwright 是否可用
try:
    from playwright.async_api import async_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False


class DingTalkCookieManager:
    """钉钉 Cookie 自动管理器"""
    
    def __init__(self, cookie_file: str = "dingtalk_cookies.json"):
        """
        初始化 Cookie 管理器
        
        Args:
            cookie_file: Cookie 保存的文件路径
        """
        self.cookie_file = Path(cookie_file)
        self.cookies: Optional[List[Dict]] = None
        self.cookie_string: Optional[str] = None
    
    async def auto_login(self, headless: bool = False, timeout: int = 300000):
        """
        自动登录钉钉（需要用户手动完成登录）
        
        Args:
            headless: 是否无头模式（False = 显示浏览器界面）
            timeout: 等待登录超时时间（毫秒）
            
        Returns:
            Cookie 字符串
            
        Raises:
            ImportError: 当 Playwright 未安装时
        """
        if not PLAYWRIGHT_AVAILABLE:
            raise ImportError(
                "\n❌ Playwright 未安装\n\n"
                "自动 Cookie 管理功能需要 Playwright 支持。\n\n"
                "安装方法：\n"
                "  pip install playwright\n"
                "  playwright install chromium\n\n"
                "或者使用手动方式获取 Cookie：\n"
                "  1. 浏览器访问 https://alidocs.dingtalk.com\n"
                "  2. F12 开发者工具 → Network → 复制 Cookie\n"
                "  3. 设置环境变量：export DINGTALK_COOKIE=\"your_cookie\"\n"
            )
        
        print("🚀 启动浏览器...")
        
        async with async_playwright() as p:
            # 启动浏览器
            browser = await p.chromium.launch(
                headless=headless,
                args=['--disable-blink-features=AutomationControlled']  # 防止被检测
            )
            
            # 创建上下文（模拟真实浏览器）
            context = await browser.new_context(
                viewport={'width': 1280, 'height': 720},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            page = await context.new_page()
            
            # 访问钉钉文档
            print("📄 正在打开钉钉文档...")
            await page.goto("https://alidocs.dingtalk.com", wait_until="networkidle")
            
            # 等待用户手动登录
            print("\n" + "="*60)
            print("👤 请在浏览器中完成登录操作")
            print("="*60)
            print("\n提示：")
            print("  1. 扫描二维码或输入账号密码登录")
            print("  2. 登录成功后，浏览器会自动关闭")
            print("  3. Cookie 将自动保存到本地\n")
            
            try:
                # 方式1: 等待 URL 变化（登录成功后通常会跳转）
                await page.wait_for_url(
                    "**/alidocs.dingtalk.com/**",
                    timeout=timeout,
                    wait_until="networkidle"
                )
                
                # 额外等待，确保 Cookie 完全生成
                await asyncio.sleep(3)
                
                print("✅ 检测到登录成功！")
                
            except Exception as e:
                print(f"⚠️ 等待超时或登录失败: {str(e)}")
                await browser.close()
                return None
            
            # 获取所有 Cookie
            cookies = await context.cookies()
            
            # 保存 Cookie
            await self._save_cookies(cookies)
            
            await browser.close()
            
            print(f"✅ Cookie 已保存到: {self.cookie_file.absolute()}")
            
            return self.get_cookie_string()
    
    async def _save_cookies(self, cookies: List[Dict]):
        """保存 Cookie 到本地文件（带时间戳）"""
        data = {
            "cookies": cookies,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        with open(self.cookie_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        self.cookies = cookies
    
    def load_cookies(self) -> Optional[List[Dict]]:
        """从本地文件加载 Cookie"""
        if not self.cookie_file.exists():
            return None
        
        try:
            with open(self.cookie_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            self.cookies = data.get('cookies', [])
            return self.cookies
        except Exception as e:
            print(f"⚠️ 加载 Cookie 失败: {str(e)}")
            return None
    
    def get_cookie_string(self) -> Optional[str]:
        """将 Cookie 列表转换为字符串格式"""
        if not self.cookies:
            self.load_cookies()
        
        if not self.cookies:
            return None
        
        # 转换为 "name=value; name2=value2" 格式
        cookie_str = "; ".join([
            f"{cookie['name']}={cookie['value']}"
            for cookie in self.cookies
        ])
        
        self.cookie_string = cookie_str
        return cookie_str
    
    async def is_cookie_valid(self) -> bool:
        """
        检查 Cookie 是否有效
        
        Returns:
            True 表示有效，False 表示无效或过期
        """
        cookie_str = self.get_cookie_string()
        
        if not cookie_str:
            return False
        
        # 检查文件修改时间（超过7天认为可能过期）
        if self.cookie_file.exists():
            file_time = datetime.fromtimestamp(self.cookie_file.stat().st_mtime)
            if datetime.now() - file_time > timedelta(days=7):
                print("⚠️ Cookie 文件已超过 7 天，可能已过期")
                return False
        
        # 发起测试请求验证 Cookie
        try:
            async with httpx.AsyncClient(verify=False, timeout=10) as client:
                response = await client.get(
                    "https://alidocs.dingtalk.com/api/user/info",
                    headers={
                        "cookie": cookie_str,
                        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    }
                )
                
                # 根据响应判断是否有效
                if response.status_code == 200:
                    print("✅ Cookie 验证成功")
                    return True
                elif response.status_code == 401 or response.status_code == 403:
                    print("❌ Cookie 已失效（需要重新登录）")
                    return False
                else:
                    print(f"⚠️ Cookie 验证返回状态码: {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"⚠️ Cookie 验证请求失败: {str(e)}")
            return False
    
    async def get_valid_cookie(self, force_refresh: bool = False) -> str:
        """
        获取有效的 Cookie（自动刷新）
        
        Args:
            force_refresh: 是否强制刷新（重新登录）
            
        Returns:
            有效的 Cookie 字符串
            
        Raises:
            Exception: 当无法获取有效 Cookie 时
        """
        # 1. 如果强制刷新，直接重新登录
        if force_refresh:
            print("🔄 强制刷新 Cookie...")
            return await self.auto_login()
        
        # 2. 尝试加载现有 Cookie
        cookie_str = self.get_cookie_string()
        
        if cookie_str:
            # 3. 验证 Cookie 是否有效
            is_valid = await self.is_cookie_valid()
            
            if is_valid:
                print("✅ 使用已保存的 Cookie")
                return cookie_str
        
        # 4. Cookie 不存在或已失效，重新登录
        print("⚠️ Cookie 不存在或已失效，需要重新登录...")
        cookie_str = await self.auto_login()
        
        if not cookie_str:
            raise Exception("获取 Cookie 失败，请检查登录流程")
        
        return cookie_str
    
    def delete_cookies(self):
        """删除保存的 Cookie"""
        if self.cookie_file.exists():
            self.cookie_file.unlink()
            print("✅ Cookie 已删除")
        else:
            print("⚠️ Cookie 文件不存在")


# ==================== 命令行工具 ====================
async def main():
    """命令行工具入口"""
    import argparse
    
    parser = argparse.ArgumentParser(description="钉钉文档 Cookie 管理工具")
    parser.add_argument(
        "--login",
        action="store_true",
        help="手动登录并保存 Cookie"
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="检查 Cookie 是否有效"
    )
    parser.add_argument(
        "--show",
        action="store_true",
        help="显示保存的 Cookie"
    )
    parser.add_argument(
        "--delete",
        action="store_true",
        help="删除保存的 Cookie"
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        help="使用无头模式（不显示浏览器）"
    )
    
    args = parser.parse_args()
    
    manager = DingTalkCookieManager()
    
    if args.login:
        # 手动登录
        cookie = await manager.auto_login(headless=args.headless)
        if cookie:
            print(f"\n✅ 登录成功！Cookie 长度: {len(cookie)}")
    
    elif args.check:
        # 检查 Cookie 有效性
        is_valid = await manager.is_cookie_valid()
        if is_valid:
            print("✅ Cookie 有效")
        else:
            print("❌ Cookie 无效或已过期")
    
    elif args.show:
        # 显示 Cookie
        cookie_str = manager.get_cookie_string()
        if cookie_str:
            print(f"Cookie: {cookie_str[:100]}...")
            print(f"完整长度: {len(cookie_str)}")
        else:
            print("⚠️ 没有保存的 Cookie")
    
    elif args.delete:
        # 删除 Cookie
        manager.delete_cookies()
    
    else:
        # 默认：获取有效 Cookie（自动刷新）
        try:
            cookie = await manager.get_valid_cookie()
            print(f"\n✅ 获取到有效 Cookie")
            print(f"Cookie 长度: {len(cookie)}")
            print(f"Cookie 预览: {cookie[:100]}...")
        except Exception as e:
            print(f"❌ 获取 Cookie 失败: {str(e)}")


if __name__ == "__main__":
    asyncio.run(main())

