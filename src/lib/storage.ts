"use client";
const STORAGE_KEY = "uman_profit_manager_v5";
export interface AppData {
  departments: import("./data").Department[];
  roles: import("./data").Role[];
  members: import("./data").Member[];
  projects: import("./data").Project[];
  allocations: import("./data").Allocation[];
}
const empty: AppData = { departments: [], roles: [], members: [], projects: [], allocations: [] };
function normalize(p: any): AppData {
  return {
    departments: p.departments || [],
    roles: p.roles || [],
    members: (p.members || []).map((m: any) => ({ ...m, roleId: m.roleId || "", yearlyBudgets: m.yearlyBudgets || {} })),
    projects: (p.projects || []).map((pr: any) => ({ ...pr, memberIds: pr.memberIds || [], quarterBudgets: pr.quarterBudgets || {} })),
    allocations: p.allocations || [],
  };
}
export function loadData(): AppData {
  if (typeof window === "undefined") return empty;
  try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return empty; return normalize(JSON.parse(raw)); } catch { return empty; }
}
export function saveData(data: AppData) { if (typeof window === "undefined") return; localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
export function exportData(data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = `profitlens_backup_${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url);
}
export function importData(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => { try { resolve(normalize(JSON.parse(e.target?.result as string))); } catch { reject(new Error("JSON解析失敗")); } };
    reader.onerror = () => reject(new Error("読み込み失敗")); reader.readAsText(file);
  });
}
