# Plan: docs/ 仕様書への仕様ID付与

## Context

前タスクで生成した21ファイルの要件定義ドキュメント (`docs/`) に対して、各仕様項目に一意のIDを付与する。
複数ドキュメントをまたいで同じ概念を参照する場合は **同一ID** を使い、整合性を保つことが最重要要件。

例えば `glossary.md` で定義した「アサイン」は `GL-003` という ID を持ち、
`tab_entry.md` や `data_conventions.md` がそれを参照する際も `GL-003` を使う。

---

## ID設計方針

### 1. 共有マスターID（複数ドキュメントをまたいで使用）

以下のIDは複数ファイルに出現し、同じIDで参照する。

| プレフィックス | 対象 | 範囲 | 定義元 |
|------------|------|------|--------|
| `GL-` | 用語（業務用語） | GL-001〜GL-025 | `glossary.md` |
| `RULE-FY-` | 会計年度ルール | RULE-FY-001〜RULE-FY-003 | `fiscal_year_rules.md` |
| `RULE-QTR-` | 四半期区分 | RULE-QTR-001〜RULE-QTR-004 | `fiscal_year_rules.md` |
| `RULE-KPI-` | KPI算出式 | RULE-KPI-001〜RULE-KPI-012 | `fiscal_year_rules.md` |
| `RULE-COLOR-` | 達成率・利益の色分けルール | RULE-COLOR-001〜RULE-COLOR-005 | `fiscal_year_rules.md` |
| `RULE-UNIT-` | 単位変換ルール | RULE-UNIT-001〜RULE-UNIT-003 | `fiscal_year_rules.md` |
| `TBL-` | DBテーブル名 | TBL-001〜TBL-005 | `schema_overview.md` |
| `COL-` | DBカラム（テーブルごとにサフィックス） | COL-DEP-01〜, COL-MBR-01〜 等 | `table_definitions.md` |
| `REL-` | テーブル間リレーション（FK） | REL-001〜REL-004 | `schema_overview.md` |
| `IDX-` | インデックス | IDX-001〜IDX-005 | `schema_overview.md` |
| `ENV-` | 環境変数 | ENV-001〜ENV-003 | `setup.md` |
| `COMP-` | UIコンポーネント | COMP-001〜COMP-010 | `frontend_structure.md` |

### 2. ドキュメント固有ID（そのファイル内だけで使用）

| プレフィックス | 対象ファイル | 例 |
|------------|------------|-----|
| `OV-` | `overview.md` | OV-001, OV-002 |
| `FY-` | `fiscal_year_rules.md` | FY-001, FY-002 |
| `DB-` | `tab_dashboard.md` | DB-001, DB-002 |
| `EN-` | `tab_entry.md` | EN-001, EN-002 |
| `PJ-` | `tab_projects.md` | PJ-001, PJ-002 |
| `MB-` | `tab_members.md` | MB-001, MB-002 |
| `DP-` | `tab_departments.md` | DP-001, DP-002 |
| `RL-` | `tab_roles.md` | RL-001, RL-002 |
| `SCH-` | `schema_overview.md` | SCH-001, SCH-002 |
| `TDF-` | `table_definitions.md` | TDF-001, TDF-002 |
| `CNV-` | `data_conventions.md` | CNV-001, CNV-002 |
| `TS-` | `tech_stack.md` | TS-001, TS-002 |
| `FE-` | `frontend_structure.md` | FE-001, FE-002 |
| `DF-` | `data_flow.md` | DF-001, DF-002 |
| `SEC-` | `security.md` | SEC-001, SEC-002 |
| `PF-` | `performance.md` | PF-001, PF-002 |
| `OPS-` | `setup.md` | OPS-001, OPS-002 |
| `DEMO-` | `demo_mode.md` | DEMO-001, DEMO-002 |
| `MIG-` | `data_migration.md` | MIG-001, MIG-002 |

---

## IDの付け方（フォーマット）

### テーブル行への付与
テーブルの先頭列に `ID` を追加する。

```markdown
| ID | 用語 | 定義 | 単位 |
|----|------|------|------|
| GL-001 | アサイン | ... | - |
| GL-002 | 工数 | ... | 時間/月 |
```

### 箇条書き・見出しへの付与
行の先頭に `**[ID]**` バッジとして付与する。

```markdown
- **[RULE-FY-001]** 会計年度は **4月始まり・3月締め** とする
```

### セクション見出しへの付与
見出し直下に `> ID: XXX-001` 形式で付与する（見出し自体には入れない）。

```markdown
## 1. アサイン登録
> ID: EN-001
```

---

## 共有IDの確定リスト

