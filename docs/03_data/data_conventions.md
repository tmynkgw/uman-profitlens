# データ規約・JSONB仕様・命名変換ルール

> **根拠ソース**: [src/lib/utils.ts](../../src/lib/utils.ts)（`genId`）、[src/lib/storage.ts](../../src/lib/storage.ts)（型変換関数）

---

## 1. ID採番ルール

> ID: CNV-001

すべてのエンティティIDは **プレフィックス + 3桁ゼロパディングの連番** で自動採番します。

### 採番ロジック（`genId` 関数）

```
次のID = プレフィックス + (既存IDの最大番号 + 1) を3桁でゼロパディング
```

### 具体例

| 既存ID一覧 | 次に生成されるID |
|-----------|---------------|
| [D001, D002, D003] | D004 |
| [D001, D003]（D002が欠番） | D004（欠番は補完しない） |
| []（空） | D001 |

### プレフィックス一覧（GL-017〜021 参照）

| ID | エンティティ | プレフィックス |
|----|------------|-------------|
| GL-017 | 部門 | `D` |
| GL-018 | 役職 | `R` |
| GL-019 | 要員 | `M` |
| GL-020 | プロジェクト | `P` |
| GL-021 | アサイン | `A` |

---

## 2. JSONB フィールド仕様

### 2.1 yearly_budgets（TBL-003: members テーブル）

> ID: CNV-010（SCH-003 参照）

要員の年度別目標予算を格納します。

**形式**:
```json
{
  "FY2024": 3500,
  "FY2025": 4000
}
```

| 項目 | 仕様 |
|-----|------|
| キー形式 | `FY{4桁年}` 文字列（GL-011 年度キー形式） |
| 値の型 | 数値（整数または小数） |
| 単位 | 万円（RULE-UNIT-001） |
| デフォルト値 | `{}` （空オブジェクト） |

### 2.2 quarter_budgets（TBL-004: projects テーブル）

> ID: CNV-011（SCH-002 参照）

プロジェクトの四半期別売上予算を格納します。

**形式**:
```json
{
  "FY2025-Q1": 1200,
  "FY2025-Q2": 1500,
  "FY2025-Q3": 800,
  "FY2025-Q4": 600
}
```

| 項目 | 仕様 |
|-----|------|
| キー形式 | `{年度キー}-Q{1〜4}` 文字列（GL-013 四半期キー形式） |
| 値の型 | 数値（整数または小数） |
| 単位 | 万円（RULE-UNIT-001） |
| デフォルト値 | `{}` （空オブジェクト） |

### 2.3 member_ids（TBL-004: projects テーブル）

> ID: CNV-012（SCH-001 参照）

プロジェクトに参画している要員IDの配列を格納します。

**形式**:
```json
["M001", "M002", "M003"]
```

| 項目 | 仕様 |
|-----|------|
| 要素の型 | 文字列（要員IDフォーマット、GL-019 参照） |
| 順序 | 保証なし |
| デフォルト値 | `[]`（空配列） |
| 整合性 | DB外部キー制約なし。要員削除時にアプリ側でフィルタリング |

---

## 3. snake_case / camelCase 変換ルール

> ID: CNV-020

Supabase（DB）側は `snake_case`、Reactアプリ側は `camelCase` を使用します。
変換は `src/lib/storage.ts` の専用関数が集中管理します。

### 変換関数一覧

| ID | 変換方向 | 関数名 | 対象テーブル |
|----|---------|-------|------------|
| CNV-021 | DB → App | `toAppMember` | TBL-003: members |
| CNV-022 | App → DB | `toDBMember` | TBL-003: members |
| CNV-023 | DB → App | `toAppProject` | TBL-004: projects |
| CNV-024 | App → DB | `toDBProject` | TBL-004: projects |
| CNV-025 | DB → App | `toAppAllocation` | TBL-005: allocations |
| CNV-026 | App → DB | `toDBAllocation` | TBL-005: allocations |

> `departments` と `roles` はフィールド名が `id` と `name` のみのため、変換関数なしで直接使用しています。

### インポート時の正規化

- **[CNV-027]** JSON インポート時は `normalizeImportedData()` 関数が `snake_case` / `camelCase` 両形式に対応します。

```
localStorage形式（camelCase）→ normalizeImportedData → AppData（camelCase）
Supabase直エクスポート形式（snake_case）→ normalizeImportedData → AppData（camelCase）
```

---

## 4. 日時・日付の形式

| ID | 用途 | 形式 | 例 | 備考 |
|----|-----|------|----|------|
| CNV-030 | 月（汎用） | `YYYY-MM` | `2025-06` | TBL-005: allocations.month, TBL-003: members.start_month |
| CNV-031 | 日付（プロジェクト期間） | `YYYY-MM-DD` | `2025-04-01` | TBL-004: projects.start_date / end_date |
| CNV-032 | タイムスタンプ | TIMESTAMPTZ | `2025-06-01T00:00:00+09:00` | 各テーブルの created_at |

> UIの入力フォームは `month` 型（`YYYY-MM`）を使用していますが、DBには `-01` が付加された `YYYY-MM-DD` 形式で保存される場合があります。

---

## 5. 後方互換：localStorage キー

> ID: CNV-040

旧バージョン（v5以前）からの移行のため、以下のlocalStorageキーが参照されます。

| ID | キー | 用途 |
|----|-----|------|
| CNV-041 | `uman_profit_manager_v5` | v5以前のデータを Supabase に自動移行するための後方互換処理 |

アプリ起動時に `migrateFromLocalStorage()` が自動実行され、このキーにデータが存在する場合はSupabaseに移行します。
移行後もlocalStorageのデータは削除されずに残ります（バックアップとして機能）。

---

## 関連ドキュメント

- [テーブル定義詳細](./table_definitions.md)
- [スキーマ概要・ER図](./schema_overview.md)
- [データフロー設計](../04_architecture/data_flow.md)
