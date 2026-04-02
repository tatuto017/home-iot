import { SwitchBot } from "./SwitchBot";

describe('SwitchBot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('constructor', () => {
    const sb = new SwitchBot('token', 'secret');
    expect((sb as any).token).toBe('token');
    expect((sb as any).secret).toBe('secret');
  });

  test('getSignature', () => {
    const sb = new SwitchBot('token', 'secret');

    // モックの返却値をセット
    (Utilities.computeHmacSignature as jest.Mock).mockReturnValue('signature');
    (Utilities.base64Encode as jest.Mock).mockReturnValue('signature');

    // 実行
    expect((sb as any).getSignature('nonce', 'timestamp')).toBe('SIGNATURE');

    // モックの引数を確認
    expect(Utilities.computeHmacSignature).toHaveBeenCalledWith(Utilities.MacAlgorithm.HMAC_SHA_256, 'token' + 'timestamp' + 'nonce', 'secret');
    expect(Utilities.base64Encode).toHaveBeenCalledWith('signature');
  });

  test('sendCommand', () => {
    const sb = new SwitchBot('token', 'secret');
    const mDate = new Date();

    // モックの返却値をセット
    (Utilities.getUuid as jest.Mock).mockReturnValue('uuid');
    jest.spyOn(global, 'Date').mockReturnValue(mDate);
    const mSignature = jest.spyOn(sb as any, 'getSignature').mockReturnValue('signature');
    (Utilities.computeHmacSignature as jest.Mock).mockReturnValue('signature');
    (UrlFetchApp.fetch as jest.Mock).mockReturnValue({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ statusCode: 100 })
    });

    // モックの引数
    const json = { "command": "turnOn" };
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions & { method: GoogleAppsScript.URL_Fetch.HttpMethod } = {
      'method': 'post',
      'headers': {
        'Authorization': 'token',
        'sign': 'signature',
        't': mDate.getTime().toString(),
        'nonce': 'uuid',
        'Content-Type': 'application/json',
      },
      'payload': JSON.stringify(json),
      'muteHttpExceptions': true,
    };

    // 実行
    expect(sb.sendCommand('deviceId', json)).toBe(true);

    // getSignatureの引数確認
    expect(mSignature).toHaveBeenCalledWith('uuid', mDate.getTime().toString());
    // 想定したURLでリクエストされているか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(sb.api_url + '/devices/deviceId/commands', options);
  });

  test('sendCommand API Status FAIL', () => {
    const sb = new SwitchBot('token', 'secret');
    const mDate = new Date();

    // モックの返却値をセット
    (Utilities.getUuid as jest.Mock).mockReturnValue('uuid');
    jest.spyOn(global, 'Date').mockReturnValue(mDate);
    const mSignature = jest.spyOn(sb as any, 'getSignature').mockReturnValue('signature');
    (Utilities.computeHmacSignature as jest.Mock).mockReturnValue('signature');
    (UrlFetchApp.fetch as jest.Mock).mockReturnValue({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ statusCode: 190 })
    });

    // モックの引数
    const json = { "command": "turnOn" };
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions & { method: GoogleAppsScript.URL_Fetch.HttpMethod } = {
      'method': 'post',
      'headers': {
        'Authorization': 'token',
        'sign': 'signature',
        't': mDate.getTime().toString(),
        'nonce': 'uuid',
        'Content-Type': 'application/json',
      },
      'payload': JSON.stringify(json),
      'muteHttpExceptions': true,
    };

    // 実行
    expect(sb.sendCommand('deviceId', json)).toBe(false);

    // getSignatureの引数確認
    expect(mSignature).toHaveBeenCalledWith('uuid', mDate.getTime().toString());
    // 想定したURLでリクエストされているか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(sb.api_url + '/devices/deviceId/commands', options);
  });

  test('sendCommand Http Status FAIL', () => {
    const sb = new SwitchBot('token', 'secret');
    const mDate = new Date();

    // モックの返却値をセット
    (Utilities.getUuid as jest.Mock).mockReturnValue('uuid');
    jest.spyOn(global, 'Date').mockReturnValue(mDate);
    const mSignature = jest.spyOn(sb as any, 'getSignature').mockReturnValue('signature');
    (Utilities.computeHmacSignature as jest.Mock).mockReturnValue('signature');
    (UrlFetchApp.fetch as jest.Mock).mockReturnValue({
      getResponseCode: () => 429,
      getContentText: () => JSON.stringify({ statusCode: 100 })
    });

    // モックの引数
    const json = { "command": "turnOn" };
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions & { method: GoogleAppsScript.URL_Fetch.HttpMethod } = {
      'method': 'post',
      'headers': {
        'Authorization': 'token',
        'sign': 'signature',
        't': mDate.getTime().toString(),
        'nonce': 'uuid',
        'Content-Type': 'application/json',
      },
      'payload': JSON.stringify(json),
      'muteHttpExceptions': true,
    };

    // 実行
    expect(sb.sendCommand('deviceId', json)).toBe(false);

    // getSignatureの引数確認
    expect(mSignature).toHaveBeenCalledWith('uuid', mDate.getTime().toString());
    // 想定したURLでリクエストされているか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(sb.api_url + '/devices/deviceId/commands', options);
  });
});
