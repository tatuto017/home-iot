var global = this;
function doGet(e) {
}
function doPost(e) {
}
"use strict";(()=>{global.doGet=e=>{let t=PropertiesService.getScriptProperties().getProperty("ipaddr"),r=PropertiesService.getScriptProperties().getProperty("port"),s="http://"+t+":"+r+"/iot?cmd="+e.parameter.cmd;return UrlFetchApp.fetch(s),p({status:"success"})};global.doPost=e=>{let t=JSON.parse(e.postData.getDataAsString());return t.hasOwnProperty("encIp")&&i(t),p({status:"success"})};var i=e=>{let t=PropertiesService.getScriptProperties().getProperty("passKey"),r=e.encPass,s=e.encIp,o=cCryptoGS.CryptoJS.AES.decrypt(s,t).toString(cCryptoGS.CryptoJS.enc.Utf8),c=cCryptoGS.CryptoJS.AES.decrypt(r,t).toString(cCryptoGS.CryptoJS.enc.Utf8);PropertiesService.getScriptProperties().getProperty("password")==c&&PropertiesService.getScriptProperties().setProperty("ipaddr",o)},p=e=>{let t=ContentService.createTextOutput();return t.setMimeType(ContentService.MimeType.JSON),t.setContent(JSON.stringify(e)),t};})();
