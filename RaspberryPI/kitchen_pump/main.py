from machine import Pin, ADC, reset
from microdot import Microdot, Response
import uasyncio
import urequests
import rp2
import network
import gc
import env


# リレー回路の制御ピンの設定
toggle_pin = Pin(0, Pin.OUT)

# センサーピン
adc_pin = ADC(1)

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
    urequests.get(f"{env.update_url}?device={env.device}&ipaddr={ipaddress}")


async def sensor_loop():
    global wlan

    over_count = 0
    # ポンプの作動の閾値
    threshold = 1800

    while True:
        gc.collect()
        sensor_value = adc_pin.read_u16()
        print(sensor_value)

        if wlan.status() != network.STAT_GOT_IP:
            await wifi_connect()

        urequests.get(f"{env.log_url}?device={env.device}&value={sensor_value}")

        if sensor_value < threshold:
            over_count += 1
            if over_count > 10:
                urequests.get(
                    f"{env.trigger_url}?device={env.device}&value={sensor_value}"
                )
                await uasyncio.sleep(60)
        else:
            over_count = 0

        await uasyncio.sleep(1)


async def run_web_server():
    # サーバー初期化
    app = Microdot()
    Response.default_content_type = "application/json"

    @app.route("/status")
    async def status(request):
        return '{"status":"ok"}'

    @app.route("/toggle/<command>")
    async def toggle(request, command):
        if command == "on":
            toggle_pin.on()
        if command == "off":
            toggle_pin.off()

        return '{"status":"ok"}'

    @app.route("/sensor/start")
    async def sensor_start(request):
        # センサー開始
        uasyncio.create_task(sensor_loop())

    # サーバー起動
    app.run(port=80)


async def main():
    # WiFiに接続
    await wifi_connect()

    # センサー開始
    uasyncio.create_task(sensor_loop())

    await run_web_server()


if __name__ == "__main__":
    uasyncio.run(main())
