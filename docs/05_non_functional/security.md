# セキュリティ方針

> **根拠ソース**: [supabase-schema.sql](../../supabase-schema.sql)（RLSポリシー）、[.env.example](../../.env.example)

---

## 1. 現在のセキュリティ状況（確認済み事実）

| ID | 項目 | 現状 | 想定リスク |
|----|-----|------|----------|
| SEC-001 | **認証** | 未実装 | URLを知る全ての人が全データの読み書き・削除を実行できる |
| SEC-002 | **Row Level Security（RLS）** | 有効化済みだが「全ユーザー許可」ポリシー | RLSは有効だが実質的に無効と同じ |
| SEC-003 | **APIキー（Anon Key）** | `NEXT_PUBLIC_ANON_KEY` として公開 | クライアントサイドに公開されており、ブラウザ開発者ツールから参照可能 |
| SEC-004 | **HTTPS** | Vercel/Netlifyデプロイ時は自動適用 | ローカル開発環境は HTTP |
| SEC-005 | **データ保護** | なし | Supabaseプロジェクトの全データが無制限にアクセス可能 |

---

## 2. Row Level Security（RLS）の現在の設定

> ID: SEC-010

[supabase-schema.sql](../../supabase-schema.sql) に記載された設定内容です。

- **[SEC-011]** **全テーブルで有効化**:
```sql
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
```

- **[SEC-012]** **全テーブル・全操作に対してオープンポリシー**:
```sql
-- 例（departments。他テーブルも同様）
CREATE POLICY "Enable read access for all users"   ON departments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON departments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON departments FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON departments FOR DELETE USING (true);
```

> SQLコメント（原文）: 「将来的に認証を追加する場合は、ここを修正してください」

---

## 3. 将来の認証追加時の考慮点

> ID: SEC-020

> ※推測（要確認）: 以下は `supabase-schema.sql` のコメントと一般的なSupabase認証パターンから推測した内容です。

認証を追加する場合の想定実装方針:

| ID | 項目 | 想定アプローチ |
|----|-----|-------------|
| SEC-021 | 認証方式 | Supabase Auth（メール認証、Google OAuth 等） |
| SEC-022 | RLSポリシーの変更 | `USING (true)` → `USING (auth.uid() IS NOT NULL)` 等に変更 |
| SEC-023 | フロントエンド変更 | ログイン画面の追加、セッション管理、リダイレクト処理 |
| SEC-024 | ミドルウェア | `middleware.ts` でセッション確認とリダイレクト |
| SEC-025 | 権限分離 | 管理者・一般ユーザー等のロールベースアクセス制御（RBAC） |

---

## 4. DEMO/本番のデータ分離

> ID: SEC-030

- **[SEC-031]** **推奨される分離方法**: Supabaseプロジェクトを別々に作成し、環境変数で接続先を切り替えます。

```
DEMOプロジェクト:
  NEXT_PUBLIC_SUPABASE_URL=https://demo-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-anon-key
  NEXT_PUBLIC_IS_DEMO=true

本番プロジェクト:
  NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
  NEXT_PUBLIC_IS_DEMO=false
```

> ※推測（要確認）: 現在の運用でDEMOと本番が同一Supabaseプロジェクトを使用している場合、データが混在するリスクがあります。実際の分離状況は確認が必要です。

---

## 5. 環境変数の管理

> ID: SEC-040

| ID | 変数名 | 公開範囲 | 説明 |
|----|-------|---------|------|
| SEC-041 | `NEXT_PUBLIC_SUPABASE_URL`（ENV-001） | クライアント公開（ブラウザから参照可能） | SupabaseプロジェクトのURL |
| SEC-042 | `NEXT_PUBLIC_SUPABASE_ANON_KEY`（ENV-002） | クライアント公開（ブラウザから参照可能） | Supabase匿名アクセスキー（RLSで制御） |
| SEC-043 | `NEXT_PUBLIC_IS_DEMO`（ENV-003） | クライアント公開 | DEMO表示の切り替えフラグ |

> `NEXT_PUBLIC_` プレフィックスの変数は Next.js によってクライアントサイドのバンドルに含まれます。Supabase Anon Key の公開は Supabase の設計思想（RLSで制御）に基づいており、RLSが適切に設定されていれば問題ありません。ただし、現在はRLSが全許可状態のため注意が必要です。

---

## 関連ドキュメント

- [スキーマ概要・ER図](../03_data/schema_overview.md)
- [データフロー設計](../04_architecture/data_flow.md)
- [環境構築手順](../06_operations/setup.md)
- [DEMOモード仕様](../06_operations/demo_mode.md)
