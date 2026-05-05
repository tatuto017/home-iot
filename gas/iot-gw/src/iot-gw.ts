import { SwitchBot } from "./SwitchBot";

export class IotGw {
  /**
   * 自宅のNode-Redへ中継するGW
   *
   * @param url URL
   * @param query クエリー
   * @returns 結果
   */
  public homeGw(url: string, query: string): boolean {
    const nodered_url = `${url}/iot?${query}`;

    try {
      UrlFetchApp.fetch(nodered_url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
  * 自宅のNode-Redのヘルスチェック
  *
  * @param url Node-RedのURL
  * @param deviceId デバイスID
  * @param sb SwitchBotクラスのインスタンス
  */
  public healthCheckGW(url: string, deviceId: string, sb: SwitchBot) {
    try {
      UrlFetchApp.fetch(`${url}/status?device=iot-gw`);
    } catch (error) {
      sb.sendCommand(deviceId, { "command": "turnOff" });
      Utilities.sleep(5000);
      sb.sendCommand(deviceId, { "command": "turnOn" });
    }
  }
}