### GL-（用語）— glossary.md に定義
| ID | 用語 |
|----|------|
| GL-001 | アサイン |
| GL-002 | 工数 |
| GL-003 | コスト単価 |
| GL-004 | 月間コスト |
| GL-005 | 売上予算 |
| GL-006 | 年度予算 |
| GL-007 | 達成率 |
| GL-008 | 利益 |
| GL-009 | 利益率 |
| GL-010 | FY（会計年度） |
| GL-011 | Q1 |
| GL-012 | Q2 |
| GL-013 | Q3 |
| GL-014 | Q4 |
| GL-015 | 年度キー |
| GL-016 | 四半期キー |
| GL-017 | ステータス: 進行中 |
| GL-018 | ステータス: 完了 |
| GL-019 | ステータス: 予定 |
| GL-020 | 部門 |
| GL-021 | 役職（ロール） |
| GL-022 | 要員 |
| GL-023 | プロジェクト |
| GL-024 | 配分率 |
| GL-025 | CURRENT_MONTH |

### TBL-（DBテーブル）— schema_overview.md に定義
| ID | テーブル名 |
|----|-----------|
| TBL-001 | departments |
| TBL-002 | roles |
| TBL-003 | members |
| TBL-004 | projects |
| TBL-005 | allocations |

### REL-（リレーション）— schema_overview.md に定義
| ID | リレーション |
|----|------------|
| REL-001 | members.dept_id → departments.id |
| REL-002 | members.role_id → roles.id |
| REL-003 | allocations.member_id → members.id |
| REL-004 | allocations.project_id → projects.id |

### IDX-（インデックス）— schema_overview.md に定義
| ID | インデックス対象 |
|----|----------------|
| IDX-001 | members(dept_id) |
| IDX-002 | members(role_id) |
| IDX-003 | allocations(member_id) |
| IDX-004 | allocations(project_id) |
| IDX-005 | allocations(month) |

### ENV-（環境変数）— setup.md に定義
| ID | 変数名 |
|----|--------|
| ENV-001 | NEXT_PUBLIC_SUPABASE_URL |
| ENV-002 | NEXT_PUBLIC_SUPABASE_ANON_KEY |
| ENV-003 | NEXT_PUBLIC_IS_DEMO |

### COMP-（UIコンポーネント）— frontend_structure.md に定義
| ID | コンポーネント名 |
|----|----------------|
| COMP-001 | Card |
| COMP-002 | StatCard |
| COMP-003 | Badge |
| COMP-004 | Modal |
| COMP-005 | WaterfallChart |
| COMP-006 | QuarterBarChart |
| COMP-007 | HBar |
| COMP-008 | AchievementRing |
| COMP-009 | Toast |
| COMP-010 | Sidebar |

---

## 実装ステップ

### Step 1: 共有マスターIDを定義するファイルを先に更新

以下の順で更新し、共有IDを確定してから他ファイルを更新する。

1. `docs/01_business/glossary.md` — GL-001〜GL-025 定義
2. `docs/01_business/fiscal_year_rules.md` — RULE-FY-/RULE-QTR-/RULE-KPI-/RULE-COLOR-/RULE-UNIT- 定義
3. `docs/03_data/schema_overview.md` — TBL-/REL-/IDX- 定義
4. `docs/04_architecture/frontend_structure.md` — COMP- 定義
5. `docs/06_operations/setup.md` — ENV- 定義

### Step 2: 残りのファイルを並列更新（共有IDを参照しつつ固有IDを付与）

- `docs/01_business/overview.md` → OV- 固有ID
- `docs/02_functional/tab_dashboard.md` → DB- 固有ID
- `docs/02_functional/tab_entry.md` → EN- 固有ID
- `docs/02_functional/tab_projects.md` → PJ- 固有ID
- `docs/02_functional/tab_members.md` → MB- 固有ID
- `docs/02_functional/tab_departments.md` → DP- 固有ID
- `docs/02_functional/tab_roles.md` → RL- 固有ID
- `docs/03_data/table_definitions.md` → TDF- 固有ID + COL- カラムID
- `docs/03_data/data_conventions.md` → CNV- 固有ID
- `docs/04_architecture/tech_stack.md` → TS- 固有ID
- `docs/04_architecture/data_flow.md` → DF- 固有ID
- `docs/05_non_functional/security.md` → SEC- 固有ID
- `docs/05_non_functional/performance.md` → PF- 固有ID
- `docs/06_operations/demo_mode.md` → DEMO- 固有ID
- `docs/06_operations/data_migration.md` → MIG- 固有ID

### Step 3: index.md を最後に更新

index.md はリンク集なのでIDは振らない（ナビゲーション用途のため）。

---

## 変更対象ファイル

**既存21ファイルを編集（新規ファイルは作成しない）**:
- `docs/` 以下の全20ファイル（index.md を除く）

---

## 検証方法

1. **ID重複確認**: `grep -r "GL-001" docs/` で同じIDが複数ドキュメントに一貫して使われているか確認
2. **ID連番確認**: glossary.md の GL- が欠番なく GL-001〜GL-025 まで揃っているか確認
3. **共有ID整合性**: `grep -r "TBL-001" docs/` で TBL-001 = departments として各ドキュメントで正しく使われているか確認
4. **フォーマット統一**: テーブル行にはIDカラム、箇条書きには `**[ID]**` バッジが付いているか確認
5. **index.md への影響なし**: index.md にはIDが付与されていないことを確認
