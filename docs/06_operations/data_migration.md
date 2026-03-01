# データ移行・バックアップ・インポート手順

> **根拠ソース**: [src/lib/storage.ts](../../src/lib/storage.ts)（`migrateFromLocalStorage`, `exportData`, `importData` 関数）

---

## 1. localStorage → Supabase 自動移行

> ID: MIG-001

旧バージョン（v5以前）のデータが `localStorage` に保存されている場合、アプリ起動時に自動的に Supabase へ移行されます（CNV-041: `uman_profit_manager_v5` キー参照）。

### 移行タイミング

- **[MIG-002]** アプリの **初回ロード時**（`useEffect` のマウント）に自動実行されます。

### 移行条件

| ID | 条件 | 動作 |
|----|-----|------|
| MIG-003 | `localStorage["uman_profit_manager_v5"]` が存在し、データが1件以上ある | Supabaseに `saveData()` を実行して移行 |
| MIG-004 | localStorageにデータがない | スキップ（何もしない） |

### 移行後の動作

- **[MIG-005]** localStorage のデータは **削除されません**（バックアップとして残置）
- **[MIG-006]** 移行成功後、「○件のデータを移行しました」というトースト通知を表示

---

## 2. JSONエクスポート（バックアップ）

> ID: MIG-010

現在のデータをJSONファイルとしてダウンロードできます。

### 操作手順

1. サイドバー下部の **「エクスポート」** ボタンをクリック
2. ブラウザのダウンロードダイアログが表示される
3. 任意の場所に保存

### エクスポートファイルの仕様

| ID | 項目 | 内容 |
|----|-----|------|
| MIG-011 | ファイル名 | `profitlens_backup_YYYY-MM-DD.json`（実行日付が入る） |
| MIG-012 | フォーマット | JSON（camelCase形式：`lastName`, `deptId` 等） |
| MIG-013 | 含まれるデータ | 全エンティティ（departments / roles / members / projects / allocations） |
| MIG-014 | エンコード | UTF-8 |

### エクスポートJSONの構造

```json
{
  "departments": [...],
  "roles": [...],
  "members": [
    {
      "id": "M001",
      "lastName": "山田",
      "firstName": "太郎",
      "roleId": "R001",
      "deptId": "D001",
      "startMonth": "2023-04",
      "yearlyBudgets": { "FY2025": 4000 }
    }
  ],
  "projects": [...],
  "allocations": [...]
}
```

---

## 3. JSONインポート

> ID: MIG-020

バックアップファイルやSupabaseから直接エクスポートしたJSONをインポートできます。

### 操作手順

1. サイドバー下部の **「インポート」** ボタンをクリック
2. ファイル選択ダイアログが開く
3. `.json` ファイルを選択

### 対応フォーマット

| ID | フォーマット | 対応状況 |
|----|-----------|---------|
| MIG-021 | camelCase形式（ProfitLensバックアップ） | ○ 対応 |
| MIG-022 | snake_case形式（Supabase直接エクスポート） | ○ 対応（`normalizeImportedData`（CNV-027）が自動変換） |

### 重要な注意事項

- **[MIG-023]** **インポートを実行すると、Supabase上の全データが `saveData()` によって完全に置換されます。**
実行前に必ずエクスポートでバックアップを取ってください。

---

## 4. Supabase SQL による手動データ操作

> ID: MIG-030

Supabaseダッシュボードの SQL Editor から直接SQLを実行することも可能です。

### データを全削除する場合

外部キー制約（REL-003〜REL-004 参照）のため、以下の順序で削除する必要があります:

```sql
DELETE FROM allocations;  -- MIG-031
DELETE FROM projects;     -- MIG-032
DELETE FROM members;      -- MIG-033
DELETE FROM roles;        -- MIG-034
DELETE FROM departments;  -- MIG-035
```

### データを手動挿入する場合

外部キー制約（REL-001〜REL-002 参照）のため、以下の順序で挿入する必要があります:

```sql
-- MIG-041: departments
-- MIG-042: roles
-- MIG-043: members
-- MIG-044: projects
-- MIG-045: allocations
```

[demo-data.sql](../../demo-data.sql) のパターンを参考にしてください。

---

## 5. データのバックアップ推奨タイミング

> ID: MIG-050

> ※推測（要確認）: 自動バックアップ機能は実装されていません。以下は推奨運用方針です。

| ID | タイミング | 推奨操作 |
|----|----------|---------|
| MIG-051 | 大量データを削除・変更する前 | エクスポートでバックアップ |
| MIG-052 | インポートを実行する前 | エクスポートでバックアップ |
| MIG-053 | デモデータを投入する前 | エクスポートでバックアップ |
| MIG-054 | 定期的（週次等） | エクスポートでバックアップ |

---

## 関連ドキュメント

- [データフロー設計](../04_architecture/data_flow.md)
- [データ規約](../03_data/data_conventions.md)
- [環境構築手順](./setup.md)
