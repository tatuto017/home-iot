import { build } from "esbuild";
import { GasPlugin } from 'esbuild-gas-plugin';
import dotenv from "dotenv";

dotenv.config();

const isDebug = process.argv.includes("--debug");

build({
  entryPoints: ["src/main.ts"],  // エントリーポイント
  bundle: true,
  target: "es2019",  // GAS互換
  outfile: "dist/main.gs",  // 出力ファイル（GASで読み込みやすい）
  format: "iife",
  globalName: "GAS",
  minify: false,
  sourcemap: isDebug,  // デバッグ時はソースマップ生成
  plugins: [GasPlugin],  // GAS特化プラグイン
  footer: {
    js: `
function doGet(e) {
  return GAS.doGet(e);
}
function healthCheckGW() {
  return GAS.healthCheckGW();
}
`
  }
}).catch((e) => {
  console.error(e);
  process.exit(1);
});