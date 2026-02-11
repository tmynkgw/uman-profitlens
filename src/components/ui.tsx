"use client";
import type { Department } from "@/lib/data";
import { fmtM, fmtPct, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, X } from "lucide-react";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { "進行中": "bg-emerald-50 text-emerald-700 ring-emerald-200", "完了": "bg-slate-100 text-slate-600 ring-slate-200", "予定": "bg-amber-50 text-amber-700 ring-amber-200" };
  return <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-semibold ring-1", map[status] || map["予定"])}>{status}</span>;
}
const dc = ["text-indigo-600 bg-indigo-50 border-indigo-200", "text-cyan-600 bg-cyan-50 border-cyan-200", "text-violet-600 bg-violet-50 border-violet-200", "text-emerald-600 bg-emerald-50 border-emerald-200", "text-amber-600 bg-amber-50 border-amber-200", "text-pink-600 bg-pink-50 border-pink-200"];
export function DeptBadge({ deptId, depts = [] }: { deptId: string; depts?: Department[] }) {
  const idx = depts.findIndex(d => d.id === deptId); if (idx < 0) return null;
  return <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold border", dc[idx % dc.length])}>{depts[idx].name.replace(/部$/, "")}</span>;
}
export function KpiCard({ label, value, sub, trend, icon, colorClass = "text-indigo-600", bgClass }: { label: string; value: string; sub?: string; trend?: number; icon?: React.ReactNode; colorClass?: string; bgClass?: string }) {
  return (<div className={cn("rounded-2xl p-5 flex-1 min-w-[180px] border relative overflow-hidden shadow-sm", bgClass || "bg-white border-slate-200")}>
    <div className="flex justify-between items-start">
      <div>
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">{label}</div>
        <div className={cn("text-[22px] font-extrabold tracking-tight", colorClass)}>{value}</div>
        {sub && <div className="text-[11px] text-slate-400 mt-1">{sub}</div>}
        {trend !== undefined && (<div className={cn("flex items-center gap-1 mt-1 text-xs font-bold", trend >= 0 ? "text-emerald-600" : "text-red-500")}>
          {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}<span>{trend >= 0 ? "+" : ""}{fmtPct(trend)}</span>
        </div>)}
      </div>
      {icon && <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center opacity-80", bgClass ? "bg-white/20" : "bg-slate-100")}>{icon}</div>}
    </div>
  </div>);
}

/* ─── Donut Chart ─── */
export function DonutChart({ value, total, label, color = "#4f46e5", size = 100 }: { value: number; total: number; label: string; color?: string; size?: number }) {
  const pct = total > 0 ? Math.min(value / total, 1) : 0;
  const r = (size - 12) / 2; const c = 2 * Math.PI * r;
  const strokeVal = c * pct; const strokeRem = c - strokeVal;
  return (<div className="flex flex-col items-center">
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={`${strokeVal} ${strokeRem}`} strokeLinecap="round" className="transition-all duration-700" />
    </svg>
    <div className="absolute flex flex-col items-center justify-center" style={{width:size,height:size}}>
      <span className="text-[15px] font-extrabold" style={{color}}>{fmtPct(pct * 100)}</span>
    </div>
    <span className="text-[10px] text-slate-400 font-semibold mt-1">{label}</span>
  </div>);
}

/* ─── Grouped Bar Chart (Quarter comparison) ─── */
export function QuarterBarChart({ data }: { data: { label: string; budget: number; cost: number; profit: number }[] }) {
  const mx = Math.max(...data.flatMap(d => [d.budget, d.cost, Math.abs(d.profit)]), 1);
  const barH = (v: number) => `${Math.max((Math.abs(v) / mx) * 100, 4)}%`;
  return (<div className="flex gap-4 items-end h-[180px] w-full">
    {data.map((d, i) => (<div key={i} className="flex-1 flex flex-col items-center h-full">
      <div className="flex-1 flex items-end gap-[3px] w-full justify-center">
        <div className="flex flex-col items-center w-[22px]">
          <span className="text-[8px] font-bold text-indigo-500 mb-0.5">{d.budget > 0 ? fmtM(d.budget) : ""}</span>
          <div className="w-full rounded-t-[4px] bg-indigo-500/80 transition-all duration-500" style={{ height: barH(d.budget) }} />
        </div>
        <div className="flex flex-col items-center w-[22px]">
          <span className="text-[8px] font-bold text-pink-500 mb-0.5">{d.cost > 0 ? fmtM(d.cost) : ""}</span>
          <div className="w-full rounded-t-[4px] bg-pink-400/80 transition-all duration-500" style={{ height: barH(d.cost) }} />
        </div>
        <div className="flex flex-col items-center w-[22px]">
          <span className={cn("text-[8px] font-bold mb-0.5", d.profit >= 0 ? "text-emerald-500" : "text-red-500")}>{fmtM(d.profit)}</span>
          <div className={cn("w-full rounded-t-[4px] transition-all duration-500", d.profit >= 0 ? "bg-emerald-400/80" : "bg-red-400/80")} style={{ height: barH(d.profit) }} />
        </div>
      </div>
      <span className="text-[11px] text-slate-500 font-semibold mt-2">{d.label}</span>
    </div>))}
  </div>);
}

/* ─── Horizontal Bar (for member/project ranking) ─── */
export function HBar({ items, maxVal }: { items: { label: string; value: number; color: string; sub?: string }[]; maxVal?: number }) {
  const mx = maxVal || Math.max(...items.map(i => Math.abs(i.value)), 1);
  return (<div className="space-y-2.5">
    {items.map((it, i) => (<div key={i}>
      <div className="flex justify-between items-center mb-1"><span className="text-[12px] font-semibold truncate max-w-[140px]">{it.label}</span><div className="flex items-center gap-2"><span className="text-[12px] font-bold font-mono" style={{color:it.color}}>{fmtM(it.value)}</span>{it.sub&&<span className="text-[10px] text-slate-400">{it.sub}</span>}</div></div>
      <div className="h-[10px] rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{width:`${Math.min(Math.abs(it.value)/mx*100,100)}%`,background:it.color}}/></div>
    </div>))}
  </div>);
}

/* ─── Waterfall Chart ─── */
export function WaterfallChart({ budget, cost, profit }: { budget: number; cost: number; profit: number }) {
  const mx = Math.max(budget, cost, Math.abs(profit), 1);
  const h = (v: number) => Math.max((Math.abs(v) / mx) * 120, 8);
  return (<div className="flex items-end gap-6 justify-center h-[160px]">
    {[{ label: "売上予算", val: budget, color: "#6366f1" }, { label: "コスト", val: cost, color: "#ec4899" }, { label: "利益", val: profit, color: profit >= 0 ? "#10b981" : "#ef4444" }].map(b => (
      <div key={b.label} className="flex flex-col items-center">
        <span className="text-[11px] font-bold font-mono mb-1" style={{ color: b.color }}>{fmtM(b.val)}</span>
        <div className="w-[52px] rounded-t-lg transition-all duration-700" style={{ height: h(b.val), background: b.color, opacity: 0.85 }} />
        <span className="text-[10px] text-slate-500 font-semibold mt-2">{b.label}</span>
      </div>
    ))}
  </div>);
}

/* ─── Achievement Ring ─── */
export function AchievementRing({ pct, size = 56 }: { pct: number; size?: number }) {
  const r = (size - 8) / 2; const c = 2 * Math.PI * r;
  const p = Math.min(pct / 100, 1.5);
  const color = pct >= 100 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444";
  return (<div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5" strokeDasharray={`${c * Math.min(p, 1)} ${c * (1 - Math.min(p, 1))}`} strokeLinecap="round" className="transition-all duration-700" />
    </svg>
    <span className="absolute text-[11px] font-extrabold" style={{ color }}>{Math.round(pct)}%</span>
  </div>);
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (<div className="fixed inset-0 z-[1000] flex items-center justify-center" onClick={onClose}>
    <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" />
    <div className={cn("relative bg-white border border-slate-200 rounded-2xl p-8 max-h-[85vh] overflow-y-auto shadow-2xl", wide ? "min-w-[620px] max-w-[720px]" : "min-w-[440px] max-w-[560px]")} onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-slate-900">{title}</h3><button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={22} /></button></div>
      {children}
    </div>
  </div>);
}
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div className="mb-4"><label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>{children}</div>);
}
export const inputCls = "w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all";
export const selectCls = inputCls + " appearance-none cursor-pointer";
export const btnPrimaryCls = "inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-[13px] font-bold tracking-wide cursor-pointer hover:brightness-110 transition-all shadow-sm";
