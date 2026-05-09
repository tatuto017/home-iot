"""Playwright ブラウザドライバの薄いラッパー。RouterNavigator へ DI する。"""

from playwright.sync_api import Browser, Page, Playwright, sync_playwright


class BrowserDriver:
    """Playwright Chromium を管理し、ページオブジェクトを提供する。

    Args:
        headless: ヘッドレスモードで起動するかどうか。デフォルト True。
        timeout: デフォルトのナビゲーションタイムアウト（ミリ秒）。
    """

    def __init__(self, headless: bool = True, timeout: int = 30_000) -> None:
        self._headless = headless
        self._timeout = timeout
        self._playwright: Playwright | None = None
        self._browser: Browser | None = None
        self._page: Page | None = None

    def launch(self) -> None:
        """ブラウザを起動し、新しいページを開く。"""
        self._playwright = sync_playwright().start()
        self._browser = self._playwright.chromium.launch(headless=self._headless)
        self._page = self._browser.new_page()
        self._page.set_default_timeout(self._timeout)

    def close(self) -> None:
        """ブラウザとPlaywrightコンテキストを終了する。"""
        if self._browser:
            self._browser.close()
        if self._playwright:
            self._playwright.stop()

    @property
    def page(self) -> Page:
        """現在のページオブジェクトを返す。launch() 前に呼ぶと RuntimeError。"""
        if self._page is None:
            raise RuntimeError("BrowserDriver.launch() を先に呼んでください。")
        return self._page
