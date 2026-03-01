# データフロー設計

> **根拠ソース**: [src/lib/storage.ts](../../src/lib/storage.ts)、[src/app/page.tsx](../../src/app/page.tsx)

---

## 1. データ読み込みフロー（初期化時）

> ID: DF-001

アプリ起動時（`useEffect` のマウント）に以下の順序でデータを読み込みます。

```
┌─────────────────────────────────────────────────┐
│ アプリ起動 (useEffect on mount)                   │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ [DF-002] ① migrateFromLocalStorage()             │
│   localStorage("uman_profit_manager_v5")を確認   │
│   ├─ データあり → saveData() → トースト表示        │
│   └─ データなし → スキップ                        │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ [DF-003] ② loadData() - Promise.all で5テーブル並列取得 │
│   supabase.from('departments').select('*')       │
│   supabase.from('roles').select('*')             │
│   supabase.from('members').select('*')           │
│   supabase.from('projects').select('*')          │
│   supabase.from('allocations').select('*')       │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ [DF-004] ③ 型変換（snake_case → camelCase）      │
│   toAppMember() / toAppProject() /               │
│   toAppAllocation()                              │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ [DF-005] ④ React State に格納                    │
│   setDepts / setRoles / setMembers /             │
│   setProjects / setAllocs                        │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ [DF-006] ⑤ setLoaded(true) → 自動保存が有効化    │
└─────────────────────────────────────────────────┘
```

---

## 2. データ保存フロー（CRUD操作後）

> ID: DF-010

ユーザーが追加・編集・削除を行うたびに自動保存が実行されます。

```
┌─────────────────────────────────────────────────┐
│ [DF-011] ユーザー操作（追加/編集/削除）            │
│  例: saveDept(), deleteMember(), saveAlloc()     │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ [DF-012] React State 更新                        │
│  setDepts([...]) / setMembers([...]) 等          │
└────────────────────┬────────────────────────────┘
                     │ loaded=true の場合のみ
                     ▼
┌─────────────────────────────────────────────────┐
│ [DF-013] persist() (useCallback) が依存配列の変化を検知 │
│ ↓ useEffect 発火                                │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ [DF-014] saveData() - Supabaseへの全データ保存    │
│                                                  │
│ [削除フェーズ] 外部キー制約順に全削除              │
│  allocations → projects → members → roles →     │
│  departments                                     │
│                                                  │
│ [挿入フェーズ] 外部キー制約順に全挿入              │
│  departments → roles → members → projects →     │
│  allocations                                     │
└─────────────────────────────────────────────────┘
```

### 保存方式の重要な注意点

| ID | 項目 | 内容 |
|----|-----|------|
| DF-020 | **保存方式** | 全削除 → 全挿入（差分更新ではない） |
| DF-021 | **トランザクション** | なし（Supabase REST APIで明示的なトランザクションは未使用） |
| DF-022 | **同時編集** | 非対応（複数ユーザーや複数タブから同時に操作すると上書きが発生する可能性） |
| DF-023 | **エラー時の影響** | 保存処理の途中でエラーが発生すると、削除済み・未挿入のデータが混在するリスクがある |

---

## 3. データ変換レイヤー

> ID: DF-030

Supabase（DB）側とアプリ（React）側で命名規則が異なるため、`storage.ts` で変換を集中管理しています（CNV-020〜026 参照）。

```
┌─────────────────────────┐    変換    ┌─────────────────────────┐
│  Supabase（snake_case）  │ ────────→ │  App（camelCase）        │
│  last_name              │           │  lastName               │
│  dept_id                │ toAppXxx  │  deptId                 │
│  role_id                │           │  roleId                 │
│  start_month            │ ←──────── │  startMonth             │
│  yearly_budgets         │ toDBXxx   │  yearlyBudgets          │
│  project_id             │           │  projectId              │
│  cost_rate              │           │  costRate               │
└─────────────────────────┘           └─────────────────────────┘
```

---

## 4. インポート・エクスポートフロー

### エクスポート

> ID: DF-040

```
[DF-041] サイドバー「エクスポート」ボタンクリック
     ↓
exportData(currentState) 呼び出し
     ↓
AppData（camelCase）をJSONシリアライズ
     ↓
ブラウザのダウンロード API でファイル保存
     ファイル名: profitlens_backup_YYYY-MM-DD.json
```

### インポート

> ID: DF-050

```
[DF-051] サイドバー「インポート」ボタンクリック → ファイル選択ダイアログ
     ↓
importData(file) 呼び出し
     ↓
FileReader で JSON 解析
     ↓
normalizeImportedData() で camelCase / snake_case 両形式に対応（CNV-027 参照）
     ↓
React State を更新（setDepts, setMembers 等）
     ↓
自動保存（persist → saveData）が発火
     ↓
トースト「インポート完了」を表示
```

- **[DF-052]** **注意**: インポートを実行すると現在の Supabase上の全データが **インポートデータで置換** されます。

---

## 5. 計算データの流れ

> ID: DF-060

データはSupabaseから取得後、`useMemo` で様々な計算済み値に変換されます。

```
Raw State（depts, roles, members, projects, allocs）
     ↓
[DF-061] fyAllocs = allocs.filter(当年度の月のみ)
     ↓
[DF-062] projectPL = projects.map(各プロジェクトの四半期損益計算)
[DF-063] memberStats = members.map(各要員の達成率計算)
[DF-064] totals = 全社合計KPI
[DF-065] qTotals = 四半期別合計
[DF-066] deptStats = 部門別集計
     ↓
各タブのUI（ダッシュボード・要員DB等）に表示
```

---

## 関連ドキュメント

- [フロントエンド構成](./frontend_structure.md)
- [技術スタック](./tech_stack.md)
- [データ移行・バックアップ](../06_operations/data_migration.md)
- [セキュリティ方針](../05_non_functional/security.md)
