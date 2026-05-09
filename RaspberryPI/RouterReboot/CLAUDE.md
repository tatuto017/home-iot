# Project Guide: RouterReBoot
ルータの管理画面にログインして、ルータを再起動させる

---

## プロジェクト構成

| レイヤー | 技術 |
| --- | --- |
| スクリプト | Python 3.11, python-dotenv, Playwright |

### ファイル構成

```
src/router_reboot/
├── __init__.py
├── browser_driver.py   # Playwright ラッパー (BrowserDriver)
├── router_navigator.py # ナビゲーションロジック (RouterNavigator)
└── main.py             # エントリーポイント
```

### 環境変数

| 変数名 | 内容 |
| --- | --- |
| `URL` | 管理画面のURL |
| `ID` | ルータの管理画面のID、Infisicalを使用する |
| `PASSWORD` | ルータの管理画面のパスワード、Infisicalを使用する |

---

## コーディング規約

- **命名規則**: メソッド名・変数名はキャメルケース（例: `userName`, `myFunction()`）
- **セキュリティ**: 認証情報はソースコードに直接記載しない（`.env` を使用）。
- **設計**: 依存性の注入（DI）で実装し、疎結合を保つ。
- **ドキュメント**: 全てのクラス・関数に Doc コメントを必ず記載する。
- **可読性**: 処理の意図が分かるよう、ロジックには適宜内部コメントを記載する。
- **Playwright **: ヘッドレスモードを使用する。

---

## タスクガイダンス
- タスク実行時は `docs/tasks/*.md` にある指示書を最優先で確認すること。
- 作業完了
  - 指示書の TODO リストを更新する。
  - プロジェクト構成に更新があれば、プロジェクト構成を更新する。
    - 更新したら教えて下さい。

---

# 開発環境
- Dockerコンテナ上での開発であること留意すること
- ユニットテストは`.venv_docker`を使用すること
- `VSCode`の`Claude Code拡張`を使用している。

---

## 開発ワークフロー

**Research → Plan → Execute → Review → Ship** の順で進める。

1. **Research**: 既存実装・ライブラリを先に調査する（`gh search code`、Context7）
2. **Plan**: 必ずプランモードで開始。フェーズ分けしてゲート条件（テスト通過）を設ける
3. **Execute**: TDDで実装（テスト先行）
4. **Review**: `code-reviewer` エージェントで確認
5. **Ship**: ビルド確認後にコミット

---

## Claude Code セッション管理

- **新タスク = 新セッション** — 無関係なタスクは `/clear` でコンテキストを切り替える
- **コンテキスト 25% 到達で `/compact`** — 自動コンパクトより手動のほうが精度が高い
- **複数ファイルの調査はサブエージェントに委任** — 調査結果だけをメインコンテキストに返す
- **行き詰まったら `/rewind`** — 失敗した試みの前の状態に戻って再プロンプト

---

## Git 運用

- **1時間に1回、タスク完了時点でコミット**（後から squash merge する）
- **PRは小さく集中させる**（目安: 変更行数 p50 = 118行）
- 詳細は `.claude/rules/git.md` を参照

---

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
