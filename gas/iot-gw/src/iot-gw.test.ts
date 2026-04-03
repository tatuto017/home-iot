import { IotGw } from "./iot-gw";
import { SwitchBot } from "./SwitchBot";

const ipaddr = '192.168.1.100';
const port = '8080';

describe('IotGw', () => {
  const mockDecrypt = jest.fn();
  const sb = new SwitchBot('token', 'secret');

  beforeEach(() => {
    jest.clearAllMocks();

    // Cipherのモック実装
    (cCryptoGS.Cipher as jest.Mock).mockImplementation(() => ({
      decrypt: mockDecrypt
    }));
  });

  test('homeGw', () => {
    const gw = new IotGw();

    expect(gw.homeGw(ipaddr, port, 'cmd=test')).toBe(true);

    // 想定したURLでリクエストされているか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith('http://192.168.1.100:8080/iot?cmd=test');
  });

  test('homeGw ERROR', () => {
    const gw = new IotGw();

    // 例外の発生を設定する
    (UrlFetchApp.fetch as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Network Error');
    });

    expect(gw.homeGw(ipaddr, port, 'cmd=test')).toBe(false);

    // 想定したURLでリクエストされているか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith('http://192.168.1.100:8080/iot?cmd=test');
  });

  test('isUpdateIpAddress', () => {
    // 復号結果のシミュレート
    // 1回目(encIp)の復号結果 -> "192.168.1.100"
    // 2回目(encPass)の復号結果 -> "correct_password"
    mockDecrypt
      .mockReturnValueOnce(ipaddr)
      .mockReturnValueOnce("password");

    const gw = new IotGw();
    expect(gw.isUpdateIpAddress('{"encPass":"encPass","encIp":"encIp"}', 'passKey', 'password')).toBe(ipaddr);
    // 引数(入力値)の確認
    expect(mockDecrypt).toHaveBeenCalledWith('encIp');
    expect(mockDecrypt).toHaveBeenCalledWith('encPass');
  });

  test('isUpdateIpAddress no update(encIp)', () => {
    const gw = new IotGw();
    expect(gw.isUpdateIpAddress('{"encPass":"encPass"}', 'passKey', 'password')).toBe(null);
    // 呼ばれないことを確認
    expect(mockDecrypt).not.toHaveBeenCalled()
  });

  test('isUpdateIpAddress no update(password)', () => {
    // 復号結果のシミュレート
    // 1回目(encIp)の復号結果 -> "192.168.1.100"
    // 2回目(encPass)の復号結果 -> "correct_password"
    mockDecrypt
      .mockReturnValueOnce(ipaddr)
      .mockReturnValueOnce("password");

    const gw = new IotGw();
    expect(gw.isUpdateIpAddress('{"encPass":"encPass","encIp":"encIp"}', 'passKey', 'password2')).toBe(null);
    // 引数(入力値)の確認
    expect(mockDecrypt).toHaveBeenCalledWith('encIp');
    expect(mockDecrypt).toHaveBeenCalledWith('encPass');
  });

  test('healthCheckGW OK', () => {
    // SwitchBotをmock化
    sb.sendCommand = jest.fn();

    const gw = new IotGw();
    gw.healthCheckGW(ipaddr, port, 'deviceId', sb);

    // 想定したURLでリクエストされているか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith('http://192.168.1.100:8080/status?device=iot-gw');

    // 想定したURLでリクエストされているか確認
    expect(sb.sendCommand).not.toHaveBeenCalled()
  });

  test('healthCheckGW Down', () => {
    // SwitchBotをmock化
    sb.sendCommand = jest.fn();

    // 例外の発生を設定する
    (UrlFetchApp.fetch as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Network Error');
    });

    const gw = new IotGw();
    gw.healthCheckGW(ipaddr, port, 'deviceId', sb);

    // 想定したURLでリクエストされているか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith('http://192.168.1.100:8080/status?device=iot-gw');

    // コマンドが実行されていることを確認
    expect(sb.sendCommand).toHaveBeenCalledWith('deviceId', { "command": "turnOff" });
    expect(sb.sendCommand).toHaveBeenCalledWith('deviceId', { "command": "turnOn" });
  });
});
