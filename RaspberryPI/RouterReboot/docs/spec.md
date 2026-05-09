# 基本仕様

## 概要

対象ルータ（Buffalo WXR-5700AX7S）の管理画面に自動ログインし、再起動を実行するスクリプト。

---

## 環境変数

| 変数名 | 内容 | 例 |
| --- | --- | --- |
| `URL` | 管理画面のログイン URL | .envで読み込む |
| `ID` | ログイン ID | Infisical で管理 |
| `PASSWORD` | ログインパスワード | Infisical で管理 |

---

## 処理フロー

### ステップ 1: ログイン

1. `URL` へ遷移する。
2. `#form_USERNAME` に ID、`#form_PASSWORD` にパスワードを入力し「ログイン」ボタンを押下する。
3. **スマート引っ越し画面** が表示された場合（タイムアウト 5 秒で判定）：
   - `#label_button_moveset` をクリックして「続行」する。
4. **他のユーザーがログイン中** 画面（`loginexclude.html`）が表示された場合（タイムアウト 5 秒で判定）：
   - 「OK」ボタンをクリックする。
   - ネットワークアイドルまで待機する。
   - OK 押下後にログインページへ戻った場合は、再度ログインフォームを送信する。

### ステップ 2: 詳細設定画面へ遷移

- `{baseUrl}/advanced.html` へ直接 `goto` する。
  - ※ Buffalo ルーターの詳細設定は JS ナビゲーション（`goAdvanced()`）のため、ボタンクリックでは URL が変わらない。直接遷移を使用する。
- ネットワークアイドルまで待機する。

### ステップ 3: 管理 → 設定管理/再起動 画面へ遷移

1. サイドメニューの `dt.ADMIN` をクリックしてサブメニューを展開する。
2. `p.INIT`（`data-main="save_init.html"`）をクリックする。
3. ネットワークアイドルまで待機する。
4. `#content_main` iframe の読み込みを待機する（タイムアウト 10 秒）。

### ステップ 4: 再起動

1. `save_init.html` を含む iframe フレームを特定する。
2. フレーム内の `input[name="reboot"]` をクリックする。
3. ネットワークアイドルまで待機する。
4. iframe が見つからない場合は `RuntimeError` を送出して終了する。

---

## 異常系・エラーハンドリング

| ケース | 対応 |
| --- | --- |
| 環境変数未設定 | エラーメッセージを stderr に出力し `sys.exit(1)` |
| スマート引っ越し画面なし | タイムアウト後に処理続行（例外は無視） |
| 他ユーザーログイン画面なし | タイムアウト後に処理続行（例外は無視） |
| 再起動 iframe が見つからない | `RuntimeError` を送出 |
| ブラウザ終了 | `finally` ブロックで `BrowserDriver.close()` を必ず呼ぶ |

---

## 技術仕様

| 項目 | 内容 |
| --- | --- |
| ブラウザ | Playwright Chromium（ヘッドレスモード） |
| デフォルトタイムアウト | 30,000 ms（ナビゲーション全般） |
| スマート引っ越し判定タイムアウト | 5,000 ms |
| ログイン排他判定タイムアウト | 5,000 ms |
| iframe 待機タイムアウト | 10,000 ms |

---

## コンポーネント構成

```
main.py
  └─ BrowserDriver      # Playwright Chromium の起動・終了を管理
  └─ RouterNavigator    # 処理フロー 1〜4 のナビゲーションロジック
       ├─ login()                      # ステップ 1
       ├─ _handleSmartMoveScreen()     # スマート引っ越し画面処理（内部）
       ├─ _handleLoginExcludeScreen()  # 排他ログイン画面処理（内部）
       ├─ navigateToAdvancedSettings() # ステップ 2
       ├─ navigateToManagement()       # ステップ 3
       └─ reboot()                     # ステップ 4
```
