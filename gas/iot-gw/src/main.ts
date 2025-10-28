// @ts-ignore
global.doGet = (e) => {
  const ipaddr = PropertiesService.getScriptProperties().getProperty('ipaddr');
  const port = PropertiesService.getScriptProperties().getProperty('port');
  const url = 'http://' + ipaddr + ':' + port + '/iot?cmd=' + e.parameter.cmd
  UrlFetchApp.fetch(url);

  return response({ "status": "success" });
}

// @ts-ignore
global.doPost = (e) => {
  const json = JSON.parse(e.postData.getDataAsString());
  if (json.hasOwnProperty("encIp")) {
    update_ipaddress(json)
  }

  return response({ "status": "success" });
}

const update_ipaddress = (json: any) => {
  const key = PropertiesService.getScriptProperties().getProperty('passKey');
  const encPass = json.encPass;
  const encIp = json.encIp;
  // @ts-ignore
  const ipaddr = cCryptoGS.CryptoJS.AES.decrypt(encIp, key).toString(cCryptoGS.CryptoJS.enc.Utf8);;
  // @ts-ignore
  const postPass = cCryptoGS.CryptoJS.AES.decrypt(encPass, key).toString(cCryptoGS.CryptoJS.enc.Utf8);
  const password = PropertiesService.getScriptProperties().getProperty('password');

  if (password == postPass) {
    PropertiesService.getScriptProperties().setProperty('ipaddr', ipaddr);
  }
}

const response = (json: any) => {
  let res = ContentService.createTextOutput();
  res.setMimeType(ContentService.MimeType.JSON);
  res.setContent(JSON.stringify(json));

  return res;
}
