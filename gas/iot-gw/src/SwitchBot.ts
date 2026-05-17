export class SwitchBot {
  readonly api_url: string = 'https://api.switch-bot.com/v1.1';

  constructor(private token: string, private secret: string) {
  }

  private getSignature(nonce: string, timestamp: string): string {
    const signature = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, this.token + timestamp + nonce, this.secret);
    return Utilities.base64Encode(signature).toUpperCase();
  }

  public sendCommand(deviceId: string, json: any): boolean {
    const nonce = Utilities.getUuid();
    const timestamp = (new Date()).getTime().toString();
    const signature = this.getSignature(nonce, timestamp);
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions & { method: GoogleAppsScript.URL_Fetch.HttpMethod } = {
      'method': 'post',
      'headers': {
        'Authorization': this.token,
        'sign': signature,
        't': timestamp,
        'nonce': nonce,
        'Content-Type': 'application/json',
      },
      'payload': JSON.stringify(json),
      'muteHttpExceptions': true,
    };

    const response = UrlFetchApp.fetch(this.api_url + '/devices/' + deviceId + '/commands', options);
    if (response.getResponseCode() === 200) {
      const responseJson = JSON.parse(response.getContentText());
      if (responseJson.statusCode === 100) {
        return true;
      }
    }

    return false;
  }
};
