# 環境構築手順

> **根拠ソース**: [README.md](../../README.md)、[.env.example](../../.env.example)、[supabase-schema.sql](../../supabase-schema.sql)、[demo-data.sql](../../demo-data.sql)

---

## 1. 前提条件

| ID | 必要なもの | バージョン / 内容 |
|----|----------|----------------|
| OPS-001 | Node.js | 18以上を推奨（Next.js 15対応） |
| OPS-002 | npm | Node.jsに同梱 |
| OPS-003 | Supabaseアカウント | [https://supabase.com](https://supabase.com) で無料アカウント作成 |
| OPS-004 | Supabaseプロジェクト | Supabaseダッシュボードで新規プロジェクトを作成済みであること |

---

## 2. セットアップ手順

### ステップ 1: リポジトリのクローンと依存インストール
> ID: OPS-010

```bash
git clone <repository-url>
cd uman-profitlens
npm install
```

### ステップ 2: Supabase DBスキーマの作成
> ID: OPS-011

1. Supabaseダッシュボードにログイン
2. 対象プロジェクトの **「SQL Editor」** を開く
3. [supabase-schema.sql](../../supabase-schema.sql) の内容を貼り付けて実行

これにより以下が作成されます:
- 5テーブル（departments / roles / members / projects / allocations）
- インデックス（5件）
- Row Level Securityポリシー

### ステップ 3: 環境変数の設定
> ID: OPS-012

```bash
cp .env.example .env.local
```

`.env.local` を開いて以下の値を設定します:

```env
# Supabaseプロジェクトの設定 → Supabaseダッシュボードの Settings > API で確認
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# DEMO表示の切り替え
# true = DEMOバッジと警告バナーを表示
# false = 本番表示
NEXT_PUBLIC_IS_DEMO=false
```

### ステップ 4: 開発サーバーの起動
> ID: OPS-013

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### ステップ 5（任意）: デモデータの投入
> ID: OPS-014

Supabaseダッシュボードの SQL Editor で [demo-data.sql](../../demo-data.sql) を実行します。

**投入されるデータ**:
- 部署: 3件
- 役職: 5件
- メンバー: 12人
- プロジェクト: 6件（進行中3・完了2・予定1）
- アサイン: 65件以上

> **注意**: デモデータ実行前に既存データを削除するSQLが含まれていません。既存データがある場合はIDの重複が発生する可能性があります。

---

## 3. 本番ビルドと起動
> ID: OPS-020

```bash
npm run build   # TypeScriptコンパイル + Next.jsビルド
npm start       # プロダクションサーバー起動
```

---

## 4. Vercel / Netlify へのデプロイ
> ID: OPS-021

### 環境変数の設定

デプロイ先のダッシュボードで以下の環境変数を設定してください:

| ID | 変数名 | 説明 |
|----|-------|------|
| ENV-001 | `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL |
| ENV-002 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名アクセスキー |
| ENV-003 | `NEXT_PUBLIC_IS_DEMO` | `true` または `false` |

### Vercel の場合

```bash
# Vercel CLIを使う場合
npx vercel --prod
```

またはGitHubリポジトリをVercelに連携して自動デプロイを設定します。

---

## 5. 利用可能なスクリプト

| ID | スクリプト | コマンド | 説明 |
|----|-----------|---------|------|
| OPS-030 | 開発サーバー | `npm run dev` | ホットリロード付きローカル開発 |
| OPS-031 | ビルド | `npm run build` | プロダクション用ビルド |
| OPS-032 | 本番起動 | `npm start` | ビルド済みアプリの起動 |

---

## 関連ドキュメント

- [DEMOモード仕様](./demo_mode.md)
- [データ移行・バックアップ](./data_migration.md)
- [技術スタック](../04_architecture/tech_stack.md)
- [セキュリティ方針](../05_non_functional/security.md)
