# フロントエンド構成・コンポーネント設計

> **根拠ソース**: [src/](../../src/) ディレクトリ全体

---

## 1. ディレクトリ構成

```
src/
├── app/
│   ├── globals.css       ← Tailwind CSS v4 インポート + カスタムアニメーション
│   ├── layout.tsx        ← HTMLルート・メタデータ・フォント設定
│   └── page.tsx          ← メインアプリケーション（全機能が1ファイルに集約）
├── components/
│   └── ui.tsx            ← 汎用UIコンポーネント群
└── lib/
    ├── data.ts           ← 型定義・会計年度ユーティリティ関数
    ├── storage.ts        ← Supabaseデータ操作・型変換・インポート/エクスポート
    ├── supabase.ts       ← Supabaseクライアント初期化・DB層型定義
    └── utils.ts          ← 数値フォーマット・ID生成・ユーティリティ関数
```

---

## 2. 各ファイルの責務

| ID | ファイル | 責務 |
|----|---------|------|
| FE-001 | [app/layout.tsx](../../src/app/layout.tsx) | HTMLルート構造・ページタイトル・Noto Sans JPフォント読み込み・DEMO/本番でのメタデータ切り替え |
| FE-002 | [app/page.tsx](../../src/app/page.tsx) | 全機能の状態管理・CRUD操作・計算ロジック・6タブ全ての画面レンダリング |
| FE-003 | [app/globals.css](../../src/app/globals.css) | `@import "tailwindcss"` + `@keyframes slideIn`（トースト通知アニメーション） |
| FE-004 | [components/ui.tsx](../../src/components/ui.tsx) | 再利用可能な汎用UIコンポーネント（チャート・バッジ・モーダル等） |
| FE-005 | [lib/data.ts](../../src/lib/data.ts) | アプリ層の型定義（camelCase）・会計年度計算関数 |
| FE-006 | [lib/storage.ts](../../src/lib/storage.ts) | Supabaseからのデータ読み書き・snake_case↔camelCase変換・インポート/エクスポート |
| FE-007 | [lib/supabase.ts](../../src/lib/supabase.ts) | Supabaseクライアントのシングルトン・DB層の型定義（snake_case） |
| FE-008 | [lib/utils.ts](../../src/lib/utils.ts) | 数値フォーマット（`fmtM`, `fmt`, `fmtPct`）・ID採番（`genId`）・クラス結合（`cn`） |

---

## 3. page.tsx のモノリシック構成

[page.tsx](../../src/app/page.tsx) はプロジェクトの中核ファイルであり、以下の全機能が1ファイルに集約されています。

| ID | 責務カテゴリ | 具体的な内容 |
|----|------------|------------|
| FE-010 | **データ状態管理** | depts / roles / members / projects / allocs の useState |
| FE-011 | **UI状態管理** | タブ選択・モーダル・確認ダイアログ・トースト・ローディング |
| FE-012 | **フォーム状態** | dForm / rForm / mForm / pForm / aForm（各エンティティ用） |
| FE-013 | **CRUD操作** | saveDept / deleteRole / saveMember / deleteProject / saveAlloc 等 |
| FE-014 | **計算ロジック（useMemo）** | fyAllocs / projectPL / memberStats / totals / qTotals / deptStats |
| FE-015 | **データ読み込み** | useEffect による初回 loadData() 実行 |
| FE-016 | **自動保存** | useEffect による saveData() の自動実行 |
| FE-017 | **6タブの画面** | dashboard / entry / projects / members / departments / roles の全レンダリング |
| FE-018 | **モーダル** | 5種類のエンティティ × Add/Edit の全フォームUI |

---

## 4. ui.tsx のコンポーネント一覧

[src/components/ui.tsx](../../src/components/ui.tsx) で定義されている全コンポーネントです。

