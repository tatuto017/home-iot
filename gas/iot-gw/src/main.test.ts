import { doGet, doPost, update_ipaddress, healthCheckGW, sb } from "./main";

describe('doGet', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // プロパティの返却値
    const props: { [key: string]: string } = {
      ipaddr: "192.168.1.100",
      port: "8080"
    };

    // プロパティに返却値を設定する
    (PropertiesService.getScriptProperties().getProperty as jest.Mock)
      .mockImplementation((key: string) => props[key] || null);
  });

  test('doGet SUCCESS', () => {
    // モックイベントの作成
    const mockEvent: GoogleAppsScript.Events.DoGet = {
      parameter: { cmd: "test" },
      parameters: { cmd: ["test"] },
      queryString: "cmd=test",
      contextPath: "",
      contentLength: 8,
      pathInfo: ""
    };

    // 実行
    const res = doGet(mockEvent);
    // プロパティからIPアドレスを習得していることを確認
    expect(PropertiesService.getScriptProperties().getProperty).toHaveBeenCalledWith('ipaddr');
    // プロパティからポートを習得していることを確認
    expect(PropertiesService.getScriptProperties().getProperty).toHaveBeenCalledWith('port');
    // レスポンスを習得して、JSONにパースする
    const responseData = JSON.parse(res.getContent());
    // レスポンスのJSONを確認
    expect(responseData).toEqual({ status: "success" });
    // 想定したURLでリクエストされているか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith('http://192.168.1.100:8080/iot?cmd=test');
  });

  test('doGet FAIL', () => {
    // モックイベントの作成
    const mockEvent: GoogleAppsScript.Events.DoGet = {
      parameter: { cmd: "test" },
      parameters: { cmd: ["test"] },
      queryString: "cmd=test",
      contextPath: "",
      contentLength: 8,
      pathInfo: ""
    };

    // 例外の発生を設定する
    (UrlFetchApp.fetch as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Network Error');
    });

    // 実行
    const response = doGet(mockEvent);
    // プロパティからIPアドレスを習得していることを確認
    expect(PropertiesService.getScriptProperties().getProperty).toHaveBeenCalledWith('ipaddr');
    // プロパティからポートを習得していることを確認
    expect(PropertiesService.getScriptProperties().getProperty).toHaveBeenCalledWith('port');
    // レスポンスを習得して、JSONにパースする
    const responseData = JSON.parse(response.getContent());
    // レスポンスのJSONを確認
    expect(responseData).toEqual({ status: "error" });
    // 想定したURLでリクエストされているか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith('http://192.168.1.100:8080/iot?cmd=test');
  });
});

describe('doPost', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // update_ipaddressをmock化
    (global as any).update_ipaddress = jest.fn();

    // プロパティの返却値
    const props: { [key: string]: string } = {
      passKey: "passKey",
      password: "password"
    };
    // プロパティに返却値を設定する
    (PropertiesService.getScriptProperties().getProperty as jest.Mock)
      .mockImplementation((key: string) => props[key] || null);
  });

  test('doPost', () => {
    // モックイベントの作成
    const mockEvent: GoogleAppsScript.Events.DoPost = {
      postData: {
        contents: JSON.stringify({
          encIp: "encrypted_192.168.1.100",
          encPass: "encrypted_correct_password"
        }),
        length: 100, // 必須プロパティ
        name: "postData",
        type: "application/json"
      },
      contentLength: 100,
      contextPath: "",
      parameter: {},
      parameters: {},
      queryString: "",
      pathInfo: ""
    };

    // 実行
    const response = doPost(mockEvent);
    // レスポンスを習得して、JSONにパースする
    const responseData = JSON.parse(response.getContent());
    // レスポンスのJSONを確認
    expect(responseData).toEqual({ status: "success" });
    // update_ipaddressの引数を確認
    expect((global as any).update_ipaddress).toHaveBeenCalledWith(JSON.parse(mockEvent.postData.contents));
  });

  test('doPost no update', () => {
    // モックイベントの作成
    const mockEvent: GoogleAppsScript.Events.DoPost = {
      postData: {
        contents: JSON.stringify({ other: "data" }),
        length: 50,
        name: "postData",
        type: "application/json"
      },
      contentLength: 50,
      contextPath: "",
      parameter: {},
      parameters: {},
      queryString: "",
      pathInfo: ""
    };

    // 実行
    const response = doPost(mockEvent);
    // レスポンスを習得して、JSONにパースする
    const responseData = JSON.parse(response.getContent());
    // レスポンスのJSONを確認
    expect(responseData).toEqual({ status: "success" });
    // update_ipaddressが呼ばれないことを確認
    expect((global as any).update_ipaddress).not.toHaveBeenCalled();
  });
});

