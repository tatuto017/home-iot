import network
import rp2
import uasyncio
import urequests
from statistics import median
import json
import env
import gc
from microdot import Microdot, Response
from machine import Pin, I2C, reset
from amg88xx import AMG88XX

# LEDのピン
led_pin = Pin("LED", Pin.OUT)

# リレー回路の制御ピンの設定
toggle_pin = Pin(0, Pin.OUT)

# ステーションモードでの接続オブジェクト作成
wlan = network.WLAN(network.STA_IF)

# WiFi地域（日本）の設定
rp2.country("JP")

# ステーションインタフェースの有効化
wlan.active(True)

# WiFiの省電力をオフに設定
wlan.config(pm=0xA11140)

i2c = I2C(0)
sensor = AMG88XX(i2c, 0x68)


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
    urequests.get(f"{env.update_url}?device={env.device}&ipaddr={ipaddress}")


async def check_process():
    while True:
        gc.collect()

        try:
            urequests.get(f"{env.check_url}?device={env.device}")
        except:
            await wifi_connect()

        await uasyncio.sleep(60)


async def run_web_server():
    # サーバー初期化
    app = Microdot()
    Response.default_content_type = "application/json"

    @app.route("/status")
    async def status(request):
        return '{"status":"ok"}'

    @app.route("/data")
    async def data(request):
        gc.collect()
        sensor.refresh()
        sensor_data = [[0 for _ in range(8)] for _ in range(8)]
        for row in range(8):
            for col in range(8):
                sensor_data[row][col] = sensor[row, col]
        data = median(sensor_data[5][1:6])

        return json.dumps({"result": data})

    @app.route("/toggle/<command>")
    async def toggle(request, command):
        if command == "on":
            toggle_pin.on()
        if command == "off":
            toggle_pin.off()

        return '{"status":"ok"}'

    @app.route("/run_check")
    async def runc_check(request):
        # チェックプロセス起動
        uasyncio.create_task(check_process())

        return '{"status":"ok"}'

    # サーバー起動
    app.run(port=80)


async def main():
    # WiFiに接続
    await wifi_connect()

    # チェックプロセス起動
    uasyncio.create_task(check_process())

    # Webサーバー
    await run_web_server()


if __name__ == "__main__":
    uasyncio.run(main())
