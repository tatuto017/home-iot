from playwright.sync_api import sync_playwright
import datetime  # 追加: タイムスタンプ生成用
import sys

# 対象のSHOWROOMルームURL
url = f"https://www.showroom-live.com/r/{sys.argv[1]}"

LINE_NORMAL  = 0
LIVE_KIKKAKE = 1
LIVE_NONE    = 2


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
                ]
            )
            
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                viewport={"width": 1920, "height": 1080},
                java_script_enabled=True,
                locale="ja-JP",
                extra_http_headers={
                    "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8"
                }
            )
            
            page = context.new_page()
            
            # ページにアクセス
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=60000)
            except Exception as e:
                if "ERR_INTERNET_DISCONNECTED" in str(e) or "ERR_NAME_NOT_RESOLVED" in str(e):
                    return LIVE_NONE
            
            # ソフトウェアレンダリングは遅いため待機時間を60秒に延長
            page.wait_for_timeout(60000)  # 60秒
            
            # ライブ中要素待機（日本語優先）
            try:
                page.locator('text=配信中').wait_for(state="visible", timeout=10000)
            except:
                pass

            # 「きっかけ配信」判定
            is_kikkake = False
            type_label_div = page.locator('div.room-live-type-label')
            if type_label_div.count() > 0:
                kikkake_locator = page.locator('img[alt="きっかけ配信"]')
                is_kikkake = kikkake_locator.count() > 0

            # ライブ中確認
            live_locator = page.locator('p.st-roomstart')
            is_live = live_locator.count() > 0
            
            # スクリーンショットとHTMLを保存
            if is_live:
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M")  # 例: 20260212_1809
                screenshot_filename = f"log/{sys.argv[1]}_screenshot_{timestamp}.png"            
                page.screenshot(path=screenshot_filename, full_page=True)
                with open(f"log/{sys.argv[1]}_full_html_{timestamp}.html", "w", encoding="utf-8") as f:
                    f.write(page.content())
            
            browser.close()

            if is_kikkake:
                # きっかけ配信
                return LIVE_KIKKAKE
            elif is_live:
                # 通常配信
                return LINE_NORMAL
            else:
                # 配信していない
                return LIVE_NONE
    
    except KeyboardInterrupt:
        print("\n\nユーザーが中断しました。")
        return LIVE_NONE
    except PlaywrightTimeout:
        print("タイムアウトしました。待機時間を短くするか、ネットワークを確認してください。")
        return LIVE_NONE
    except Exception as e:
        print(f"エラー: {e}")
        return LIVE_NONE

# 実行例
sys.exit(is_live_delivery())