describe('update_ipaddress', () => {
  const mockDecrypt = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Cipherのモック実装
    (cCryptoGS.Cipher as jest.Mock).mockImplementation(() => ({
      decrypt: mockDecrypt
    }));

    // デフォルトのプロパティ設定
    (PropertiesService.getScriptProperties().getProperty as jest.Mock)
      .mockImplementation((key: string) => {
        const props: any = {
          passKey: 'system_secret_key',
          password: 'correct_password'
        };
        return props[key] || null;
      });
  });

  test('update_ipaddress SUCCESS', () => {
    // 復号結果のシミュレート
    // 1回目(encIp)の復号結果 -> "192.168.1.100"
    // 2回目(encPass)の復号結果 -> "correct_password"
    mockDecrypt
      .mockReturnValueOnce("192.168.1.100")
      .mockReturnValueOnce("correct_password");

    // 入力値
    const input = {
      encIp: "encrypted_ip",
      encPass: "encrypted_pass"
    };

    // 実行
    update_ipaddress(input);

    // Cipherが正しいkeyで初期化されたか
    expect(cCryptoGS.Cipher).toHaveBeenCalledWith('system_secret_key', 'aes');
    // 引数(入力値)の確認
    expect(mockDecrypt).toHaveBeenCalledWith(input['encIp']);
    expect(mockDecrypt).toHaveBeenCalledWith(input['encPass']);
    // 正しいパスワードだったので、setPropertyが呼ばれているはず
    expect(PropertiesService.getScriptProperties().setProperty).toHaveBeenCalledWith('ipaddr', "192.168.1.100");
  });

  test('update_ipaddress FAIL', () => {
    // 復号結果のシミュレート
    // 1回目(encIp)の復号結果 -> "192.168.1.100"
    // 2回目(encPass)の復号結果 -> "wrong_password"
    mockDecrypt
      .mockReturnValueOnce("192.168.1.100")
      .mockReturnValueOnce("wrong_password");

    // 入力値
    const input = {
      encIp: "encrypted_ip",
      encPass: "encrypted_pass"
    };

    // 実行
    update_ipaddress(input);

    // Cipherが正しいkeyで初期化されたか
    expect(cCryptoGS.Cipher).toHaveBeenCalledWith('system_secret_key', 'aes');
    // 引数(入力値)の確認
    expect(mockDecrypt).toHaveBeenCalledWith(input['encIp']);
    expect(mockDecrypt).toHaveBeenCalledWith(input['encPass']);
    // パスワードが違うので、setPropertyが呼ばれないこと
    expect(PropertiesService.getScriptProperties().setProperty).not.toHaveBeenCalled();
  });
});

describe('healthCheckGW', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // SwitchBotをmock化
    sb.sendCommand = jest.fn();

    // プロパティの返却値
    const props: { [key: string]: string } = {
      ipaddr: "192.168.1.100",
      port: "8080",
      sb_token: 'token',
      sb_secret: 'secret',
      deviceId: 'deviceId',
    };

    // プロパティに返却値を設定する
    (PropertiesService.getScriptProperties().getProperty as jest.Mock)
      .mockImplementation((key: string) => props[key] || null);
  });

  test('healthCheckGW OK', () => {
    healthCheckGW();
    // プロパティからIPアドレスを習得していることを確認
    expect(PropertiesService.getScriptProperties().getProperty).toHaveBeenCalledWith('ipaddr');
    // プロパティからポートを習得していることを確認
    expect(PropertiesService.getScriptProperties().getProperty).toHaveBeenCalledWith('port');
    // 想定したURLでリクエストされているか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith('http://192.168.1.100:8080/status?device=iot-gw');
    // コマンドが実行されていないことを確認
    expect(sb.sendCommand).not.toHaveBeenCalled();
  });

  test('healthCheckGW Down', () => {
    // 例外の発生を設定する
    (UrlFetchApp.fetch as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Network Error');
    });

    // 実行
    healthCheckGW();

    // プロパティからIPアドレスを習得していることを確認
    expect(PropertiesService.getScriptProperties().getProperty).toHaveBeenCalledWith('ipaddr');
    // プロパティからポートを習得していることを確認
    expect(PropertiesService.getScriptProperties().getProperty).toHaveBeenCalledWith('port');
    // 想定したURLでリクエストされているか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith('http://192.168.1.100:8080/status?device=iot-gw');
    // コマンドが実行されていることを確認
    expect(sb.sendCommand).toHaveBeenCalledWith('deviceId', { "command": "turnOff" });
    expect(sb.sendCommand).toHaveBeenCalledWith('deviceId', { "command": "turnOn" });
  });
});
