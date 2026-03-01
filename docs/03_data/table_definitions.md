# テーブル定義詳細

> **根拠ソース**: [supabase-schema.sql](../../supabase-schema.sql)、[src/lib/supabase.ts](../../src/lib/supabase.ts)、[src/lib/data.ts](../../src/lib/data.ts)

---

## 1. TBL-001: departments（部門）

| ID | カラム名 | 型 | 制約 | 説明 |
|----|---------|-----|------|------|
| COL-DEP-01 | `id` | TEXT | PRIMARY KEY | `D001` 形式。アプリ側で自動採番（GL-017 参照） |
| COL-DEP-02 | `name` | TEXT | NOT NULL | 部門名。例: `戦略コンサルティング部` |
| COL-DEP-03 | `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時（アプリ画面には非表示） |

**サンプルデータ**（demo-data.sql より）:
- D001: 戦略コンサルティング部
- D002: ITコンサルティング部
- D003: 人事コンサルティング部

---

## 2. TBL-002: roles（役職）

| ID | カラム名 | 型 | 制約 | 説明 |
|----|---------|-----|------|------|
| COL-ROL-01 | `id` | TEXT | PRIMARY KEY | `R001` 形式。アプリ側で自動採番（GL-018 参照） |
| COL-ROL-02 | `name` | TEXT | NOT NULL | 役職名。例: `パートナー`、`マネージャー` |
| COL-ROL-03 | `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時（アプリ画面には非表示） |

**サンプルデータ**（demo-data.sql より）:
- R001: パートナー
- R002: マネージャー
- R003: シニアコンサルタント
- R004: コンサルタント
- R005: アナリスト

---

## 3. TBL-003: members（要員）

| ID | カラム名 | 型 | 制約 | 説明 |
|----|---------|-----|------|------|
| COL-MBR-01 | `id` | TEXT | PRIMARY KEY | `M001` 形式（GL-019 参照） |
| COL-MBR-02 | `last_name` | TEXT | NOT NULL | 姓 |
| COL-MBR-03 | `first_name` | TEXT | NOT NULL | 名 |
| COL-MBR-04 | `role_id` | TEXT | NOT NULL, FK→roles(id) ON DELETE CASCADE（REL-002） | 役職ID |
| COL-MBR-05 | `dept_id` | TEXT | NOT NULL, FK→departments(id) ON DELETE CASCADE（REL-001） | 部門ID |
| COL-MBR-06 | `start_month` | TEXT | NOT NULL | 参画開始月。`YYYY-MM` 形式。例: `2023-04` |
| COL-MBR-07 | `yearly_budgets` | JSONB | DEFAULT `'{}'` | 年度別目標予算（万円）。詳細は下表（SCH-003） |
| COL-MBR-08 | `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**yearly_budgets の値形式**（SCH-003）:

```json
{
  "FY2024": 3500,
  "FY2025": 4000
}
```

- キー: `FY{4桁年}` 形式（GL-011 年度キー参照）
- 値: 万円単位の数値（RULE-UNIT-001）

---

## 4. TBL-004: projects（プロジェクト）

| ID | カラム名 | 型 | 制約 | 説明 |
|----|---------|-----|------|------|
| COL-PRJ-01 | `id` | TEXT | PRIMARY KEY | `P001` 形式（GL-020 参照） |
| COL-PRJ-02 | `name` | TEXT | NOT NULL | プロジェクト名 |
| COL-PRJ-03 | `client` | TEXT | NOT NULL | クライアント名（顧客名） |
| COL-PRJ-04 | `status` | TEXT | NOT NULL, CHECK IN（'進行中','完了','予定'） | プロジェクトステータス（GL-014〜016） |
| COL-PRJ-05 | `start_date` | TEXT | NOT NULL | 開始月。`YYYY-MM-DD` 形式（UI入力は `YYYY-MM` だが DB保存時に `-01` を付加） |
| COL-PRJ-06 | `end_date` | TEXT | NOT NULL | 終了月。同上 |
| COL-PRJ-07 | `member_ids` | JSONB | DEFAULT `'[]'` | 参画要員IDの配列。詳細は下表（SCH-001） |
| COL-PRJ-08 | `quarter_budgets` | JSONB | DEFAULT `'{}'` | 四半期別売上予算（万円）。詳細は下表（SCH-002） |
| COL-PRJ-09 | `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**member_ids の値形式**（SCH-001）:

