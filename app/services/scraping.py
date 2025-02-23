import aiohttp
import asyncio
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Tuple
from app.core.config import get_settings
from urllib.parse import urljoin, urlparse
import logging
from reppy.robots import Robots
import re

settings = get_settings()

class ScrapingService:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        self.session = None
        self.blocked_domains = settings.BLOCKED_DOMAINS
        self.robots_cache = {}  # robots.txtのキャッシュ

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(headers=self.headers)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    def _is_blocked_domain(self, url: str) -> bool:
        """URLが禁止ドメインに含まれているかチェック"""
        domain = urlparse(url).netloc.lower()
        return any(blocked in domain for blocked in self.blocked_domains)

    async def _check_robots_txt(self, url: str) -> bool:
        """robots.txtをチェックしてスクレイピングが許可されているか確認"""
        try:
            parsed_url = urlparse(url)
            base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
            robots_url = urljoin(base_url, "/robots.txt")

            # キャッシュをチェック
            if robots_url in self.robots_cache:
                robots = self.robots_cache[robots_url]
            else:
                async with self.session.get(robots_url) as response:
                    if response.status == 200:
                        robots_content = await response.text()
                        robots = Robots.parse(robots_url, robots_content)
                        self.robots_cache[robots_url] = robots
                    else:
                        return True  # robots.txtが存在しない場合は許可

            return robots.allowed(url, self.headers["User-Agent"])
        except Exception as e:
            logging.error(f"Error checking robots.txt for {url}: {str(e)}")
            return False  # エラーの場合は安全のため拒否

    async def _check_login_required(self, html: str, url: str) -> Tuple[bool, str]:
        """ログインが必要かどうかを確認"""
        # ログインフォームやログイン関連の要素を検出
        login_indicators = [
            r'login',
            r'sign[- ]?in',
            r'log[- ]?in',
            r'ログイン',
            r'サインイン',
            r'会員登録',
            r'アカウント',
        ]
        
        # メタリフレッシュやリダイレクトをチェック
        if re.search(r'<meta[^>]+http-equiv=["\']refresh["\'][^>]*>', html, re.I):
            return True, "リダイレクトが検出されました"

        # ログイン関連の文字列を検索
        for indicator in login_indicators:
            if re.search(indicator, html, re.I):
                return True, "ログインが必要な可能性があります"

        # HTTPステータスコードが401または403の場合
        if any(status in url for status in ['401', '403']):
            return True, "アクセスが拒否されました"

        return False, ""

    async def get_search_results(self, keyword: str) -> List[str]:
        """Google検索結果から上位URLを取得"""
        # 注: 実際の実装ではGoogle検索APIまたは適切なスクレイピング方法を使用する必要があります
        # このサンプルコードは概念実装です
        pass

    async def scrape_page(self, url: str) -> Dict[str, Any]:
        """指定URLのページをスクレイピング"""
        try:
            # 禁止ドメインのチェック
            if self._is_blocked_domain(url):
                logging.warning(f"Blocked domain detected: {url}")
                return {
                    "url": url,
                    "error": "このドメインはスクレイピングが禁止されています",
                    "blocked": True
                }

            # robots.txtのチェック
            if not await self._check_robots_txt(url):
                logging.warning(f"Blocked by robots.txt: {url}")
                return {
                    "url": url,
                    "error": "robots.txtによってアクセスが制限されています",
                    "blocked": True
                }

            async with self.session.get(url) as response:
                if response.status == 200:
                    html = await response.text()

                    # ログイン要求のチェック
                    login_required, reason = await self._check_login_required(html, str(response.url))
                    if login_required:
                        logging.warning(f"Login required: {url} - {reason}")
                        return {
                            "url": url,
                            "error": reason,
                            "blocked": True
                        }

                    soup = BeautifulSoup(html, 'html.parser')
                    
                    return {
                        "url": url,
                        "title": self._extract_title(soup),
                        "meta_description": self._extract_meta_description(soup),
                        "headings": self._extract_headings(soup),
                        "content": self._extract_content(soup),
                        "images": self._extract_images(soup, url),
                        "blocked": False
                    }
                else:
                    logging.error(f"Failed to fetch {url}: {response.status}")
                    return {
                        "url": url,
                        "error": f"ステータスコード {response.status} でアクセスできません",
                        "blocked": True
                    }
        except Exception as e:
            logging.error(f"Error scraping {url}: {str(e)}")
            return {
                "url": url,
                "error": f"スクレイピング中にエラーが発生しました: {str(e)}",
                "blocked": True
            }

    def _extract_title(self, soup: BeautifulSoup) -> str:
        """タイトルタグの抽出"""
        title = soup.title
        return title.string.strip() if title else ""

    def _extract_meta_description(self, soup: BeautifulSoup) -> str:
        """メタディスクリプションの抽出"""
        meta = soup.find("meta", attrs={"name": "description"})
        return meta.get("content", "").strip() if meta else ""

    def _extract_headings(self, soup: BeautifulSoup) -> Dict[str, List[str]]:
        """見出し構造の抽出"""
        headings = {}
        for i in range(1, 7):
            tag = f"h{i}"
            headings[tag] = [h.get_text().strip() for h in soup.find_all(tag)]
        return headings

    def _extract_content(self, soup: BeautifulSoup) -> str:
        """本文コンテンツの抽出"""
        # 不要な要素を削除
        for tag in soup(["script", "style", "nav", "header", "footer"]):
            tag.decompose()
        
        # 本文を抽出
        content = soup.find("main") or soup.find("article") or soup.find("body")
        return content.get_text(" ", strip=True) if content else ""

    def _extract_images(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, str]]:
        """画像情報の抽出"""
        images = []
        for img in soup.find_all("img"):
            src = img.get("src", "")
            if src:
                images.append({
                    "src": urljoin(base_url, src),
                    "alt": img.get("alt", "")
                })
        return images
