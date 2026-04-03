import { SwitchBot } from "./SwitchBot";

export class IotGw {
  /**
   * 自宅のNode-Redへ中継するGW
   *
   * @param ipaddr IPアドレス
   * @param port ポート
   * @param query クエリー
   * @returns 結果
   */
  public homeGw(ipaddr: string, port: string, query: string): boolean {
    const url = `http://${ipaddr}:${port}/iot?${query}`;

    try {
      UrlFetchApp.fetch(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 自宅のIPアドレスが変更された時に更新する
   *
   * @param jsonData - リクエストのJSON
   * @param passKey 復号化のパスキー
   * @param password パスワード
   * @returns 更新ならIPアドレス、更新不要ならnull
   */
  public isUpdateIpAddress(jsonData: string, passKey: string, password: string) {
    const json = JSON.parse(jsonData);
    if (json.hasOwnProperty("encIp")) {
      const encPass = json.encPass;
      const encIp = json.encIp;
      const cipher = new cCryptoGS.Cipher(passKey, 'aes');
      const ipaddr = cipher.decrypt(encIp);
      const postPass = cipher.decrypt(encPass);

      if (password === postPass) {
        return ipaddr;
      }
    }

    return null;
  }

  /**
  * 自宅のNode-Redのヘルスチェック
  *
  * @param ipaddr IPアドレス
  * @param port ポート
  * @param deviceId デバイスID
  * @param sb SwitchBotクラスのインスタンス
  */
  public healthCheckGW(ipaddr: string, port: string, deviceId: string, sb: SwitchBot) {
    const url = `http://${ipaddr}:${port}/status?device=iot-gw`;
    try {
      UrlFetchApp.fetch(url);
    } catch (error) {
      sb.sendCommand(deviceId, { "command": "turnOff" });
      Utilities.sleep(5000);
      sb.sendCommand(deviceId, { "command": "turnOn" });
    }
  }
}
