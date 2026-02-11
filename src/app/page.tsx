"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { LayoutGrid, FolderOpen, Users, Building2, PenLine, Plus, Check, Pencil, Trash2, AlertTriangle, Download, Upload, Database, UserPlus, ChevronRight, Briefcase, DollarSign, TrendingUp, BarChart3, Target } from "lucide-react";
import { CURRENT_MONTH, monthToFY, monthToFYQ, fyMonths, fyQMonths, fyLabel, getAllFYs, type Department, type Role, type Member, type Project, type Allocation } from "@/lib/data";
import { fmt, fmtM, fmtPct, cn, genId, memberName } from "@/lib/utils";
import { loadData, saveData, exportData, importData } from "@/lib/storage";
import { StatusBadge, DeptBadge, KpiCard, QuarterBarChart, HBar, WaterfallChart, AchievementRing, Modal, Field, inputCls, selectCls, btnPrimaryCls } from "@/components/ui";

type Tab="dashboard"|"entry"|"projects"|"members"|"departments"|"roles";

function Confirm({open,onClose,onOk,title,msg}:{open:boolean;onClose:()=>void;onOk:()=>void;title:string;msg:string}){
  if(!open)return null;
  return(<div className="fixed inset-0 z-[1100] flex items-center justify-center" onClick={onClose}><div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"/><div className="relative bg-white border border-slate-200 rounded-2xl p-8 max-w-[420px] shadow-2xl" onClick={e=>e.stopPropagation()}>
    <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><AlertTriangle size={20} className="text-red-500"/></div><h3 className="text-lg font-bold">{title}</h3></div>
    <p className="text-sm text-slate-500 mb-6">{msg}</p>
    <div className="flex gap-3 justify-end"><button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">キャンセル</button><button onClick={onOk} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 flex items-center gap-1.5"><Trash2 size={14}/>削除</button></div>
  </div></div>);
}

function MemberMultiSelect({members,selected,onChange,depts,roles}:{members:Member[];selected:string[];onChange:(ids:string[])=>void;depts:Department[];roles:Role[]}){
  const toggle=(id:string)=>{onChange(selected.includes(id)?selected.filter(x=>x!==id):[...selected,id]);};
  return(<div className="max-h-[200px] overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
    {members.length===0&&<div className="p-4 text-center text-sm text-slate-400">要員がいません</div>}
    {members.map(m=>(<label key={m.id} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer">
      <input type="checkbox" checked={selected.includes(m.id)} onChange={()=>toggle(m.id)} className="accent-indigo-600 w-4 h-4"/>
      <span className="text-sm font-medium">{memberName(m)}</span>
      <DeptBadge deptId={m.deptId} depts={depts}/>
      <span className="text-[11px] text-slate-400 ml-auto">{roles.find(r=>r.id===m.roleId)?.name||""}</span>
    </label>))}
  </div>);
}