| ID | コンポーネント名 | 役割 |
|----|---------------|------|
| COMP-001 | `StatusBadge` | プロジェクトステータスのカラーバッジ（予定/進行中/完了） |
| COMP-002 | `DeptBadge` | 部門名の6色ローテーションカラーバッジ |
| COMP-003 | `KpiCard` | ダッシュボード用KPI数値カード（アイコン・数値・補足テキスト） |
| COMP-004 | `DonutChart` | ドーナツ型グラフ（コード内に定義あり）※推測（要確認）: 現在の画面で使用箇所不明 |
| COMP-005 | `QuarterBarChart` | 四半期比較グループ棒グラフ（予算/コスト/利益の3系列）。外部ライブラリ不使用・CSS実装 |
| COMP-006 | `HBar` | 水平バーチャート（プロジェクト利益ランキング等に使用） |
| COMP-007 | `WaterfallChart` | ウォーターフォール棒グラフ（年度サマリー表示） |
| COMP-008 | `AchievementRing` | 達成率を円環で表現するコンポーネント（SVG + strokeDasharray） |
| COMP-009 | `Modal` | モーダルダイアログ（タイトル・子要素・フッターボタンを受け取る） |
| COMP-010 | `Field` | フォームフィールドラッパー（ラベル + 入力要素のセット） |

**共通スタイル定数**（コンポーネントではなくCSSクラス文字列）:

| 定数名 | 用途 |
|-------|------|
| `inputCls` | テキスト入力フィールドの共通スタイル |
| `selectCls` | セレクトボックスの共通スタイル |
| `btnPrimaryCls` | プライマリボタンの共通スタイル |

---

## 5. 状態管理の方針

> ID: FE-020

- **[FE-021]** グローバル状態管理ライブラリ（Redux/Zustand等）は使用しない
- **[FE-022]** 全データを [page.tsx](../../src/app/page.tsx) の `useState` でトップレベルに管理
- **[FE-023]** 計算済み値は `useMemo` でメモ化し、不要な再計算を防止
- **[FE-024]** `useCallback` で `persist`（保存）関数をメモ化

---

## 6. 自動保存のメカニズム

> ID: FE-030

```
State変更（setDepts, setMembers 等）
     ↓
persist コールバック（useCallback）が更新される
     ↓
useEffect（persist を依存配列に持つ）が発火
     ↓
saveData() を実行（Supabaseに全データを保存）
```

**重要な制御フラグ**:

- **[FE-031]** `loaded` フラグ: 初回データ読み込み完了前（`loaded=false`）は保存をスキップ
- **[FE-032]** これにより、初期化時の空データでSupabaseの既存データが上書きされることを防止

---

## 7. レイアウト構造

> ID: FE-040

```
┌─────────────────────────────────────────────────────────────┐
│  min-h-screen flex                                          │
├─────────────────────┬───────────────────────────────────────┤
│  SIDEBAR (w-230px)  │  MAIN CONTENT (flex-1)               │
│                     │                                       │
│  ロゴ               │  ┌─────────────────────────────────┐  │
│  ("ProfitLens"      │  │ 年度セレクター                   │  │
│   or "... DEMO")    │  │ タイトル                         │  │
│                     │  │ DEMOバナー（IS_DEMO=trueのみ）   │  │
│  ナビメニュー        │  ├─────────────────────────────────┤  │
│  - ダッシュボード    │  │ タブコンテンツ                   │  │
│  - アサイン登録      │  │                                  │  │
│  - プロジェクト      │  │ dashboard / entry / projects /  │  │
│  - 要員DB           │  │ members / departments / roles   │  │
│  - 部門DB           │  │                                  │  │
│  - ロールDB         │  └─────────────────────────────────┘  │
│                     │                                       │
│  区切り線           │                                       │
│  [エクスポート]     │                                       │
│  [インポート]       │                                       │
│  "自動保存: ON"     │                                       │
└─────────────────────┴───────────────────────────────────────┘
```

---

## 関連ドキュメント

- [技術スタック](./tech_stack.md)
- [データフロー設計](./data_flow.md)
- [ダッシュボード機能仕様](../02_functional/tab_dashboard.md)
