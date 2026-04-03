import { SwitchBot } from "./SwitchBot";
import { IotGw } from "./iot-gw";

const ipaddr = PropertiesService.getScriptProperties().getProperty('ipaddr') || '';
const port = PropertiesService.getScriptProperties().getProperty('port') || '';
const token = PropertiesService.getScriptProperties().getProperty('sb_token') || '';
const secret = PropertiesService.getScriptProperties().getProperty('sb_secret') || '';
const sb = new SwitchBot(token, secret);
const gw = new IotGw();

/**
 * 自宅のNode-Redへ中継するGW
 *
 * @param e - リクエスト
 * @returns 結果のJSON
 */
export const doGet = (e: GoogleAppsScript.Events.DoGet) => {
  const query = e.queryString || '';

  if (gw.homeGw(ipaddr, port, query)) {
    return response({ status: "success" });
  } else {
    return response({ status: "error" });
  }
}

/**
 * 自宅のIPアドレスが変更された時に更新するGW
 *
 * @param e - リクエスト
 * @returns 結果のJSON
 */
export const doPost = (e: GoogleAppsScript.Events.DoPost) => {
  const passKey = PropertiesService.getScriptProperties().getProperty('passKey') || '';
  const password = PropertiesService.getScriptProperties().getProperty('password') || '';

  const result = gw.isUpdateIpAddress(e.postData.contents, passKey, password);
  if (result !== null) {
    PropertiesService.getScriptProperties().setProperty('ipaddr', result);
  }

  return response({ status: "success" });
}

export const healthCheckGW = () => {
  const deviceId = PropertiesService.getScriptProperties().getProperty('deviceId') || '';
  gw.healthCheckGW(ipaddr, port, deviceId, sb);
};

/**
 * JSONレンスポンス用
 *
 * @param json - オブジェクトをJSONに変換して返却
 * @returns JSON
 */
const response = (json: any) => {
  return ContentService
    .createTextOutput(JSON.stringify(json))
    .setMimeType(ContentService.MimeType.JSON);
}
