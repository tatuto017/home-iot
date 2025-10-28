from machine import Pin, reset
import uasyncio
import network
import rp2
from microdot import Microdot, Response
import requests
import env

# リレー回路の制御ピンの設定
toggle_pin = Pin(0, Pin.OUT)

# LEDのピン
led_pin = Pin("LED", Pin.OUT)

# ステーションモードでの接続オブジェクト作成
wlan = network.WLAN(network.STA_IF)

# WiFi地域（日本）の設定
rp2.country("JP")

# ステーションインタフェースの有効化
wlan.active(True)

# WiFiの省電力をオフに設定
wlan.config(pm=0xA11140)


async def wifi_connect():
    global wlan

    # 接続状態確認
    if not wlan.isconnected():
        # WiFiに接続
        wlan.connect(env.ssid, env.password)

        try:
            # IPアドレス取得待ち
            while wlan.status() != network.STAT_GOT_IP:
                if led_pin.value() == 1:
                    led_pin.off()
                else:
                    led_pin.on()

                if wlan.status() == network.STAT_IDLE:
                    wlan.connect(env.ssid, env.password)

                await uasyncio.sleep(1)

        except KeyboardInterrupt:
            print("「Ctrl + c」キーが押されました。")
            reset()

    # IPアドレス取得
    led_pin.on()
    ipaddress = wlan.ifconfig()[0]
    print(ipaddress)
    requests.get(f"{env.update_url}?device={env.device}&ipaddr={ipaddress}")


async def run_web_server():
    # サーバー初期化
    app = Microdot()
    Response.default_content_type = "application/json"

    @app.route("/status")
    async def status(request):
        return '{"status":"ok"}'

    @app.route("/toggle/on")
    async def toggle_on(request):
        toggle_pin.on()
        return '{"status":"ok"}'

    @app.route("/toggle/off")
    async def toggle_off(request):
        toggle_pin.off()
        return '{"status":"ok"}'

    # サーバー起動
    app.run(port=80)


async def main():
    # WiFiに接続
    await wifi_connect()

    # Webサーバ起動
    await run_web_server()


if __name__ == "__main__":
    uasyncio.run(main())
