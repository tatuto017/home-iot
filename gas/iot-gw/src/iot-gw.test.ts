import { IotGw } from "./iot-gw";
import { SwitchBot } from "./SwitchBot";

const url = 'https://example.com';

describe('IotGw', () => {
  const mockDecrypt = jest.fn();
  const sb = new SwitchBot('token', 'secret');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('homeGw', () => {
    const gw = new IotGw();

    expect(gw.homeGw(url, 'cmd=test')).toBe(true);

    // 想定したURLでリクエストされているか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(`${url}/iot?cmd=test`);
  });

  test('homeGw ERROR', () => {
    const gw = new IotGw();

    // 例外の発生を設定する
    (UrlFetchApp.fetch as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Network Error');
    });

    expect(gw.homeGw(url, 'cmd=test')).toBe(false);

    // 想定したURLでリクエストされているか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(`${url}/iot?cmd=test`);
  });

  test('healthCheckGW OK', () => {
    // SwitchBotをmock化
    sb.sendCommand = jest.fn();

    const gw = new IotGw();
    gw.healthCheckGW(url, 'deviceId', sb);

    // 想定したURLでリクエストされているか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(`${url}/status?device=iot-gw`);

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
    gw.healthCheckGW(url, 'deviceId', sb);

    // 想定したURLでリクエストされているか確認
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(`${url}/status?device=iot-gw`);

    // コマンドが実行されていることを確認
    expect(sb.sendCommand).toHaveBeenCalledWith('deviceId', { "command": "turnOff" });
    expect(sb.sendCommand).toHaveBeenCalledWith('deviceId', { "command": "turnOn" });
  });
});