```json
["M001", "M002", "M003"]
```

- 要員IDの文字列配列
- 順序は保証されない

**quarter_budgets の値形式**（SCH-002）:

```json
{
  "FY2025-Q1": 1200,
  "FY2025-Q2": 1500,
  "FY2025-Q3": 800,
  "FY2025-Q4": 600
}
```

- キー: `{年度キー}-Q{1〜4}` 形式（GL-013 四半期キー参照）
- 値: 万円単位の数値（RULE-UNIT-001）

> **注意**: `start_date` と `end_date` はUI上では `YYYY-MM` 形式の月入力ですが、DBには `YYYY-MM-DD`（例: `2025-04-01`）として保存される場合があります。

---

## 5. TBL-005: allocations（アサイン）

| ID | カラム名 | 型 | 制約 | 説明 |
|----|---------|-----|------|------|
| COL-ALC-01 | `id` | TEXT | PRIMARY KEY | `A001` 形式（GL-021 参照） |
| COL-ALC-02 | `project_id` | TEXT | NOT NULL, FK→projects(id) ON DELETE CASCADE（REL-004） | プロジェクトID |
| COL-ALC-03 | `member_id` | TEXT | NOT NULL, FK→members(id) ON DELETE CASCADE（REL-003） | 要員ID |
| COL-ALC-04 | `month` | TEXT | NOT NULL | 対象月。`YYYY-MM` 形式。例: `2025-06` |
| COL-ALC-05 | `hours` | NUMERIC | NOT NULL | 稼働時間（GL-002 工数、時間単位）。例: `160` |
| COL-ALC-06 | `cost_rate` | NUMERIC | NOT NULL | GL-003 コスト単価（円/時間）。例: `5000` |
| COL-ALC-07 | `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**計算フィールド（DBには存在しない）**:

| 指標 | 算出式 | ID参照 |
|-----|-------|-------|
| 月間コスト | `hours × cost_rate`（円） | GL-004 |

---

## 6. アプリケーション層の型定義との対応

Supabaseの `snake_case` とアプリの `camelCase` の対応関係です。

| ID | DBカラム（snake_case） | Appフィールド（camelCase） | テーブル |
|----|---------------------|---------------------|---------|
| TDF-001 | `last_name` | `lastName` | TBL-003: members |
| TDF-002 | `first_name` | `firstName` | TBL-003: members |
| TDF-003 | `role_id` | `roleId` | TBL-003: members |
| TDF-004 | `dept_id` | `deptId` | TBL-003: members |
| TDF-005 | `start_month` | `startMonth` | TBL-003: members |
| TDF-006 | `yearly_budgets` | `yearlyBudgets` | TBL-003: members |
| TDF-007 | `start_date` | `startDate` | TBL-004: projects |
| TDF-008 | `end_date` | `endDate` | TBL-004: projects |
| TDF-009 | `member_ids` | `memberIds` | TBL-004: projects |
| TDF-010 | `quarter_budgets` | `quarterBudgets` | TBL-004: projects |
| TDF-011 | `project_id` | `projectId` | TBL-005: allocations |
| TDF-012 | `member_id` | `memberId` | TBL-005: allocations |
| TDF-013 | `cost_rate` | `costRate` | TBL-005: allocations |

---

## 関連ドキュメント

- [スキーマ概要・ER図](./schema_overview.md)
- [データ規約](./data_conventions.md)
- [データフロー設計](../04_architecture/data_flow.md)
