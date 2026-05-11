# 自宅IoT

## GAS
| ディレクトリ | 機能 |
| ---- | ---- |
| iot-gw | ネットから自宅のnode-redへのGW |


## RaspberryPI
| ディレクトリ | 機能 |
| ---- | ---- |
| kitchen_pump | キッチンの除湿機のポンプ |
| bed_pump | 寝室の除湿機のポンプ |
| washroom_pump | 洗面所の除湿機のポンプ |
| warmer | デスクのウォーマー電源 |
| live | LIVE配信の自動保存 |
| RouterReboot | ルータを再起動する |
| plug | スマートプラグのON/OFF (Bluetooth) |

## node-red
| ディレクトリ | 機能 |
| ---- | ---- |
| amazon-login | Amazonログイン |

### Amazonログイン
[node-red-contrib-alexa-remote2-applestrudel](https://flows.nodered.org/node/node-red-contrib-alexa-remote2-applestrudel)でAmazonのログインが必要なので、RaspberryPIのchromeでログインさせる

### uvでのPython起動
起動シェルに下記を追記する
```
. "$HOME/.local/bin/env"
export UV_PROJECT_ENVIRONMENT=.venv
export PATH=$PATH:$HOME/.local/bin
```