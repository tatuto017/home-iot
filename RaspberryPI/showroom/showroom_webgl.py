from playwright.sync_api import sync_playwright
import datetime  # 追加: タイムスタンプ生成用
import sys

# 対象のSHOWROOMルームURL
url = f"https://www.showroom-live.com/r/{sys.argv[1]}"

# log_dir = ""

kikkake = False


def is_live_delivery():
    # start = time.time()
    try:
        with sync_playwright() as p:
            # WebGL有効化オプション
            browser = p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--ignore-gpu-blocklist",
                    "--enable-gpu",
                    "--enable-webgl",
                    "--enable-webgl2",
                    "--use-gl=osmesa",  # OSMesaソフトウェアレンダリング（必須）
                ],
            )

            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                viewport={"width": 1920, "height": 1080},
                java_script_enabled=True,
                locale="ja-JP",
                extra_http_headers={"Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8"},
            )

            page = context.new_page()

            # ページにアクセス
            page.goto(url, wait_until="domcontentloaded", timeout=60000)

            # ソフトウェアレンダリングは遅いため待機時間を60秒に延長
            page.wait_for_timeout(60000)  # 60秒

            # ライブ中要素待機（日本語優先）
            try:
                page.locator("text=配信中").wait_for(state="visible", timeout=10000)
            except:
                pass

            # 「きっかけ配信」判定
            kikkake_locator = page.locator('img[alt="きっかけ配信"]')
            is_kikkake = kikkake_locator.count() > 0

            # ライブ中確認
            live_locator = page.locator("p.st-roomstart")
            is_live = live_locator.count() > 0

            # スクリーンショットとHTMLを保存
            """
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M")  # 例: 20260212_1809
            screenshot_filename = f"{log_dir}/{sys.argv[1]}_screenshot_{timestamp}.png"
            page.screenshot(path=screenshot_filename, full_page=True)
            with open(f"{log_dir}/{sys.argv[1]}_full_html_{timestamp}.html", "w", encoding="utf-8") as f:
                f.write(page.content())
            """

            browser.close()

            if kikkake:
                return is_live and is_kikkake
            else:
                return is_live

    except Exception as e:
        print(f"エラー: {e}")
        return False


# 実行例
if is_live_delivery():
    sys.exit(0)
else:
    sys.exit(1)
