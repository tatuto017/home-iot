import { SwitchBot } from "./SwitchBot";
import { IotGw } from "./iot-gw";

const url = PropertiesService.getScriptProperties().getProperty('nodered_url') || '';
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

  if (gw.homeGw(url, query)) {
    return response({ status: "success" });
  } else {
    return response({ status: "error" });
  }
}


export const healthCheckGW = () => {
  const deviceId = PropertiesService.getScriptProperties().getProperty('deviceId') || '';
  gw.healthCheckGW(url, deviceId, sb);
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
