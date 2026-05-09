# RouterReBoot

Buffalo WXR-5700AX7S ルーターの管理画面に自動ログインし、再起動を実行するスクリプト。

## 必要環境

- Python 3.11
- [uv](https://github.com/astral-sh/uv)
- Playwright Chromium

## セットアップ

```bash
# 依存パッケージのインストール
uv sync

# Playwright ブラウザのインストール
uv run playwright install chromium --with-deps
```

## 環境変数

`.env` ファイルを作成する、認証情報は Infisical で以下の変数を管理する。

| 変数名 | 内容 |
| --- | --- |
| `URL` | 管理画面のログイン URL |
| `ID` | ログイン ID (Infisical で管理) |
| `PASSWORD` | ログインパスワード (Infisical で管理) |

## 実行

```bash
# Infisical 経由で実行
infisical run -- uv run python -m router_reboot
```

## プロジェクト構成

```
src/router_reboot/
├── __init__.py
├── browser_driver.py   # Playwright ラッパー (BrowserDriver)
├── router_navigator.py # ナビゲーションロジック (RouterNavigator)
└── main.py             # エントリーポイント
docs/
└── spec.md             # 基本仕様
```

## 処理フロー

1. ルーター管理画面にログインする
   - スマート引っ越し画面が表示された場合は「続行」する
   - 他ユーザーがログイン中の場合は「OK」を押して再ログインする
2. 詳細設定画面へ遷移する
3. 管理 → 設定管理/再起動 画面へ遷移する
4. 再起動ボタンを押下する

詳細は [docs/spec.md](docs/spec.md) を参照。
