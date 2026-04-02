import { SwitchBot } from "./SwitchBot";

/**
 * 自宅のNode-Redへ中継するGW
 *
 * @param e - リクエスト
 * @returns 結果のJSON
 */
export function doGet(e: GoogleAppsScript.Events.DoGet) {
  const ipaddr = PropertiesService.getScriptProperties().getProperty('ipaddr');
  const port = PropertiesService.getScriptProperties().getProperty('port');

  const query = e.queryString || '';
  const url = `http://${ipaddr}:${port}/iot?${query}`;

  try {
    UrlFetchApp.fetch(url);
    return response({ status: "success" });
  } catch (error) {
    return response({ status: "error" });
  }
}

/**
 * 自宅のIPアドレスが変更された時に更新するGW
 *
 * @param e - リクエスト
 * @returns 結果のJSON
 */
export function doPost(e: GoogleAppsScript.Events.DoPost) {
  const json = JSON.parse(e.postData.contents);
  if (json.hasOwnProperty("encIp")) {
    (globalThis as any).update_ipaddress(json)
  }

  return response({ status: "success" });
}

/**
 * 自宅のIPアドレスが変更された時に更新する
 *
 * @param json - JSON
 */
export function update_ipaddress(json: any) {
  const key = PropertiesService.getScriptProperties().getProperty('passKey');
  const encPass = json.encPass;
  const encIp = json.encIp;

  if (!key) {
    throw new Error("passKey not found in PropertiesService");
  }

  const cipher = new cCryptoGS.Cipher(key, 'aes');
  const ipaddr = cipher.decrypt(encIp);
  const postPass = cipher.decrypt(encPass);
  const password = PropertiesService.getScriptProperties().getProperty('password');

  if (password == postPass) {
    PropertiesService.getScriptProperties().setProperty('ipaddr', ipaddr);
  }
}

export function healthCheckGW() {
  const ipaddr = PropertiesService.getScriptProperties().getProperty('ipaddr');
  const port = PropertiesService.getScriptProperties().getProperty('port');
  const url = `http://${ipaddr}:${port}/status?device=iot-gw`;
  try {
    UrlFetchApp.fetch(url);
  } catch (error) {
    const deviceId = PropertiesService.getScriptProperties().getProperty('deviceId') || '';

    sb.sendCommand(deviceId, { "command": "turnOff" });
    Utilities.sleep(5000);
    sb.sendCommand(deviceId, { "command": "turnOn" });
  }
};

/**
 * JSONレンスポンス用
 *
 * @param json - オブジェクトをJSONに変換して返却
 * @returns JSON
 */
export function response(json: any) {
  return ContentService
    .createTextOutput(JSON.stringify(json))
    .setMimeType(ContentService.MimeType.JSON);
}

const token = PropertiesService.getScriptProperties().getProperty('sb_token') || '';
const secret = PropertiesService.getScriptProperties().getProperty('sb_secret') || '';
export const sb = new SwitchBot(token, secret);
