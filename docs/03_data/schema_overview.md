# データモデル概要（ER図・テーブル関係）

> **根拠ソース**: [supabase-schema.sql](../../supabase-schema.sql)

---

## 1. テーブル一覧

| ID | テーブル名 | 概要 |
|----|-----------|------|
| TBL-001 | `departments` | 部門マスタ |
| TBL-002 | `roles` | 役職マスタ |
| TBL-003 | `members` | 要員マスタ |
| TBL-004 | `projects` | プロジェクトマスタ |
| TBL-005 | `allocations` | アサイン（工数配分）記録 |

---

## 2. ER図

```
┌──────────────────┐     ┌─────────────────────┐
│   departments    │     │        roles         │
│  (TBL-001)       │     │  (TBL-002)          │
│──────────────────│     │─────────────────────│
│ id (PK)          │     │ id (PK)             │
│ name             │     │ name                │
│ created_at       │     │ created_at          │
└────────┬─────────┘     └──────────┬──────────┘
         │ 1 (REL-001)              │ 1 (REL-002)
         │                          │
         │ *                        │ *
┌────────┴──────────────────────────┴──────────┐
│                members (TBL-003)              │
│───────────────────────────────────────────────│
│ id (PK)                                       │
│ last_name                                     │
│ first_name                                    │
│ dept_id (FK → departments.id)                 │
│ role_id (FK → roles.id)                       │
│ start_month                                   │
│ yearly_budgets (JSONB)                        │
│ created_at                                    │
└────────────────────┬──────────────────────────┘
                     │ 1 (REL-003)
                     │
                     │ *
┌────────────────────┴──────────────────────────┐
│              allocations (TBL-005)             │
│───────────────────────────────────────────────│
│ id (PK)                                       │
│ member_id (FK → members.id)                   │
│ project_id (FK → projects.id)                 │
│ month                                         │
│ hours                                         │
│ cost_rate                                     │
│ created_at                                    │
└────────────────────┬──────────────────────────┘
                     │ * (REL-004)
                     │
                     │ 1
┌────────────────────┴──────────────────────────┐
│                projects (TBL-004)              │
│───────────────────────────────────────────────│
│ id (PK)                                       │
│ name                                          │
│ client                                        │
│ status                                        │
│ start_date / end_date                         │
│ member_ids (JSONB)                            │
│ quarter_budgets (JSONB)                       │
│ created_at                                    │
└───────────────────────────────────────────────┘
```

---

## 3. テーブル関係一覧

| ID | 関係 | 親テーブル | 子テーブル | 外部キー | 削除ルール |
|----|-----|---------|---------|---------|-----------|
| REL-001 | 部門 → 要員 | TBL-001: departments | TBL-003: members | `members.dept_id` | ON DELETE CASCADE（DB制約） |
| REL-002 | 役職 → 要員 | TBL-002: roles | TBL-003: members | `members.role_id` | ON DELETE CASCADE（DB制約） |
| REL-003 | 要員 → アサイン | TBL-003: members | TBL-005: allocations | `allocations.member_id` | ON DELETE CASCADE（DB制約） |
| REL-004 | プロジェクト → アサイン | TBL-004: projects | TBL-005: allocations | `allocations.project_id` | ON DELETE CASCADE（DB制約） |

> **注意**: これらは Supabase（PostgreSQL）の外部キー制約として定義されています。ただし、アプリケーションは `saveData()` による全削除→全挿入方式で動作するため、DB側のカスケード削除は通常は発動しません。

---

## 4. JSONB フィールドの疑似的な参照整合性

以下のフィールドはJSONBで格納されており、DB側の外部キー制約がありません。
整合性の維持は **アプリケーション側** で行います。

| ID | フィールド | テーブル | 型 | 整合性の維持方法 |
|----|-----------|---------|-----|----------------|
| SCH-001 | `member_ids` | TBL-004: projects | `string[]` | 要員削除時にアプリ側でフィルタリング |
| SCH-002 | `quarter_budgets` | TBL-004: projects | `Record<string, number>` | アプリ側で管理（DB制約なし） |
| SCH-003 | `yearly_budgets` | TBL-003: members | `Record<string, number>` | アプリ側で管理（DB制約なし） |

---

## 5. インデックス一覧

パフォーマンス向上のために以下のインデックスが定義されています。

| ID | インデックス名 | テーブル | カラム | 用途 |
|----|------------|---------|-------|------|
| IDX-001 | `idx_members_role_id` | TBL-003: members | `role_id` | 役職別要員の絞り込み |
| IDX-002 | `idx_members_dept_id` | TBL-003: members | `dept_id` | 部門別要員の絞り込み |
| IDX-003 | `idx_allocations_project_id` | TBL-005: allocations | `project_id` | プロジェクト別アサインの絞り込み |
| IDX-004 | `idx_allocations_member_id` | TBL-005: allocations | `member_id` | 要員別アサインの絞り込み |
| IDX-005 | `idx_allocations_month` | TBL-005: allocations | `month` | 月別アサインの絞り込み |

---

## 6. Row Level Security（RLS）

全テーブルでRLSが有効化されています。

**現在の設定（確認済み事実）**:

- 全テーブルの SELECT / INSERT / UPDATE / DELETE 操作に対して `USING (true)` ポリシーが適用
- 認証なしの全ユーザーが全操作を実行可能

> SQLコメント（`supabase-schema.sql` より）:
> 「将来的に認証を追加する場合は、ここを修正してください」

詳細は[セキュリティ方針](../05_non_functional/security.md)を参照してください。

---

## 関連ドキュメント

- [テーブル定義詳細](./table_definitions.md)
- [データ規約](./data_conventions.md)
- [セキュリティ方針](../05_non_functional/security.md)
