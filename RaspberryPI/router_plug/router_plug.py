import asyncio
import time
from bleak import BleakClient
from pathlib import Path
from dotenv import load_dotenv
import os
import sys

env_path = Path('.') / '.router_plug.env'
load_dotenv(dotenv_path=env_path)

MAC_ADDRESS = os.getenv('MAC_ADDR')

SERVICE_UUID = "cba20d00-224d-11e6-9fb8-0002a5d5c51b"
WRITE_UUID   = "cba20002-224d-11e6-9fb8-0002a5d5c51b"

# Plug Mini 正しいコマンド（公式API準拠）
CMD_ON  = bytearray([0x57, 0x0F, 0x50, 0x01, 0x01, 0x80])  # ON
CMD_OFF = bytearray([0x57, 0x0F, 0x50, 0x01, 0x01, 0x00])  # OFF

async def control_plug(mac: str, turn_on: bool):
    print(f"{mac} に接続中...")
    try:
        async with BleakClient(mac, timeout=15.0) as client:
            if not client.is_connected:
                print("接続失敗")
                return False

            print("接続成功！")

            if WRITE_UUID not in [str(c.uuid) for c in client.services.characteristics.values()]:
                print(f"エラー: {WRITE_UUID} が見つかりません")
                return False

            command = CMD_ON if turn_on else CMD_OFF
            await client.write_gatt_char(WRITE_UUID, command, response=False)
            print(f"{'ON' if turn_on else 'OFF'} コマンド送信完了")

            await asyncio.sleep(2.0)  # 反映に少し時間かかる場合がある
            return True

    except Exception as e:
        print(f"エラー発生: {e}")
        return False


async def main():
    off_status = await control_plug(MAC_ADDRESS, False)
    print("操作結果:", "成功" if off_status else "失敗")

    await asyncio.sleep(5)

    on_status = await control_plug(MAC_ADDRESS, True)
    print("操作結果:", "成功" if on_status else "失敗")

    return off_status and on_status

if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(0 if result else 1)
