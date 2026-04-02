var global = this;
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
    doPost: () => doPost,
    healthCheckGW: () => healthCheckGW,
    response: () => response,
    sb: () => sb,
    update_ipaddress: () => update_ipaddress
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

  // src/main.ts
  function doGet(e) {
    const ipaddr = PropertiesService.getScriptProperties().getProperty("ipaddr");
    const port = PropertiesService.getScriptProperties().getProperty("port");
    const query = e.queryString || "";
    const url = `http://${ipaddr}:${port}/iot?${query}`;
    try {
      UrlFetchApp.fetch(url);
      return response({ status: "success" });
    } catch (error) {
      return response({ status: "error" });
    }
  }
  function doPost(e) {
    const json = JSON.parse(e.postData.contents);
    if (json.hasOwnProperty("encIp")) {
      globalThis.update_ipaddress(json);
    }
    return response({ status: "success" });
  }
  function update_ipaddress(json) {
    const key = PropertiesService.getScriptProperties().getProperty("passKey");
    const encPass = json.encPass;
    const encIp = json.encIp;
    if (!key) {
      throw new Error("passKey not found in PropertiesService");
    }
    const cipher = new cCryptoGS.Cipher(key, "aes");
    const ipaddr = cipher.decrypt(encIp);
    const postPass = cipher.decrypt(encPass);
    const password = PropertiesService.getScriptProperties().getProperty("password");
    if (password == postPass) {
      PropertiesService.getScriptProperties().setProperty("ipaddr", ipaddr);
    }
  }
  function healthCheckGW() {
    const ipaddr = PropertiesService.getScriptProperties().getProperty("ipaddr");
    const port = PropertiesService.getScriptProperties().getProperty("port");
    const url = `http://${ipaddr}:${port}/status?device=iot-gw`;
    try {
      UrlFetchApp.fetch(url);
    } catch (error) {
      const deviceId = PropertiesService.getScriptProperties().getProperty("deviceId") || "";
      sb.sendCommand(deviceId, { "command": "turnOff" });
      Utilities.sleep(5e3);
      sb.sendCommand(deviceId, { "command": "turnOn" });
    }
  }
  function response(json) {
    return ContentService.createTextOutput(JSON.stringify(json)).setMimeType(ContentService.MimeType.JSON);
  }
  var token = PropertiesService.getScriptProperties().getProperty("sb_token") || "";
  var secret = PropertiesService.getScriptProperties().getProperty("sb_secret") || "";
  var sb = new SwitchBot(token, secret);
  return __toCommonJS(main_exports);
})();

function doGet(e) {
  return GAS.doGet(e);
}
function doPost(e) {
  return GAS.doPost(e);
}
function healthCheckGW() {
  return GAS.healthCheckGW();
}

