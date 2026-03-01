# 技術スタック

> **根拠ソース**: [package.json](../../package.json)、[tsconfig.json](../../tsconfig.json)、[next.config.ts](../../next.config.ts)、[postcss.config.mjs](../../postcss.config.mjs)

---

## 1. 依存ライブラリ一覧

### ランタイム依存（`dependencies`）

| ID | ライブラリ | バージョン | 用途 |
|----|-----------|-----------|------|
| TS-001 | `next` | ^15.1.0 | Webフレームワーク（App Router採用） |
| TS-002 | `react` | ^19.0.0 | UIコンポーネントライブラリ |
| TS-003 | `react-dom` | ^19.0.0 | ReactのDOM描画 |
| TS-004 | `@supabase/supabase-js` | ^2.95.3 | Supabase REST APIクライアント |
| TS-005 | `lucide-react` | ^0.468.0 | SVGアイコンライブラリ |

### 開発依存（`devDependencies`）

| ID | ライブラリ | バージョン | 用途 |
|----|-----------|-----------|------|
| TS-010 | `typescript` | ^5.7.0 | 型安全な開発環境 |
| TS-011 | `tailwindcss` | ^4.0.0 | ユーティリティファーストCSSフレームワーク |
| TS-012 | `@tailwindcss/postcss` | ^4.0.0 | Tailwind CSS v4のPostCSS統合 |
| TS-013 | `postcss` | ^8.5.0 | CSSトランスフォームツール |
| TS-014 | `prisma` | ^7.3.0 | ORM（現時点では未使用） |
| TS-015 | `@types/node` | ^22.0.0 | Node.js型定義 |
| TS-016 | `@types/react` | ^19.0.0 | React型定義 |
| TS-017 | `@types/react-dom` | ^19.0.0 | ReactDOM型定義 |

---

## 2. Next.js の利用方針

| ID | 機能 | 使用状況 |
|----|-----|---------|
| TS-020 | App Router | 採用（`src/app/` ディレクトリ構成） |
| TS-021 | サーバーコンポーネント | **未使用**（全コンポーネントに `"use client"` を付与） |
| TS-022 | Server Actions | **未使用** |
| TS-023 | API Routes | **未使用** |
| TS-024 | SSR / SSG | **未使用** |
| TS-025 | ミドルウェア | **未使用** |

- **[TS-026]** **実質的な動作**: すべてクライアントサイドで処理する SPA（Single Page Application）として動作します。Next.jsはビルドツールとルーティングの土台として使用しています。

---

## 3. TypeScript 設定

> ID: TS-030

[tsconfig.json](../../tsconfig.json) より:

| ID | 設定項目 | 値 | 説明 |
|----|---------|-----|------|
| TS-031 | `strict` | `true` | 厳格な型チェックを有効化 |
| TS-032 | `target` | `ES2017` | 出力ECMAScriptバージョン |
| TS-033 | `moduleResolution` | `bundler` | Next.js推奨のモジュール解決方式 |
| TS-034 | `paths` | `"@/*": ["./src/*"]` | `@/` でsrcディレクトリへのパスエイリアス |

---

## 4. Tailwind CSS v4 の設定方式

> ID: TS-040

Tailwind CSS v4 では `tailwind.config.js` ファイルが不要になりました。

- **[TS-041]** **PostCSS統合**: `@tailwindcss/postcss` プラグインを [postcss.config.mjs](../../postcss.config.mjs) に設定
- **[TS-042]** **CSSインポート**: `globals.css` で `@import "tailwindcss"` を使用（v4方式）

---

## 5. Prismaの現状

> ID: TS-050

`prisma` は `devDependencies` に追加されていますが、現時点では **実質的に未使用** です。

| ID | 状態 | 内容 |
|----|-----|------|
| TS-051 | `prisma/schema.prisma` | `generator` と `datasource` の最小限の設定のみ。モデル定義なし |
| TS-052 | `prisma/migrations/` | ディレクトリのみ存在。マイグレーションファイルなし |
| TS-053 | データアクセス | Supabase JavaScriptクライアント（`@supabase/supabase-js`）のみ使用 |

> ※推測（要確認）: Prismaは将来的なORM移行を見据えた事前設置の可能性がありますが、確認は取れていません。

---

## 6. フォント

> ID: TS-060

- **[TS-061]** **Google Fonts**: Noto Sans JP（日本語対応サンセリフ体）
- **[TS-062]** **読み込み方式**: Next.jsの `next/font/google` による最適化読み込み
- **[TS-063]** **適用先**: HTMLルートボディ要素

---

## 関連ドキュメント

- [フロントエンド構成](./frontend_structure.md)
- [データフロー設計](./data_flow.md)
- [環境構築手順](../06_operations/setup.md)
