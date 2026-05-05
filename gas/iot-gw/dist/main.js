var global = this;

"use strict";
var GAS = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/main.ts
  var main_exports = {};
  __export(main_exports, {
    doGet: () => doGet,
    healthCheckGW: () => healthCheckGW
  });

  // src/SwitchBot.ts
  var SwitchBot = class {
    constructor(token2, secret2) {
      this.token = token2;
      this.secret = secret2;
      this.api_url = "https://api.switch-bot.com/v1.1";
      this.api_url = "";
    }
    getSignature(nonce, timestamp) {
      const signature = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, this.token + timestamp + nonce, this.secret);
      return Utilities.base64Encode(signature).toUpperCase();
    }
    sendCommand(deviceId, json) {
      const nonce = Utilities.getUuid();
      const timestamp = (/* @__PURE__ */ new Date()).getTime().toString();
      const signature = this.getSignature(nonce, timestamp);
      const options = {
        "method": "post",
        "headers": {
          "Authorization": this.token,
          "sign": signature,
          "t": timestamp,
          "nonce": nonce,
          "Content-Type": "application/json"
        },
        "payload": JSON.stringify(json),
        "muteHttpExceptions": true
      };
      const response2 = UrlFetchApp.fetch(this.api_url + "/devices/" + deviceId + "/commands", options);
      if (response2.getResponseCode() === 200) {
        const responseJson = JSON.parse(response2.getContentText());
        if (responseJson.statusCode === 100) {
          return true;
        }
      }
      return false;
    }
  };

  // src/iot-gw.ts
  var IotGw = class {
    /**
     * 自宅のNode-Redへ中継するGW
     *
     * @param url URL
     * @param query クエリー
     * @returns 結果
     */
    homeGw(url2, query) {
      const nodered_url = `${url2}/iot?${query}`;
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
    healthCheckGW(url2, deviceId, sb2) {
      try {
        UrlFetchApp.fetch(`${url2}/status?device=iot-gw`);
      } catch (error) {
        sb2.sendCommand(deviceId, { "command": "turnOff" });
        Utilities.sleep(5e3);
        sb2.sendCommand(deviceId, { "command": "turnOn" });
      }
    }
  };

  // src/main.ts
  var url = PropertiesService.getScriptProperties().getProperty("nodered_url") || "";
  var token = PropertiesService.getScriptProperties().getProperty("sb_token") || "";
  var secret = PropertiesService.getScriptProperties().getProperty("sb_secret") || "";
  var sb = new SwitchBot(token, secret);
  var gw = new IotGw();
  var doGet = (e) => {
    const query = e.queryString || "";
    if (gw.homeGw(url, query)) {
      return response({ status: "success" });
    } else {
      return response({ status: "error" });
    }
  };
  var healthCheckGW = () => {
    const deviceId = PropertiesService.getScriptProperties().getProperty("deviceId") || "";
    gw.healthCheckGW(url, deviceId, sb);
  };
  var response = (json) => {
    return ContentService.createTextOutput(JSON.stringify(json)).setMimeType(ContentService.MimeType.JSON);
  };
  return __toCommonJS(main_exports);
})();

function doGet(e) {
  return GAS.doGet(e);
}
function healthCheckGW() {
  return GAS.healthCheckGW();
}

