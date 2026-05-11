# chrome

## chromeの自動起動
パスワードストアをコピー
```
cp /usr/share/applications/chromium.desktop ~/.local/share/applications
```

下記を「~/.config/wayfire.ini」に追記

```
[autostart]
chromium=chromium-browser --remote-debugging-port=9222 --password-store=basic %U
```


## amazonの認証情報
chromeに記憶させる

## Pythonパッケージのインストール
```
uv pip install selenium
```