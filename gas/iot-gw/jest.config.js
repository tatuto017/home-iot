// jest.config.js
/** @type {import('jest').Config} */
module.exports = {
  // 1. テスト対象ファイル
  testMatch: [
    "<rootDir>/src/**/*.test.ts",
    "<rootDir>/src/**/*.spec.ts"
  ],

  // 2. TypeScript サポート（ts-jest 不要 → 高速な babel 変換）
  transform: {
    "^.+\\.(ts|tsx)$": [
      "babel-jest",
      {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          "@babel/preset-typescript",
        ],
      },
    ],
  },

  // 3. テスト環境：Node.js（GASはV8だが、JestはNodeで実行）
  testEnvironment: "node",

  // 4. モジュール解決（tsconfig の paths 対応）
  moduleNameMapper: {
    "^#types/(.*)$": "<rootDir>/src/types/$1",
  },

  // 5. 無視するディレクトリ
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],

  // 6. セットアップファイル（GASグローバルモック）
  setupFiles: ["<rootDir>/jest.setup.js"],

  // 7. カバレッジ（任意）
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/types/**",
    "!src/main.ts",
  ],

  // 8. ファイル拡張子
  moduleFileExtensions: ["ts", "js", "json"],

  // 9. クリアモック（テスト間の独立性）
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  verbose: true,  // ログを詳細に出す
  silent: false,  // console.log を抑制しない

  // 10. 型チェック併用（推奨）
  // → package.json に "typecheck": "tsc --noEmit"
};
