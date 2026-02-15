# ProfitLens

コンサルティング事業向けプロジェクト収益管理システム

## 機能

- 📊 ダッシュボード（売上・コスト・利益の可視化）
- 👥 要員管理（メンバー・役職・部門）
- 📁 プロジェクト管理
- ⏱️ 工数配分（アサイン）管理
- 📈 年度別・四半期別の予算管理
- 💾 データのエクスポート/インポート
- ☁️ Supabaseによるデータ永続化

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 4
- **データベース**: Supabase (PostgreSQL)
- **アイコン**: Lucide React

## セットアップ

### 1. 環境変数の設定

`.env.example`を`.env.local`にコピーして、Supabaseの情報を設定してください:

```bash
cp .env.example .env.local
```

`.env.local`を編集:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# DEMO Mode
NEXT_PUBLIC_IS_DEMO=true  # DEMO版の場合はtrue、本番の場合はfalse
```

### 2. Supabaseのデータベーススキーマ作成

Supabaseダッシュボードの **SQL Editor** で `supabase-schema.sql` を実行してください。

### 3. 依存関係のインストール

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## DEMO版と本番の切り替え

環境変数 `NEXT_PUBLIC_IS_DEMO` で切り替えが可能です:

### DEMO版として起動

```env
NEXT_PUBLIC_IS_DEMO=true
```

- ブラウザタイトルに「DEMO」が表示される
- ロゴに「DEMO」バッジが表示される
- 警告バナーが表示される

### 本番として起動

```env
NEXT_PUBLIC_IS_DEMO=false
```

- DEMO表示が全て非表示になる

## ビルド

```bash
npm run build
npm start
```

## デプロイ

Vercel、Netlifyなどにデプロイする際は、環境変数を設定してください:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_IS_DEMO` (本番環境では`false`を推奨)

## データ移行

初回起動時、localStorage に保存された旧データがあれば、自動的にSupabaseに移行されます。

## ライセンス

Private
