"use client";
import { supabase } from './supabase';
import type { Department as DBDepartment, Role as DBRole, Member as DBMember, Project as DBProject, Allocation as DBAllocation } from './supabase';

// アプリケーション内で使う型定義(camelCase) - data.tsと同じ
export interface Department {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface Member {
  id: string;
  lastName: string;
  firstName: string;
  roleId: string;
  deptId: string;
  startMonth: string;
  yearlyBudgets?: Record<string, number>;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: "進行中" | "完了" | "予定";
  startDate: string;
  endDate: string;
  memberIds: string[];
  quarterBudgets: Record<string, number>;
}

export interface Allocation {
  id: string;
  projectId: string;
  memberId: string;
  month: string;
  hours: number;
  costRate: number;
}

export interface AppData {
  departments: Department[];
  roles: Role[];
  members: Member[];
  projects: Project[];
  allocations: Allocation[];
}

const empty: AppData = {
  departments: [],
  roles: [],
  members: [],
  projects: [],
  allocations: []
};

// ===== localStorage関連 (データ移行用) =====

const LEGACY_STORAGE_KEY = "uman_profit_manager_v5";

/**
 * localStorageから既存データを取得（移行用）
 */
function loadLegacyData(): AppData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeImportedData(parsed);
  } catch {
    return null;
  }
}

/**
 * localStorageからSupabaseへのデータ移行
 * @returns 移行されたデータ件数、または null（移行不要の場合）
 */
export async function migrateFromLocalStorage(): Promise<number | null> {
  const legacyData = loadLegacyData();
  if (!legacyData) return null; // 移行するデータがない

  // 合計件数を計算
  const totalCount =
    legacyData.departments.length +
    legacyData.roles.length +
    legacyData.members.length +
    legacyData.projects.length +
    legacyData.allocations.length;

  if (totalCount === 0) return null; // データが空

  // Supabaseに保存
  await saveData(legacyData);

  // localStorageをクリア（バックアップとして残しておく場合はコメントアウト）
  // localStorage.removeItem(LEGACY_STORAGE_KEY);

  return totalCount;
}

// ===== 変換ヘルパー関数 (snake_case ↔ camelCase) =====

/** Supabase Member (snake_case) → App Member (camelCase) */
function toAppMember(dbMember: DBMember): Member {
  return {
    id: dbMember.id,
    lastName: dbMember.last_name,
    firstName: dbMember.first_name,
    roleId: dbMember.role_id,
    deptId: dbMember.dept_id,
    startMonth: dbMember.start_month,
    yearlyBudgets: dbMember.yearly_budgets || {},
  };
}

/** App Member (camelCase) → Supabase Member (snake_case) */
function toDBMember(appMember: Member): Omit<DBMember, 'created_at'> {
  return {
    id: appMember.id,
    last_name: appMember.lastName,
    first_name: appMember.firstName,
    role_id: appMember.roleId,
    dept_id: appMember.deptId,
    start_month: appMember.startMonth,
    yearly_budgets: appMember.yearlyBudgets || {},
  };
}

/** Supabase Project (snake_case) → App Project (camelCase) */
function toAppProject(dbProject: DBProject): Project {
  return {
    id: dbProject.id,
    name: dbProject.name,
    client: dbProject.client,
    status: dbProject.status,
    startDate: dbProject.start_date,
    endDate: dbProject.end_date,
    memberIds: dbProject.member_ids || [],
    quarterBudgets: dbProject.quarter_budgets || {},
  };
}

/** App Project (camelCase) → Supabase Project (snake_case) */
function toDBProject(appProject: Project): Omit<DBProject, 'created_at'> {
  return {
    id: appProject.id,
    name: appProject.name,
    client: appProject.client,
    status: appProject.status,
    start_date: appProject.startDate,
    end_date: appProject.endDate,
    member_ids: appProject.memberIds || [],
    quarter_budgets: appProject.quarterBudgets || {},
  };
}

/** Supabase Allocation (snake_case) → App Allocation (camelCase) */
function toAppAllocation(dbAlloc: DBAllocation): Allocation {
  return {
    id: dbAlloc.id,
    projectId: dbAlloc.project_id,
    memberId: dbAlloc.member_id,
    month: dbAlloc.month,
    hours: dbAlloc.hours,
    costRate: dbAlloc.cost_rate,
  };
}

/** App Allocation (camelCase) → Supabase Allocation (snake_case) */
function toDBAllocation(appAlloc: Allocation): Omit<DBAllocation, 'created_at'> {
  return {
    id: appAlloc.id,
    project_id: appAlloc.projectId,
    member_id: appAlloc.memberId,
    month: appAlloc.month,
    hours: appAlloc.hours,
    cost_rate: appAlloc.costRate,
  };
}

// ===== データ操作関数 =====

