export interface Department { id: string; name: string; }
export interface Role { id: string; name: string; }
export interface Member {
  id: string; lastName: string; firstName: string; roleId: string; deptId: string; startMonth: string;
  yearlyBudgets?: Record<string, number>;
}
export interface Project {
  id: string; name: string; client: string; status: "進行中" | "完了" | "予定";
  startDate: string; endDate: string; memberIds: string[];
  /** 年度×四半期の売上予算(万円) key="FY2025-Q1" ... "FY2025-Q4" */
  quarterBudgets: Record<string, number>;
}
export interface Allocation {
  id: string; projectId: string; memberId: string; month: string; hours: number;
  costRate: number;
}
export const CURRENT_MONTH = "2025-06";

export function monthToFY(m: string): string {
  const [y, mo] = m.split("-").map(Number);
  return mo >= 4 ? `FY${y}` : `FY${y - 1}`;
}
/** FY quarter from month: 2025-04→Q1, 2025-07→Q2, 2025-10→Q3, 2026-01→Q4 */
export function monthToFYQ(m: string): { fy: string; q: number } {
  const [y, mo] = m.split("-").map(Number);
  const fy = mo >= 4 ? `FY${y}` : `FY${y - 1}`;
  const fym = mo >= 4 ? mo - 3 : mo + 9; // 4月=1, 5月=2, ... 3月=12
  const q = Math.ceil(fym / 3);
  return { fy, q };
}
export function fyMonths(fy: string): string[] {
  const y = parseInt(fy.replace("FY", ""), 10);
  const r: string[] = [];
  for (let mo = 4; mo <= 12; mo++) r.push(`${y}-${String(mo).padStart(2, "0")}`);
  for (let mo = 1; mo <= 3; mo++) r.push(`${y + 1}-${String(mo).padStart(2, "0")}`);
  return r;
}
/** Q1=4-6月, Q2=7-9月, Q3=10-12月, Q4=1-3月 */
export function fyQMonths(fy: string, q: number): string[] {
  const y = parseInt(fy.replace("FY", ""), 10);
  if (q === 1) return [`${y}-04`, `${y}-05`, `${y}-06`];
  if (q === 2) return [`${y}-07`, `${y}-08`, `${y}-09`];
  if (q === 3) return [`${y}-10`, `${y}-11`, `${y}-12`];
  return [`${y + 1}-01`, `${y + 1}-02`, `${y + 1}-03`];
}
export function fyLabel(fy: string): string {
  return `${fy.replace("FY", "")}年度`;
}
export function getAllFYs(allocs: Allocation[], projects: Project[]): string[] {
  const fys = new Set<string>();
  allocs.forEach(a => fys.add(monthToFY(a.month)));
  projects.forEach(p => Object.keys(p.quarterBudgets).forEach(k => { const m = k.match(/^(FY\d+)/); if (m) fys.add(m[1]); }));
  return [...fys].sort();
}
