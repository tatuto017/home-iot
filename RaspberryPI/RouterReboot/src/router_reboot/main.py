"""エントリーポイント。環境変数を読み込み、処理フロー 1〜3 を実行する。"""

import os
import sys

from dotenv import load_dotenv

from .browser_driver import BrowserDriver
from .router_navigator import RouterNavigator


def main() -> None:
    """ルータ管理画面に接続し、設定管理/再起動画面まで遷移する。"""
    load_dotenv()

    url = os.environ.get("URL")
    loginId = os.environ.get("ID")
    password = os.environ.get("PASSWORD")

    if not url or not loginId or not password:
        print("エラー: 環境変数 URL / ID / PASSWORD が設定されていません。", file=sys.stderr)
        sys.exit(1)

    driver = BrowserDriver(headless=True)
    navigator = RouterNavigator(driver, url, loginId, password)

    driver.launch()
    try:
        # フロー 1: ログイン（スマート引っ越し画面の処理を含む）
        print("ステップ 1: ログイン中...")
        navigator.login()
        print("ステップ 1: ログイン完了")

        # フロー 2: 詳細設定画面へ遷移
        print("ステップ 2: 詳細設定 へ遷移中...")
        navigator.navigateToAdvancedSettings()
        print("ステップ 2: 詳細設定 画面に遷移しました")

        # フロー 3: 管理 → 設定管理/再起動 画面へ遷移
        print("ステップ 3: 管理 → 設定管理/再起動 へ遷移中...")
        navigator.navigateToManagement()
        print("ステップ 3: 設定管理/再起動 画面に遷移しました")

        # フロー 4: 再起動
        print("ステップ 4: 再起動中...")
        navigator.reboot()
        print("ステップ 4: 再起動ボタンを押下しました")

    finally:
        driver.close()


if __name__ == "__main__":
    main()
