export const fmt = (n: number) => n.toLocaleString("ja-JP");
export const fmtM = (n: number) => {
  const a = Math.abs(n); const s = n < 0 ? "-" : "";
  if (a >= 100000000) return `${s}${(a / 100000000).toFixed(1)}億`;
  if (a >= 10000) return `${s}¥${(a / 10000).toFixed(0)}万`;
  return `${s}¥${fmt(Math.round(a))}`;
};
export const fmtPct = (n: number) => `${n.toFixed(1)}%`;
export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
export function genId(prefix: string, list: { id: string }[]): string {
  const nums = list.map(x => parseInt(x.id.replace(prefix, ""), 10)).filter(n => !isNaN(n));
  return prefix + String((nums.length > 0 ? Math.max(...nums) : 0) + 1).padStart(3, "0");
}
export function memberName(m: { lastName: string; firstName: string }): string {
  return `${m.lastName} ${m.firstName}`.trim();
}