export default function Home(){
  const [loaded,setLoaded]=useState(false);
  const [depts,setDepts]=useState<Department[]>([]);
  const [roles,setRoles]=useState<Role[]>([]);
  const [members,setMembers]=useState<Member[]>([]);
  const [projects,setProjects]=useState<Project[]>([]);
  const [allocs,setAllocs]=useState<Allocation[]>([]);
  const [tab,setTab]=useState<Tab>("dashboard");
  const [toast,setToast]=useState<string|null>(null);
  const showToast=(m:string)=>{setToast(m);setTimeout(()=>setToast(null),2500);};
  const fileRef=useRef<HTMLInputElement>(null);
  const currentFY=monthToFY(CURRENT_MONTH);
  const [selectedFY,setSelectedFY]=useState(currentFY);
  const availFYs=useMemo(()=>{const fys=getAllFYs(allocs,projects);if(!fys.includes(currentFY))fys.push(currentFY);return fys.sort();},[allocs,projects,currentFY]);
  const fyMos=useMemo(()=>fyMonths(selectedFY),[selectedFY]);

  useEffect(()=>{const d=loadData();setDepts(d.departments);setRoles(d.roles);setMembers(d.members);setProjects(d.projects);setAllocs(d.allocations);setLoaded(true);},[]);
  const persist=useCallback(()=>{if(loaded)saveData({departments:depts,roles,members,projects,allocations:allocs});},[depts,roles,members,projects,allocs,loaded]);
  useEffect(()=>{persist();},[persist]);

  const [modal,setModal]=useState<{type:string;mode:"add"|"edit";id?:string}|null>(null);
  const [confirm,setConfirm]=useState<{type:string;id:string;label:string}|null>(null);
  const [dForm,setDForm]=useState({name:""});
  const [rForm,setRForm]=useState({name:""});
  const [mForm,setMForm]=useState({lastName:"",firstName:"",roleId:"",deptId:"",startMonth:"2025-01",yearlyBudgets:{} as Record<string,number>});
  const [pForm,setPForm]=useState({name:"",client:"",status:"予定" as Project["status"],startDate:"",endDate:"",memberIds:[] as string[],quarterBudgets:{} as Record<string,number>});
  const [aForm,setAForm]=useState({projectId:"",memberId:"",month:"2025-06",hours:160,costRate:5000});
  const [deptDetail,setDeptDetail]=useState<string|null>(null);
  const rName=(rid:string)=>roles.find(r=>r.id===rid)?.name||"";
  const closeModal=()=>setModal(null);

  // Open helpers
  const openAddDept=()=>{setDForm({name:""});setModal({type:"dept",mode:"add"});};
  const openEditDept=(id:string)=>{const d=depts.find(x=>x.id===id);if(d)setDForm({name:d.name});setModal({type:"dept",mode:"edit",id});};
  const openAddRole=()=>{setRForm({name:""});setModal({type:"role",mode:"add"});};
  const openEditRole=(id:string)=>{const r=roles.find(x=>x.id===id);if(r)setRForm({name:r.name});setModal({type:"role",mode:"edit",id});};
  const openAddMember=(deptId?:string)=>{setMForm({lastName:"",firstName:"",roleId:roles[0]?.id||"",deptId:deptId||depts[0]?.id||"",startMonth:"2025-01",yearlyBudgets:{}});setModal({type:"member",mode:"add"});};
  const openEditMember=(id:string)=>{const m=members.find(x=>x.id===id);if(m)setMForm({lastName:m.lastName,firstName:m.firstName,roleId:m.roleId,deptId:m.deptId,startMonth:m.startMonth,yearlyBudgets:{...(m.yearlyBudgets||{})}});setModal({type:"member",mode:"edit",id});};
  const openAddProject=()=>{setPForm({name:"",client:"",status:"予定",startDate:"",endDate:"",memberIds:[],quarterBudgets:{}});setModal({type:"project",mode:"add"});};
  const openEditProject=(id:string)=>{const p=projects.find(x=>x.id===id);if(p)setPForm({name:p.name,client:p.client,status:p.status,startDate:p.startDate,endDate:p.endDate,memberIds:[...p.memberIds],quarterBudgets:{...p.quarterBudgets}});setModal({type:"project",mode:"edit",id});};
  const openAddAlloc=()=>{setAForm({projectId:projects[0]?.id||"",memberId:members[0]?.id||"",month:"2025-06",hours:160,costRate:5000});setModal({type:"alloc",mode:"add"});};
  const openEditAlloc=(id:string)=>{const a=allocs.find(x=>x.id===id);if(a)setAForm({projectId:a.projectId,memberId:a.memberId,month:a.month,hours:a.hours,costRate:a.costRate});setModal({type:"alloc",mode:"edit",id});};

  // CRUD
  const saveDept=()=>{if(!dForm.name.trim())return;if(modal?.mode==="add"){setDepts([...depts,{id:genId("D",depts),name:dForm.name}]);showToast("部門を追加");}else if(modal?.id){setDepts(depts.map(d=>d.id===modal.id?{...d,name:dForm.name}:d));showToast("部門を更新");}closeModal();};
  const deleteDept=(id:string)=>{setDepts(depts.filter(d=>d.id!==id));setMembers(members.filter(m=>m.deptId!==id));showToast("部門を削除");setConfirm(null);};
  const saveRole=()=>{if(!rForm.name.trim())return;if(modal?.mode==="add"){setRoles([...roles,{id:genId("R",roles),name:rForm.name}]);showToast("ロールを追加");}else if(modal?.id){setRoles(roles.map(r=>r.id===modal.id?{...r,name:rForm.name}:r));showToast("ロールを更新");}closeModal();};
  const deleteRole=(id:string)=>{setRoles(roles.filter(r=>r.id!==id));setMembers(members.map(m=>m.roleId===id?{...m,roleId:""}:m));showToast("ロールを削除");setConfirm(null);};
  const saveMember=()=>{if(!mForm.lastName.trim())return;if(modal?.mode==="add"){setMembers([...members,{id:genId("M",members),...mForm}]);showToast("要員を追加");}else if(modal?.id){setMembers(members.map(m=>m.id===modal.id?{...m,...mForm}:m));showToast("要員を更新");}closeModal();};
  const deleteMember=(id:string)=>{setMembers(members.filter(m=>m.id!==id));setAllocs(allocs.filter(a=>a.memberId!==id));setProjects(projects.map(p=>({...p,memberIds:p.memberIds.filter(mid=>mid!==id)})));showToast("要員を削除");setConfirm(null);};
  const saveProject=()=>{if(!pForm.name.trim())return;if(modal?.mode==="add"){setProjects([...projects,{id:genId("P",projects),...pForm}]);showToast("PJを追加");}else if(modal?.id){setProjects(projects.map(p=>p.id===modal.id?{...p,...pForm}:p));showToast("PJを更新");}closeModal();};
  const deleteProject=(id:string)=>{setProjects(projects.filter(p=>p.id!==id));setAllocs(allocs.filter(a=>a.projectId!==id));showToast("PJを削除");setConfirm(null);};
  const saveAlloc=()=>{if(!aForm.projectId||!aForm.memberId)return;const rec={...aForm,hours:Number(aForm.hours),costRate:Number(aForm.costRate)};if(modal?.mode==="add"){setAllocs([...allocs,{id:genId("A",allocs),...rec}]);showToast("アサインを追加");}else if(modal?.id){setAllocs(allocs.map(a=>a.id===modal.id?{...a,...rec}:a));showToast("アサインを更新");}closeModal();};
  const deleteAlloc=(id:string)=>{setAllocs(allocs.filter(a=>a.id!==id));showToast("削除完了");setConfirm(null);};
  const handleImport=async(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;try{const d=await importData(f);setDepts(d.departments);setRoles(d.roles);setMembers(d.members);setProjects(d.projects);setAllocs(d.allocations);showToast("インポート完了");}catch{showToast("失敗");}e.target.value="";};

  // Computed
  const fyAllocs=useMemo(()=>allocs.filter(a=>fyMos.includes(a.month)),[allocs,fyMos]);
  const qKeys=[1,2,3,4].map(q=>`${selectedFY}-Q${q}`);

  const projectPL=useMemo(()=>projects.map(p=>{
    const pa=fyAllocs.filter(a=>a.projectId===p.id);
    const qData=[1,2,3,4].map(q=>{
      const key=`${selectedFY}-Q${q}`;
      const budget=(p.quarterBudgets[key]||0)*10000;
      const qm=fyQMonths(selectedFY,q);
      const cost=pa.filter(a=>qm.includes(a.month)).reduce((s,a)=>s+a.hours*a.costRate,0);
      return{q,key,label:`Q${q}`,budget,cost,profit:budget-cost};
    });
    const tb=qData.reduce((s,q)=>s+q.budget,0);
    const tc=qData.reduce((s,q)=>s+q.cost,0);
    return{...p,qData,totalBudget:tb,totalCost:tc,profit:tb-tc,margin:tb>0?((tb-tc)/tb)*100:0};
  }),[projects,fyAllocs,selectedFY]);

  const memberStats=useMemo(()=>members.map(m=>{
    const ma=fyAllocs.filter(a=>a.memberId===m.id);
    const rev=ma.reduce((s,a)=>s+a.hours*a.costRate,0);
    const bgt=((m.yearlyBudgets||{})[selectedFY]||0)*10000;
    return{...m,fyRevenue:rev,fyBudget:bgt,achievement:bgt>0?(rev/bgt)*100:0,projectCount:[...new Set(ma.map(a=>a.projectId))].length,totalHours:ma.reduce((s,a)=>s+a.hours,0)};
  }),[members,fyAllocs,selectedFY]);

  const totals=useMemo(()=>{
    const b=projectPL.reduce((s,p)=>s+p.totalBudget,0);const c=projectPL.reduce((s,p)=>s+p.totalCost,0);
    const mb=memberStats.reduce((s,m)=>s+m.fyBudget,0);const mr=memberStats.reduce((s,m)=>s+m.fyRevenue,0);
    return{budget:b,cost:c,profit:b-c,margin:b>0?((b-c)/b)*100:0,mBgt:mb,mRev:mr,mAch:mb>0?(mr/mb)*100:0};
  },[projectPL,memberStats]);

  // Quarterly totals for dashboard chart
  const qTotals=useMemo(()=>[1,2,3,4].map(q=>{
    const qm=fyQMonths(selectedFY,q);const qa=fyAllocs.filter(a=>qm.includes(a.month));
    const budget=projects.reduce((s,p)=>s+(p.quarterBudgets[`${selectedFY}-Q${q}`]||0)*10000,0);
    const cost=qa.reduce((s,a)=>s+a.hours*a.costRate,0);
    return{label:`Q${q}`,budget,cost,profit:budget-cost};
  }),[selectedFY,projects,fyAllocs]);

  const deptStats=useMemo(()=>depts.map((dept,idx)=>{
    const dm=memberStats.filter(m=>m.deptId===dept.id);
    return{...dept,memberCount:dm.length,totalRevenue:dm.reduce((s,m)=>s+m.fyRevenue,0),totalBudget:dm.reduce((s,m)=>s+m.fyBudget,0),color:["#6366f1","#0891b2","#7c3aed","#059669","#d97706","#ec4899"][idx%6]};
  }),[depts,memberStats]);

  const navItems:{id:Tab;label:string;icon:React.ReactNode}[]=[
    {id:"dashboard",label:"ダッシュボード",icon:<LayoutGrid size={18}/>},
    {id:"entry",label:"アサイン登録",icon:<PenLine size={18}/>},
    {id:"projects",label:"プロジェクト",icon:<FolderOpen size={18}/>},
    {id:"members",label:"要員DB",icon:<Users size={18}/>},
    {id:"departments",label:"部門DB",icon:<Building2 size={18}/>},
    {id:"roles",label:"ロールDB",icon:<Briefcase size={18}/>},
  ];
  const thCls="px-3.5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider";
  const tdCls="px-3.5 py-3";
  const actionBtn="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600";
  const emptyBox=(msg:string,action?:()=>void,lbl?:string)=>(<div className="text-center py-16"><Database size={48} className="mx-auto text-slate-300 mb-4"/><p className="text-slate-400 text-sm mb-4">{msg}</p>{action&&<button className={btnPrimaryCls} onClick={action}><Plus size={15}/>{lbl||"追加"}</button>}</div>);

  const FYSel=()=>(<div className="flex gap-1.5 items-center flex-wrap"><span className="text-[11px] text-slate-400 font-semibold">年度:</span>{availFYs.map(fy=>(<button key={fy} onClick={()=>setSelectedFY(fy)} className={cn("px-3 py-1 rounded-lg text-xs font-semibold transition-all border",selectedFY===fy?"border-indigo-500 bg-indigo-50 text-indigo-600 border-2":"border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{fyLabel(fy)}</button>))}</div>);

  if(!loaded)return <div className="flex items-center justify-center min-h-screen text-slate-400">読み込み中...</div>;

  return(<div className="flex min-h-screen">
    {toast&&<div className="fixed top-6 right-6 z-[2000] flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-3 rounded-xl text-[13px] font-semibold shadow-lg border border-emerald-100 animate-slide-in"><Check size={16}/>{toast}</div>}
    <input type="file" ref={fileRef} accept=".json" className="hidden" onChange={handleImport}/>

    <nav className="w-[230px] bg-white border-r border-slate-200 py-6 shrink-0 flex flex-col shadow-[1px_0_8px_rgba(0,0,0,0.03)]">
      <div className="px-5 mb-9">
        <div className="text-xl font-extrabold tracking-tight bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">ProfitLens</div>
        <div className="text-[10px] text-slate-400 mt-0.5 tracking-[1.5px] uppercase font-semibold">Consulting Manager</div>
      </div>
      {navItems.map(it=>(<button key={it.id} onClick={()=>setTab(it.id)} className={cn("flex items-center gap-2.5 w-full px-5 py-2.5 text-[13px] transition-all text-left",tab===it.id?"bg-indigo-50 text-indigo-600 font-bold border-l-[3px] border-indigo-600":"text-slate-500 font-medium border-l-[3px] border-transparent hover:bg-slate-50")}>{it.icon}{it.label}</button>))}
      <div className="flex-1"/>
      <div className="px-4 space-y-1.5 mb-2">
        <button onClick={()=>exportData({departments:depts,roles,members,projects,allocations:allocs})} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[11px] font-semibold text-slate-500 hover:bg-slate-50 border border-slate-200"><Download size={14}/>エクスポート</button>
        <button onClick={()=>fileRef.current?.click()} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[11px] font-semibold text-slate-500 hover:bg-slate-50 border border-slate-200"><Upload size={14}/>インポート</button>
      </div>
      <div className="px-5 pt-3 border-t border-slate-200 text-[10px] text-slate-400">自動保存: ON</div>
    </nav>

    <main className="flex-1 p-7 overflow-y-auto max-h-screen bg-slate-50">

      {/* ── DASHBOARD ── */}
      {tab==="dashboard"&&(<div>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3"><h1 className="text-2xl font-extrabold">ダッシュボード</h1><FYSel/></div>
        {projects.length===0&&members.length===0?emptyBox("データを登録してください"):(<>
          {/* KPI Row */}
          <div className="flex gap-3.5 mb-6 flex-wrap">
            <KpiCard label="売上予算" value={fmtM(totals.budget)} icon={<DollarSign size={20} className="text-indigo-500"/>} colorClass="text-indigo-600"/>
            <KpiCard label="コスト" value={fmtM(totals.cost)} icon={<BarChart3 size={20} className="text-pink-500"/>} colorClass="text-pink-600"/>
            <KpiCard label="利益" value={fmtM(totals.profit)} icon={<TrendingUp size={20} className="text-emerald-500"/>} colorClass={totals.profit>=0?"text-emerald-600":"text-red-500"} sub={totals.budget>0?`利益率 ${fmtPct(totals.margin)}`:undefined}/>
            <KpiCard label="要員達成率" value={totals.mBgt>0?fmtPct(totals.mAch):"―"} icon={<Target size={20} className="text-amber-500"/>} colorClass="text-amber-600" sub={`${fmtM(totals.mRev)} / ${fmtM(totals.mBgt)}`}/>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Waterfall */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">年度サマリー（{fyLabel(selectedFY)}）</h3>
              <WaterfallChart budget={totals.budget} cost={totals.cost} profit={totals.profit}/>
              <div className="flex justify-center gap-6 mt-4 text-[10px] text-slate-400">{[{c:"bg-indigo-500",l:"予算"},{c:"bg-pink-400",l:"コスト"},{c:"bg-emerald-400",l:"利益"}].map(x=>(<div key={x.l} className="flex items-center gap-1.5"><div className={cn("w-2.5 h-2.5 rounded-sm",x.c)}/>{x.l}</div>))}</div>
            </div>
            {/* Quarter Chart */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">四半期比較</h3>
              <QuarterBarChart data={qTotals}/>
              <div className="flex justify-center gap-6 mt-4 text-[10px] text-slate-400">{[{c:"bg-indigo-500",l:"予算"},{c:"bg-pink-400",l:"コスト"},{c:"bg-emerald-400",l:"利益"}].map(x=>(<div key={x.l} className="flex items-center gap-1.5"><div className={cn("w-2.5 h-2.5 rounded-sm",x.c)}/>{x.l}</div>))}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* PJ ranking */}
            {projectPL.filter(p=>p.totalBudget>0||p.totalCost>0).length>0&&<div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">プロジェクト別利益</h3>
              <HBar items={projectPL.filter(p=>p.totalBudget>0||p.totalCost>0).sort((a,b)=>b.profit-a.profit).map(p=>({label:p.name,value:p.profit,color:p.profit>=0?"#10b981":"#ef4444",sub:p.totalBudget>0?fmtPct(p.margin):""}))} />
            </div>}
            {/* Member achievement */}
            {memberStats.filter(m=>m.fyBudget>0).length>0&&<div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">要員別 予算達成率</h3>
              <div className="space-y-3">{memberStats.filter(m=>m.fyBudget>0).sort((a,b)=>b.achievement-a.achievement).slice(0,8).map(m=>(<div key={m.id} className="flex items-center gap-3">
                <AchievementRing pct={m.achievement} size={44}/>
                <div className="flex-1 min-w-0"><div className="text-[12px] font-semibold truncate">{memberName(m)}</div><div className="text-[10px] text-slate-400">{rName(m.roleId)}</div></div>
                <div className="text-right text-[11px] font-mono text-slate-500">{fmtM(m.fyRevenue)}<span className="text-slate-300 mx-0.5">/</span>{fmtM(m.fyBudget)}</div>
              </div>))}</div>
            </div>}
          </div>
        </>)}
      </div>)}

      {/* ── ALLOC ENTRY ── */}
      {tab==="entry"&&(<div>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3"><div><h1 className="text-2xl font-extrabold">アサイン登録</h1></div><div className="flex gap-3 items-center flex-wrap"><FYSel/><button className={btnPrimaryCls} onClick={openAddAlloc}><Plus size={15}/>新規アサイン</button></div></div>
        {fyAllocs.length===0?emptyBox("アサインがありません",openAddAlloc,"追加"):(<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-[13px]"><thead><tr className="bg-slate-50">{["PJ","要員","部門","ロール","月","時間","単価","コスト","操作"].map(h=><th key={h} className={thCls}>{h}</th>)}</tr></thead>
          <tbody>{[...fyAllocs].sort((a,b)=>b.month.localeCompare(a.month)).map(a=>{const p=projects.find(pp=>pp.id===a.projectId);const m=members.find(mm=>mm.id===a.memberId);return(
            <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className={cn(tdCls,"font-medium")}>{p?.name||a.projectId}</td><td className={tdCls}>{m?memberName(m):a.memberId}</td><td className={tdCls}>{m&&<DeptBadge deptId={m.deptId} depts={depts}/>}</td><td className={cn(tdCls,"text-indigo-600 text-xs font-medium")}>{m?rName(m.roleId):""}</td>
              <td className={cn(tdCls,"font-mono text-slate-400")}>{a.month}</td><td className={cn(tdCls,"font-mono")}>{a.hours}h</td><td className={cn(tdCls,"font-mono")}>¥{fmt(a.costRate)}</td><td className={cn(tdCls,"font-mono text-pink-600")}>¥{fmt(a.hours*a.costRate)}</td>
              <td className={tdCls}><div className="flex gap-1"><button className={actionBtn} onClick={()=>openEditAlloc(a.id)}><Pencil size={14}/></button><button className={cn(actionBtn,"hover:text-red-500")} onClick={()=>setConfirm({type:"alloc",id:a.id,label:`${m?memberName(m):""} ${a.month}`})}><Trash2 size={14}/></button></div></td>
            </tr>);})}</tbody></table>
        </div>)}
      </div>)}

      {/* ── PROJECTS ── */}
      {tab==="projects"&&(<div>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3"><h1 className="text-2xl font-extrabold">プロジェクト一覧</h1><div className="flex gap-3 items-center flex-wrap"><FYSel/><button className={btnPrimaryCls} onClick={openAddProject}><Plus size={15}/>新規PJ</button></div></div>
        {projectPL.length===0?emptyBox("PJがありません",openAddProject,"追加"):(<div className="space-y-4">
          {projectPL.map(p=>(<div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-start mb-4"><div><div className="flex items-center gap-2 mb-1"><h3 className="text-base font-bold">{p.name}</h3><StatusBadge status={p.status}/></div><div className="text-sm text-slate-500">{p.client}{p.startDate&&` ・ ${p.startDate} 〜 ${p.endDate}`}</div></div><div className="flex gap-1"><button className={actionBtn} onClick={()=>openEditProject(p.id)}><Pencil size={14}/></button><button className={cn(actionBtn,"hover:text-red-500")} onClick={()=>setConfirm({type:"project",id:p.id,label:p.name})}><Trash2 size={14}/></button></div></div>
            <div className="mb-4"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">要員</span><div className="flex flex-wrap gap-1.5 mt-1.5">{p.memberIds.map(mid=>{const m=members.find(x=>x.id===mid);return m?<span key={mid} className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium">{memberName(m)}</span>:null;})}{p.memberIds.length===0&&<span className="text-xs text-slate-300">未設定</span>}</div></div>
            {/* Quarter chart per project */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4"><QuarterBarChart data={p.qData}/></div>
              <div className="grid grid-cols-2 gap-2">{p.qData.map(q=>(<div key={q.key} className="bg-slate-50 rounded-xl p-3"><div className="text-[10px] font-bold text-slate-400 mb-1">{q.label}</div><div className="space-y-0.5 text-[11px] font-mono"><div className="text-indigo-600">予算 {fmtM(q.budget)}</div><div className="text-pink-600">コスト {fmtM(q.cost)}</div><div className={cn("font-bold",q.profit>=0?"text-emerald-600":"text-red-500")}>利益 {fmtM(q.profit)}</div></div></div>))}</div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs font-mono"><span className="text-indigo-600 font-bold">年間予算 {fmtM(p.totalBudget)}</span><span className="text-pink-600">コスト {fmtM(p.totalCost)}</span><span className={cn("font-bold",p.profit>=0?"text-emerald-600":"text-red-500")}>利益 {fmtM(p.profit)}</span>{p.totalBudget>0&&<span className="text-slate-400">({fmtPct(p.margin)})</span>}</div>
          </div>))}
        </div>)}
      </div>)}

      {/* ── MEMBER DB ── */}
      {tab==="members"&&(<div>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3"><h1 className="text-2xl font-extrabold">要員DB</h1><div className="flex gap-3 items-center flex-wrap"><FYSel/><button className={btnPrimaryCls} onClick={()=>openAddMember()}><Plus size={15}/>新規要員</button></div></div>
        {memberStats.length===0?emptyBox("要員がいません",()=>openAddMember(),"追加"):(<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-[13px]"><thead><tr className="bg-slate-50">{["ID","姓","名","ロール","部門","年度目標","売上実績","達成率","PJ","操作"].map(h=><th key={h} className={thCls}>{h}</th>)}</tr></thead>
          <tbody>{memberStats.sort((a,b)=>b.achievement-a.achievement).map(m=>(<tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50">
            <td className={cn(tdCls,"text-slate-400 font-mono text-[11px]")}>{m.id}</td><td className={cn(tdCls,"font-semibold")}>{m.lastName}</td><td className={cn(tdCls,"font-semibold")}>{m.firstName}</td>
            <td className={cn(tdCls,"text-indigo-600 font-medium text-xs")}>{rName(m.roleId)}</td><td className={tdCls}><DeptBadge deptId={m.deptId} depts={depts}/></td>
            <td className={cn(tdCls,"font-mono text-slate-500")}>{m.fyBudget>0?fmtM(m.fyBudget):<span className="text-slate-300">―</span>}</td>
            <td className={cn(tdCls,"font-mono font-semibold text-indigo-600")}>{fmtM(m.fyRevenue)}</td>
            <td className={tdCls}>{m.fyBudget>0?<AchievementRing pct={m.achievement} size={40}/>:<span className="text-xs text-slate-300">―</span>}</td>
            <td className={cn(tdCls,"font-mono")}>{m.projectCount}</td>
            <td className={tdCls}><div className="flex gap-1"><button className={actionBtn} onClick={()=>openEditMember(m.id)}><Pencil size={14}/></button><button className={cn(actionBtn,"hover:text-red-500")} onClick={()=>setConfirm({type:"member",id:m.id,label:memberName(m)})}><Trash2 size={14}/></button></div></td>
          </tr>))}</tbody></table>
        </div>)}
      </div>)}

      {/* ── DEPT DB ── */}
      {tab==="departments"&&(<div>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3"><h1 className="text-2xl font-extrabold">部門DB</h1><div className="flex gap-3 items-center flex-wrap"><FYSel/><button className={btnPrimaryCls} onClick={openAddDept}><Plus size={15}/>新規部門</button></div></div>
        {depts.length===0?emptyBox("部門がありません",openAddDept,"追加"):(<div className="space-y-4">
          {deptStats.map(d=>{const isOpen=deptDetail===d.id;const dm=memberStats.filter(m=>m.deptId===d.id);return(<div key={d.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" style={{borderTopWidth:4,borderTopColor:d.color}}>
            <div className="p-6"><div className="flex justify-between items-center">
              <div className="flex items-center gap-3 cursor-pointer" onClick={()=>setDeptDetail(isOpen?null:d.id)}><ChevronRight size={16} className={cn("text-slate-400 transition-transform",isOpen&&"rotate-90")}/><h3 className="text-base font-bold" style={{color:d.color}}>{d.name}</h3><span className="text-xs text-slate-400">{d.memberCount}名</span>{d.totalBudget>0&&<AchievementRing pct={d.totalRevenue/d.totalBudget*100} size={36}/>}</div>
              <div className="flex gap-1"><button className={btnPrimaryCls+" !py-1.5 !px-3 !text-[11px]"} onClick={()=>openAddMember(d.id)}><UserPlus size={13}/>要員追加</button><button className={actionBtn} onClick={()=>openEditDept(d.id)}><Pencil size={14}/></button><button className={cn(actionBtn,"hover:text-red-500")} onClick={()=>setConfirm({type:"dept",id:d.id,label:d.name})}><Trash2 size={14}/></button></div>
            </div></div>
            {isOpen&&(<div className="border-t border-slate-100">{dm.length===0?<div className="p-6 text-center text-sm text-slate-300">要員なし</div>:(
              <table className="w-full text-[13px]"><thead><tr className="bg-slate-50">{["姓名","ロール","年度目標","実績","達成率","操作"].map(h=><th key={h} className={thCls}>{h}</th>)}</tr></thead>
              <tbody>{dm.map(m=>(<tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className={cn(tdCls,"font-semibold")}>{memberName(m)}</td><td className={cn(tdCls,"text-indigo-600 font-medium text-xs")}>{rName(m.roleId)}</td>
                <td className={cn(tdCls,"font-mono text-slate-500")}>{m.fyBudget>0?fmtM(m.fyBudget):<span className="text-slate-300">―</span>}</td><td className={cn(tdCls,"font-mono font-semibold text-indigo-600")}>{fmtM(m.fyRevenue)}</td>
                <td className={tdCls}>{m.fyBudget>0?<AchievementRing pct={m.achievement} size={36}/>:<span className="text-xs text-slate-300">―</span>}</td>
                <td className={tdCls}><div className="flex gap-1"><button className={actionBtn} onClick={()=>openEditMember(m.id)}><Pencil size={14}/></button><button className={cn(actionBtn,"hover:text-red-500")} onClick={()=>setConfirm({type:"member",id:m.id,label:memberName(m)})}><Trash2 size={14}/></button></div></td>
              </tr>))}</tbody></table>)}</div>)}
          </div>);})}
        </div>)}
      </div>)}

      {/* ── ROLE DB ── */}
      {tab==="roles"&&(<div>
        <div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-extrabold">ロールDB</h1></div><button className={btnPrimaryCls} onClick={openAddRole}><Plus size={15}/>新規ロール</button></div>
        {roles.length===0?emptyBox("ロールがありません",openAddRole,"追加"):(<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-[13px]"><thead><tr className="bg-slate-50">{["ID","ロール名","要員数","操作"].map(h=><th key={h} className={thCls}>{h}</th>)}</tr></thead>
          <tbody>{roles.map(r=>{const cnt=members.filter(m=>m.roleId===r.id).length;return(<tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50"><td className={cn(tdCls,"text-slate-400 font-mono text-[11px]")}>{r.id}</td><td className={cn(tdCls,"font-semibold text-indigo-600")}>{r.name}</td><td className={cn(tdCls,"font-mono")}>{cnt}名</td><td className={tdCls}><div className="flex gap-1"><button className={actionBtn} onClick={()=>openEditRole(r.id)}><Pencil size={14}/></button><button className={cn(actionBtn,"hover:text-red-500")} onClick={()=>setConfirm({type:"role",id:r.id,label:r.name})}><Trash2 size={14}/></button></div></td></tr>);})}</tbody></table>
        </div>)}
      </div>)}
    </main>

    {/* MODALS */}
    <Modal open={modal?.type==="dept"} onClose={closeModal} title={modal?.mode==="add"?"部門追加":"部門編集"}><Field label="部門名"><input className={inputCls} value={dForm.name} onChange={e=>setDForm({name:e.target.value})} placeholder="例: 戦略コンサルティング部"/></Field><button className={cn(btnPrimaryCls,"w-full justify-center")} onClick={saveDept}><Check size={15}/>{modal?.mode==="add"?"追加":"更新"}</button></Modal>
    <Modal open={modal?.type==="role"} onClose={closeModal} title={modal?.mode==="add"?"ロール追加":"ロール編集"}><Field label="ロール名"><input className={inputCls} value={rForm.name} onChange={e=>setRForm({name:e.target.value})} placeholder="例: マネージャー"/></Field><button className={cn(btnPrimaryCls,"w-full justify-center")} onClick={saveRole}><Check size={15}/>{modal?.mode==="add"?"追加":"更新"}</button></Modal>
    <Modal open={modal?.type==="member"} onClose={closeModal} title={modal?.mode==="add"?"要員追加":"要員編集"}>
      <div className="grid grid-cols-2 gap-2.5"><Field label="姓"><input className={inputCls} value={mForm.lastName} onChange={e=>setMForm({...mForm,lastName:e.target.value})} placeholder="山田"/></Field><Field label="名"><input className={inputCls} value={mForm.firstName} onChange={e=>setMForm({...mForm,firstName:e.target.value})} placeholder="太郎"/></Field></div>
      <Field label="ロール"><select className={selectCls} value={mForm.roleId} onChange={e=>setMForm({...mForm,roleId:e.target.value})}><option value="">選択...</option>{roles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
      <Field label="部門"><select className={selectCls} value={mForm.deptId} onChange={e=>setMForm({...mForm,deptId:e.target.value})}><option value="">選択...</option>{depts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
      <Field label="開始月"><input type="month" className={inputCls} value={mForm.startMonth} onChange={e=>setMForm({...mForm,startMonth:e.target.value})}/></Field>
      <Field label="年度別 目標予算（万円）"><div className="space-y-2">{availFYs.map(fy=>(<div key={fy} className="flex items-center gap-3"><span className="text-xs font-semibold text-slate-500 w-20">{fyLabel(fy)}</span><input type="number" className={inputCls+" !w-36"} value={mForm.yearlyBudgets[fy]||""} onChange={e=>setMForm({...mForm,yearlyBudgets:{...mForm.yearlyBudgets,[fy]:Number(e.target.value)||0}})} placeholder="0"/><span className="text-[11px] text-slate-400">万円</span></div>))}{availFYs.length===0&&<div className="text-xs text-slate-400">アサインを登録すると年度が表示されます</div>}</div></Field>
      <button className={cn(btnPrimaryCls,"w-full justify-center")} onClick={saveMember}><Check size={15}/>{modal?.mode==="add"?"追加":"更新"}</button>
    </Modal>
    <Modal open={modal?.type==="project"} onClose={closeModal} title={modal?.mode==="add"?"PJ追加":"PJ編集"} wide>
      <Field label="プロジェクト名"><input className={inputCls} value={pForm.name} onChange={e=>setPForm({...pForm,name:e.target.value})} placeholder="例: DX推進支援"/></Field>
      <Field label="クライアント"><input className={inputCls} value={pForm.client} onChange={e=>setPForm({...pForm,client:e.target.value})}/></Field>
      <Field label="ステータス"><select className={selectCls} value={pForm.status} onChange={e=>setPForm({...pForm,status:e.target.value as Project["status"]})}><option>予定</option><option>進行中</option><option>完了</option></select></Field>
      <div className="grid grid-cols-2 gap-2.5"><Field label="開始月"><input type="month" className={inputCls} value={pForm.startDate} onChange={e=>setPForm({...pForm,startDate:e.target.value})}/></Field><Field label="終了月"><input type="month" className={inputCls} value={pForm.endDate} onChange={e=>setPForm({...pForm,endDate:e.target.value})}/></Field></div>
      <Field label="要員（複数選択）"><MemberMultiSelect members={members} selected={pForm.memberIds} onChange={ids=>setPForm({...pForm,memberIds:ids})} depts={depts} roles={roles}/></Field>
      <Field label={`四半期別 売上予算（${fyLabel(selectedFY)}・万円）`}>
        <div className="grid grid-cols-4 gap-2">{[1,2,3,4].map(q=>{const key=`${selectedFY}-Q${q}`;return(<div key={key}><div className="text-[10px] font-semibold text-slate-400 mb-1 text-center">Q{q}</div><input type="number" className={inputCls+" text-center"} value={pForm.quarterBudgets[key]||""} onChange={e=>setPForm({...pForm,quarterBudgets:{...pForm.quarterBudgets,[key]:Number(e.target.value)||0}})} placeholder="0"/></div>);})}</div>
        <div className="text-right text-xs text-slate-400 mt-1.5">年間合計: <strong className="text-indigo-600">{fmt([1,2,3,4].reduce((s,q)=>s+(pForm.quarterBudgets[`${selectedFY}-Q${q}`]||0),0))}万円</strong></div>
      </Field>
      <button className={cn(btnPrimaryCls,"w-full justify-center")} onClick={saveProject}><Check size={15}/>{modal?.mode==="add"?"追加":"更新"}</button>
    </Modal>
    <Modal open={modal?.type==="alloc"} onClose={closeModal} title={modal?.mode==="add"?"アサイン追加":"アサイン編集"}>
      <Field label="PJ"><select className={selectCls} value={aForm.projectId} onChange={e=>setAForm({...aForm,projectId:e.target.value})}><option value="">選択...</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
      <Field label="要員"><select className={selectCls} value={aForm.memberId} onChange={e=>setAForm({...aForm,memberId:e.target.value})}><option value="">選択...</option>{members.map(m=><option key={m.id} value={m.id}>{memberName(m)}</option>)}</select></Field>
      <Field label="月"><input type="month" className={inputCls} value={aForm.month} onChange={e=>setAForm({...aForm,month:e.target.value})}/></Field>
      <div className="grid grid-cols-2 gap-2.5"><Field label="稼働時間(h)"><input type="number" className={inputCls} value={aForm.hours} onChange={e=>setAForm({...aForm,hours:Number(e.target.value)})}/></Field><Field label="コスト単価(円/h)"><input type="number" className={inputCls} value={aForm.costRate} onChange={e=>setAForm({...aForm,costRate:Number(e.target.value)})}/></Field></div>
      <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-500 mb-4">月間コスト: <strong className="text-pink-600">¥{fmt(Number(aForm.hours)*Number(aForm.costRate))}</strong></div>
      <button className={cn(btnPrimaryCls,"w-full justify-center")} onClick={saveAlloc}><Check size={15}/>{modal?.mode==="add"?"追加":"更新"}</button>
    </Modal>
    <Confirm open={!!confirm} onClose={()=>setConfirm(null)} title={`${confirm?.label} を削除`} msg={confirm?.type==="dept"?"紐づく要員も削除されます。":confirm?.type==="role"?"要員のロールが解除されます。":confirm?.type==="project"?"関連アサインも削除されます。":"削除します。"} onOk={()=>{if(!confirm)return;if(confirm.type==="dept")deleteDept(confirm.id);else if(confirm.type==="role")deleteRole(confirm.id);else if(confirm.type==="project")deleteProject(confirm.id);else if(confirm.type==="member")deleteMember(confirm.id);else if(confirm.type==="alloc")deleteAlloc(confirm.id);}}/>
  </div>);
}
