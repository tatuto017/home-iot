var global = this;

"use strict";var GAS=(()=>{var g=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var y=Object.getOwnPropertyNames;var v=Object.prototype.hasOwnProperty;var f=(e,t)=>{for(var r in t)g(e,r,{get:t[r],enumerable:!0})},C=(e,t,r,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of y(t))!v.call(e,o)&&o!==r&&g(e,o,{get:()=>t[o],enumerable:!(s=P(t,o))||s.enumerable});return e};var U=e=>C(g({},"__esModule",{value:!0}),e);var k={};f(k,{doGet:()=>b,doPost:()=>O,healthCheckGW:()=>_});var c=class{constructor(t,r){this.token=t;this.secret=r;this.api_url="https://api.switch-bot.com/v1.1";this.api_url=""}getSignature(t,r){let s=Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256,this.token+r+t,this.secret);return Utilities.base64Encode(s).toUpperCase()}sendCommand(t,r){let s=Utilities.getUuid(),o=new Date().getTime().toString(),i=this.getSignature(s,o),p={method:"post",headers:{Authorization:this.token,sign:i,t:o,nonce:s,"Content-Type":"application/json"},payload:JSON.stringify(r),muteHttpExceptions:!0},n=UrlFetchApp.fetch(this.api_url+"/devices/"+t+"/commands",p);return n.getResponseCode()===200&&JSON.parse(n.getContentText()).statusCode===100}};var a=class{homeGw(t,r,s){let o=`http://${t}:${r}/iot?${s}`;try{return UrlFetchApp.fetch(o),!0}catch{return!1}}isUpdateIpAddress(t,r,s){let o=JSON.parse(t);if(o.hasOwnProperty("encIp")){let i=o.encPass,p=o.encIp,n=new cCryptoGS.Cipher(r,"aes"),h=n.decrypt(p),m=n.decrypt(i);if(s===m)return h}return null}healthCheckGW(t,r,s,o){let i=`http://${t}:${r}/status?device=iot-gw`;try{UrlFetchApp.fetch(i)}catch{o.sendCommand(s,{command:"turnOff"}),Utilities.sleep(5e3),o.sendCommand(s,{command:"turnOn"})}}};var l=PropertiesService.getScriptProperties().getProperty("ipaddr")||"",S=PropertiesService.getScriptProperties().getProperty("port")||"",w=PropertiesService.getScriptProperties().getProperty("sb_token")||"",A=PropertiesService.getScriptProperties().getProperty("sb_secret")||"",G=new c(w,A),d=new a,b=e=>{let t=e.queryString||"";return d.homeGw(l,S,t)?u({status:"success"}):u({status:"error"})},O=e=>{let t=PropertiesService.getScriptProperties().getProperty("passKey")||"",r=PropertiesService.getScriptProperties().getProperty("password")||"",s=d.isUpdateIpAddress(e.postData.contents,t,r);return s!==null&&PropertiesService.getScriptProperties().setProperty("ipaddr",s),u({status:"success"})},_=()=>{let e=PropertiesService.getScriptProperties().getProperty("deviceId")||"";d.healthCheckGW(l,S,e,G)},u=e=>ContentService.createTextOutput(JSON.stringify(e)).setMimeType(ContentService.MimeType.JSON);return U(k);})();

function doGet(e) {
  return GAS.doGet(e);
}
function doPost(e) {
  return GAS.doPost(e);
}
function healthCheckGW() {
  return GAS.healthCheckGW();
}

