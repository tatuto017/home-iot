"""ルータ管理画面のナビゲーションロジック。spec.md の処理フローを実装する。"""

from playwright.sync_api import Page, TimeoutError as PlaywrightTimeoutError

from .browser_driver import BrowserDriver


class RouterNavigator:
    """ルータ管理画面への操作を担当するクラス。

    BrowserDriver を DI で受け取り、spec.md の処理フロー 1〜3 を実行する。

    Args:
        driver: 起動済みの BrowserDriver インスタンス。
        url: ルータ管理画面のログイン URL。
        loginId: ログイン ID。
        password: ログインパスワード。
    """

    # 各ポップアップ画面の確認待ちタイムアウト（短めに設定して存在確認のみ行う）
    _SMART_MOVE_TIMEOUT = 5_000
    _LOGIN_EXCLUDE_TIMEOUT = 5_000

    def __init__(
        self,
        driver: BrowserDriver,
        url: str,
        loginId: str,
        password: str,
    ) -> None:
        self._driver = driver
        self._url = url
        self._loginId = loginId
        self._password = password

    @property
    def _page(self) -> Page:
        """ドライバからページを取得する。"""
        return self._driver.page

    def login(self) -> None:
        """処理フロー 1: ログインページへアクセスし、認証を行う。

        ログイン後に「スマート引っ越し」画面が表示された場合は「続行」を押下する。
        """
        self._page.goto(self._url)

        # ID・パスワードを入力してログイン
        self._page.locator("#form_USERNAME").fill(self._loginId)
        self._page.locator("#form_PASSWORD").fill(self._password)
        self._page.get_by_role("button", name="ログイン").click()

        # スマート引っ越し画面が出た場合のみ「続行」を押下する
        self._handleSmartMoveScreen()

        # 「他のユーザーがログイン中」画面が出た場合は「OK」を押下する
        self._handleLoginExcludeScreen()

    def _handleSmartMoveScreen(self) -> None:
        """スマート引っ越し画面が表示されていれば「続行」ボタンを押下する。

        画面が表示されていない場合は何もしない。
        """
        try:
            continueButton = self._page.locator("#label_button_moveset")
            continueButton.wait_for(
                state="visible", timeout=self._SMART_MOVE_TIMEOUT
            )
            continueButton.click()
        except PlaywrightTimeoutError:
            # スマート引っ越し画面は表示されていないため、そのまま続行
            pass

    def _handleLoginExcludeScreen(self) -> None:
        """「他のユーザーがログイン中です」画面が表示されていれば「OK」ボタンを押下する。

        OK 押下後にログインページへ戻る場合は再ログインを行う。
        画面が表示されていない場合は何もしない。
        """
        try:
            okButton = self._page.get_by_role("button", name="OK")
            okButton.wait_for(
                state="visible", timeout=self._LOGIN_EXCLUDE_TIMEOUT
            )
            okButton.click()
            self._page.wait_for_load_state("networkidle")

            # OK後に login.html へ戻った場合は再ログインする
            if "login" in self._page.url and "loginexclude" not in self._page.url:
                self._page.locator("#form_USERNAME").fill(self._loginId)
                self._page.locator("#form_PASSWORD").fill(self._password)
                self._page.get_by_role("button", name="ログイン").click()
                self._page.wait_for_load_state("networkidle")
        except PlaywrightTimeoutError:
            # 「他のユーザーがログイン中」画面は表示されていないため、そのまま続行
            pass

    def navigateToAdvancedSettings(self) -> None:
        """処理フロー 2: 「詳細設定」画面へ遷移する。

        goAdvanced() は JS ナビゲーションのため #panel_ADVANCED クリックでは
        URL が変わらない。advanced.html へ直接 goto する。
        """
        baseUrl = self._url.rsplit("/", 1)[0]
        self._page.goto(f"{baseUrl}/advanced.html")
        self._page.wait_for_load_state("networkidle")

    def navigateToManagement(self) -> None:
        """処理フロー 3: 「管理」→「設定管理/再起動」画面へ遷移する。

        コンテンツは #content_main iframe 内の save_init.html に読み込まれる。
        """
        # <dt class="ADMIN"> をクリックしてサブメニューを展開する
        self._page.locator("dt.ADMIN").click()

        # <p class="INIT" data-main="save_init.html"> をクリックして遷移する
        self._page.locator("p.INIT").click()
        self._page.wait_for_load_state("networkidle")
        # iframe のコンテンツ読み込みを待つ
        self._page.wait_for_selector("#content_main", state="attached", timeout=10_000)

    def reboot(self) -> None:
        """処理フロー 4: 再起動ボタンを押下する。

        コンテンツは save_init.html の iframe 内にあるため、
        フレームを特定してから input[name="reboot"] をクリックする。
        """
        frame = next(
            (f for f in self._page.frames if "save_init" in f.url), None
        )
        if frame is None:
            raise RuntimeError("再起動ページの iframe が見つかりませんでした。")
        frame.locator("input[name='reboot']").click()
        self._page.wait_for_load_state("networkidle")