/**
 * Supabaseからデータを取得
 */
export async function loadData(): Promise<AppData> {
  try {
    const [depts, roles, members, projects, allocations] = await Promise.all([
      supabase.from('departments').select('*'),
      supabase.from('roles').select('*'),
      supabase.from('members').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('allocations').select('*'),
    ]);

    // エラーチェック
    if (depts.error) throw depts.error;
    if (roles.error) throw roles.error;
    if (members.error) throw members.error;
    if (projects.error) throw projects.error;
    if (allocations.error) throw allocations.error;

    // snake_case → camelCase 変換
    return {
      departments: depts.data || [],
      roles: roles.data || [],
      members: (members.data || []).map(toAppMember),
      projects: (projects.data || []).map(toAppProject),
      allocations: (allocations.data || []).map(toAppAllocation),
    };
  } catch (error) {
    console.error('Failed to load data from Supabase:', error);
    return empty;
  }
}

/**
 * Supabaseにデータを保存（全体の置き換え）
 * 注意: この実装は既存データを全削除してから新規挿入します
 */
export async function saveData(data: AppData): Promise<void> {
  try {
    // トランザクション的な処理（Supabaseには明示的なトランザクションがないため、順次実行）

    // 1. 既存データを全削除（外部キー制約の順番に注意）
    await supabase.from('allocations').delete().neq('id', ''); // 全削除
    await supabase.from('projects').delete().neq('id', '');
    await supabase.from('members').delete().neq('id', '');
    await supabase.from('roles').delete().neq('id', '');
    await supabase.from('departments').delete().neq('id', '');

    // 2. 新しいデータを挿入（外部キー制約の順番に注意）
    if (data.departments.length > 0) {
      const { error: deptError } = await supabase.from('departments').insert(data.departments);
      if (deptError) throw deptError;
    }

    if (data.roles.length > 0) {
      const { error: roleError } = await supabase.from('roles').insert(data.roles);
      if (roleError) throw roleError;
    }

    if (data.members.length > 0) {
      const dbMembers = data.members.map(toDBMember);
      const { error: memberError } = await supabase.from('members').insert(dbMembers);
      if (memberError) throw memberError;
    }

    if (data.projects.length > 0) {
      const dbProjects = data.projects.map(toDBProject);
      const { error: projectError } = await supabase.from('projects').insert(dbProjects);
      if (projectError) throw projectError;
    }

    if (data.allocations.length > 0) {
      const dbAllocations = data.allocations.map(toDBAllocation);
      const { error: allocError } = await supabase.from('allocations').insert(dbAllocations);
      if (allocError) throw allocError;
    }

    console.log('Data saved to Supabase successfully');
  } catch (error) {
    console.error('Failed to save data to Supabase:', error);
    throw error;
  }
}

/**
 * データをJSONファイルとしてエクスポート
 */
export async function exportData(data: AppData): Promise<void> {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `profitlens_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * JSONファイルからデータをインポート
 */
export function importData(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const normalized = normalizeImportedData(parsed);
        resolve(normalized);
      } catch (error) {
        reject(new Error('JSON解析失敗'));
      }
    };
    reader.onerror = () => reject(new Error('読み込み失敗'));
    reader.readAsText(file);
  });
}

/**
 * インポートされたデータの正規化
 * localStorage形式(camelCase)とSupabase形式(snake_case)の両方に対応
 */
function normalizeImportedData(data: any): AppData {
  return {
    departments: (data.departments || []).map((d: any) => ({
      id: d.id,
      name: d.name,
    })),
    roles: (data.roles || []).map((r: any) => ({
      id: r.id,
      name: r.name,
    })),
    members: (data.members || []).map((m: any) => ({
      id: m.id,
      lastName: m.last_name || m.lastName || '',
      firstName: m.first_name || m.firstName || '',
      roleId: m.role_id || m.roleId || '',
      deptId: m.dept_id || m.deptId || '',
      startMonth: m.start_month || m.startMonth || '',
      yearlyBudgets: m.yearly_budgets || m.yearlyBudgets || {},
    })),
    projects: (data.projects || []).map((p: any) => ({
      id: p.id,
      name: p.name || '',
      client: p.client || '',
      status: p.status || '進行中',
      startDate: p.start_date || p.startDate || '',
      endDate: p.end_date || p.endDate || '',
      memberIds: p.member_ids || p.memberIds || [],
      quarterBudgets: p.quarter_budgets || p.quarterBudgets || {},
    })),
    allocations: (data.allocations || []).map((a: any) => ({
      id: a.id,
      projectId: a.project_id || a.projectId || '',
      memberId: a.member_id || a.memberId || '',
      month: a.month || '',
      hours: Number(a.hours || 0),
      costRate: Number(a.cost_rate || a.costRate || 0),
    })),
  };
}
