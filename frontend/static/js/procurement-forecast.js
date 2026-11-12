/* Katipunan AMS - Procurement forecasting
   Extracted from frontend/templates/index.html. */

// ══════════════════════════════════════════════════════════
// PROCUREMENT FORECASTING MODULE
// Decision-support only — does not perform purchasing, bidding,
// approval or supplier management.
// Inputs: condition, remaining useful life, repair history, maintenance cost.
// Remaining Useful Life = Expected Useful Life − Elapsed Useful Life
// ══════════════════════════════════════════════════════════
const PF_W={life:40,cond:30,repair:15,cost:15};           // max points per factor (total 100)
const PF_COND={Serviceable:0,Damaged:20,Unserviceable:30,Lost:15,Missing:15};
const PF_REP_PTS=5;                                       // points per repair record
const PF_COST_FULL=0.5;                                   // cumulative repair cost / acquisition cost at which cost factor is maxed
const PF_PRI={low:0,medium:1,high:2,critical:3};
const PF_BUCKETS={now:'Replace now',y1:'Within 1 year',y2:'1–2 years',y3:'2–3 years',later:'Beyond 3 years',unknown:'Insufficient data',verify:'Verify first'};
const PF_LIFE_DEFAULTS=[   // editable per asset; used only when no Useful Life is recorded
  [/laptop|notebook|desktop|computer|tablet|monitor|\bups\b|server|\bpc\b/i,5],
  [/printer|scanner|copier|photocopier|riso/i,5],
  [/projector|camera|television|\btv\b|speaker|sound/i,5],
  [/air.?con|air conditioner/i,8],
  [/radio|transceiver|handheld|communication/i,5],
  [/motorcycle/i,5],
  [/truck|ambulance|\bvan\b|vehicle|\bcar\b|jeep|pickup|patrol|\bbus\b/i,8],
  [/generator|pump|compressor|mower|chainsaw/i,10],
  [/table|chair|cabinet|desk|shelf|locker|sofa|\bbed\b/i,10],
  [/refrigerator|freezer|oven/i,8],
  [/microscope|sphygmo|stethoscope|nebulizer|medical|\becg\b|autoclave|weighing|scale/i,8]
];
let pfState={win:'all',prio:'all',q:'',infl:parseFloat(localStorage.getItem('mets_pf_infl'))||0};
let pfRows=[], pfChartInstance=null;

function pfEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function pfDefaultLife(name){for(const [re,y] of PF_LIFE_DEFAULTS){if(re.test(name||''))return y;}return 5;}
function pfParseDate(s){if(!s||/^\s*(n\/?a|—|-)\s*$/i.test(String(s)))return null;const d=new Date(s);return isNaN(d.getTime())?null:d;}
function pfNum(v){const n=parseFloat(String(v==null?'':v).replace(/[₱,\s]/g,''));return isNaN(n)?0:n;}
function pfPeso(n){return '₱'+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});}
function pfYears(y){
  if(y===null||y===undefined)return '—';
  const a=Math.abs(y);
  return a<1?Math.round(a*12)+' mo':(Math.round(a*10)/10)+' yrs';
}

function pfCollect(){
  let rep={};try{rep=JSON.parse(localStorage.getItem('mets_repairs')||'{}');}catch(e){}
  const out=[];
  for(const [deptId,list] of Object.entries(staffData)){
    if(!Array.isArray(list))continue;
    list.forEach(s=>(s.equipment||[]).forEach(eq=>out.push({eq,staffId:s.id,owner:s.name,dept:deptId,repairs:rep[eq.id]||[]})));
  }
  return out;
}

function pfAssess(r,infl){
  const eq=r.eq, now=new Date(), st=eq.status||'Serviceable';
  const acq=pfParseDate(eq.acquiredDate);
  const ul=parseFloat(eq.usefulLife)>0?parseFloat(eq.usefulLife):null;
  const life=ul||pfDefaultLife(eq.name);
  const elapsed=acq?Math.max(0,(now-acq)/31557600000):null;     // years since acquisition
  const rul=acq?life-elapsed:null;                               // RUL = EUL − Elapsed
  const used=acq?Math.min(1,elapsed/life):null;
  const amount=pfNum(eq.amount);
  const repCount=r.repairs.length;
  const repCost=r.repairs.reduce((s,x)=>s+pfNum(x.cost),0);
  const costRatio=amount>0?repCost/amount:null;

  const sLife=used===null?0:Math.round(PF_W.life*used);
  const sCond=PF_COND[st]||0;
  const sRep=Math.min(PF_W.repair,repCount*PF_REP_PTS);
  const sCost=costRatio===null?0:Math.round(Math.min(PF_W.cost,costRatio/PF_COST_FULL*PF_W.cost));
  const score=sLife+sCond+sRep+sCost;

  const overdue=rul!==null&&rul<=0;
  const costHigh=costRatio!==null&&costRatio>=PF_COST_FULL;
  let p=score>=70?'critical':score>=50?'high':score>=30?'medium':'low';
  if(overdue&&(st==='Unserviceable'||st==='Damaged'))p='critical';
  const floor={Unserviceable:'high',Damaged:'medium',Lost:'medium',Missing:'medium'}[st];
  if(floor&&PF_PRI[p]<PF_PRI[floor])p=floor;
  if((overdue||costHigh)&&PF_PRI[p]<PF_PRI.high)p='high';

  let b;
  if(st==='Lost'||st==='Missing')b='verify';
  else if(overdue||st==='Unserviceable'||costHigh)b='now';
  else if(rul===null)b='unknown';
  else b=rul<=1?'y1':rul<=2?'y2':rul<=3?'y3':'later';

  let rec;
  if(b==='verify')rec='Verify and report the loss per COA rules before any replacement';
  else if(b==='now')rec=st==='Unserviceable'?'Replacement candidate — include in next procurement plan':costHigh?'Repair cost near replacement value — consider replacement':'Useful life ended — assess for replacement';
  else if(b==='y1')rec='Prepare for replacement within 12 months';
  else if(b==='y2'||b==='y3')rec='Plan and budget for upcoming replacement';
  else if(b==='later')rec='Monitor';
  else rec=st==='Damaged'?'Assess repair vs. replacement; add acquisition date to forecast':'Add acquisition date to enable forecast';

  const estCost=(amount>0&&b!=='verify')?amount*Math.pow(1+infl/100,Math.max(0,rul||0)):0;
  return {r,eq,st,acq,life,lifeDefault:!ul,elapsed,rul,overdue,amount,repCount,repCost,costRatio,
          sLife,sCond,sRep,sCost,score,p,b,rec,estCost,staffId:r.staffId,owner:r.owner};
}

function pfInWindow(b,win){
  if(win==='all')return true;
  const order=['now','y1','y2','y3'];
  const lim=win==='now'?0:parseInt(win,10);
  const i=order.indexOf(b);
  return i>=0&&i<=lim;
}
function pfSet(k,v){
  pfState[k]=v;
  if(k==='infl'){pfState.infl=parseFloat(v)||0;localStorage.setItem('mets_pf_infl',String(pfState.infl));}
  pfRender();
}
function pfAll(){
  return pfCollect().map(r=>pfAssess(r,pfState.infl)).sort((a,b)=>PF_PRI[b.p]-PF_PRI[a.p]||b.score-a.score);
}
function pfFiltered(all){
  const q=(pfState.q||'').trim().toLowerCase();
  return all.filter(a=>
    pfInWindow(a.b,pfState.win)&&
    (pfState.prio==='all'||a.p===pfState.prio)&&
    (!q||[a.eq.id,a.eq.name,a.eq.brand,a.owner,a.eq.serial].join(' ').toLowerCase().includes(q)));
}

function pfRender(){
  const el=document.getElementById('pfTable');if(!el)return;
  const sw=document.getElementById('pfWin'),sp=document.getElementById('pfPrio'),si=document.getElementById('pfInfl');
  if(sw)sw.value=pfState.win;if(sp)sp.value=pfState.prio;if(si&&document.activeElement!==si)si.value=pfState.infl;

  const all=pfAll(), rows=pfFiltered(all);
  pfRows=rows;
  const cnt=p=>all.filter(a=>a.p===p).length;
  const withDate=all.filter(a=>a.acq).length;
  const complete=all.length?Math.round(withDate/all.length*100):0;
  const budgetWin=pfState.win==='all'?'3':pfState.win;
  const budgetRows=all.filter(a=>a.estCost>0&&pfInWindow(a.b,budgetWin));
  const budget=budgetRows.reduce((s,a)=>s+a.estCost,0);
  const budgetLbl=budgetWin==='now'?'now':'within '+budgetWin+' yr'+(budgetWin==='1'?'':'s');

  document.getElementById('pfSummary').innerHTML=`
    <div class="pf-stat"><div class="v">${all.length}</div><div class="l">Assets assessed</div><div class="s">${rows.length} shown with current filters</div></div>
    <div class="pf-stat crit"><div class="v">${cnt('critical')}</div><div class="l">Critical priority</div><div class="s">Immediate replacement review</div></div>
    <div class="pf-stat high"><div class="v">${cnt('high')}</div><div class="l">High priority</div><div class="s">Prepare for procurement</div></div>
    <div class="pf-stat"><div class="v">${all.filter(a=>a.b==='now').length}</div><div class="l">Replace now</div><div class="s">Life ended / unserviceable</div></div>
    <div class="pf-stat"><div class="v" style="font-size:1.05rem">${pfPeso(budget)}</div><div class="l">Est. budget (${budgetLbl})</div><div class="s">${budgetRows.length} asset(s) with recorded cost</div></div>
    <div class="pf-stat ${complete>=80?'ok':'high'}"><div class="v">${complete}%</div><div class="l">Data completeness</div><div class="s">${withDate} of ${all.length} have acquisition date</div></div>`;

  // chart
  const keys=['now','y1','y2','y3','later'];
  const counts=keys.map(k=>all.filter(a=>a.b===k).length);
  const costs=keys.map(k=>all.filter(a=>a.b===k).reduce((s,a)=>s+a.estCost,0));
  const isDark=document.documentElement.getAttribute('data-theme')==='dark';
  const ctx=document.getElementById('pfChart');
  if(ctx&&window.Chart){
    if(pfChartInstance)pfChartInstance.destroy();
    const tc=isDark?'#a0aec0':'#4a5568';
    pfChartInstance=new Chart(ctx,{type:'bar',
      data:{labels:keys.map(k=>PF_BUCKETS[k]),datasets:[{label:'Assets',data:counts,backgroundColor:['#c0392b','#b7791f','#c9a84c','#2b5ca8','#2d7d46'],borderRadius:5}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},
        tooltip:{callbacks:{afterLabel:c=>'Est. cost: '+pfPeso(costs[c.dataIndex])}}},
        scales:{x:{ticks:{color:tc,font:{size:10}},grid:{display:false}},y:{beginAtZero:true,ticks:{color:tc,precision:0},grid:{color:isDark?'#2d3a55':'#e6e0cc'}}}}});
  }
  const unk=all.filter(a=>a.b==='unknown').length, ver=all.filter(a=>a.b==='verify').length;
  document.getElementById('pfTopPanel').innerHTML=`<h4>🎯 Top priority assets</h4>`+
    (all.filter(a=>a.p!=='low').slice(0,5).map(a=>`<div style="display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:0.74rem">
      <div><b>${pfEsc(a.eq.name)}</b><div class="pf-sub">${pfEsc(a.eq.id)} · ${pfEsc(a.owner)}</div></div>
      <span class="gso-chip pf-p-${a.p}" style="align-self:center">${a.score}</span></div>`).join('')||`<div class="pf-sub" style="padding:10px 0">No medium-or-higher priority assets.</div>`)+
    `<div class="pf-sub" style="margin-top:10px;line-height:1.5">${unk?`⚠️ ${unk} asset(s) lack an acquisition date and cannot be forecast by useful life. `:''}${ver?`🔎 ${ver} lost/missing asset(s) need verification before replacement.`:''}</div>`;

  // table
  if(!rows.length){el.innerHTML=`<div class="empty-state"><div class="es-icon">🛒</div><p>No assets match the current filters</p></div>`;}
  else el.innerHTML=`<table class="pf-table"><thead><tr>
    <th>Priority</th><th>Asset</th><th>Accountable</th><th>Condition</th><th>Acquired</th><th>Useful life</th><th>Remaining life</th><th>Repairs</th><th>Score</th><th>Forecast</th><th>Est. cost</th><th></th></tr></thead><tbody>`+
    rows.map((a,i)=>{
      const scol=a.p==='critical'?'#c0392b':a.p==='high'?'#b7791f':a.p==='medium'?'#2b5ca8':'#2d7d46';
      const stCls=a.st==='Serviceable'?'gso-chip-green':a.st==='Damaged'?'gso-chip-orange':'gso-chip-red';
      return `<tr>
        <td><span class="gso-chip pf-p-${a.p}">${a.p.toUpperCase()}</span></td>
        <td><b>${pfEsc(a.eq.name)}</b><div class="pf-sub">${pfEsc(a.eq.id)} · ${pfEsc(a.eq.brand||'—')}</div></td>
        <td>${pfEsc(a.owner)}</td>
        <td><span class="gso-chip ${stCls}">${pfEsc(a.st)}</span></td>
        <td>${a.acq?a.acq.toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}):'<span class="pf-sub">Not recorded</span>'}</td>
        <td>${a.life} yrs</td>
        <td>${a.rul===null?'<span class="pf-sub">—</span>':a.rul<=0?`<span class="pf-overdue">Overdue ${pfYears(a.rul)}</span>`:pfYears(a.rul)}</td>
        <td>${a.repCount}${a.repCost?`<div class="pf-sub">${pfPeso(a.repCost)}</div>`:''}</td>
        <td><b>${a.score}</b>/100<div class="pf-bar"><i style="width:${a.score}%;background:${scol}"></i></div></td>
        <td>${PF_BUCKETS[a.b]}</td>
        <td>${a.estCost?pfPeso(a.estCost):'<span class="pf-sub">—</span>'}</td>
        <td><button class="pf-edit" title="Edit asset details" onclick="pfEdit(${i})">✏️</button></td></tr>`;}).join('')+`</tbody></table>`;
}

function pfEdit(i){
  const a=pfRows[i];if(!a)return;
  currentStaff=null;                       // keep the forecast view open after saving
  openEditEquipmentModal(a.staffId,a.eq.id);
}
function pfAfterChange(){
  pfUpdateBadge();
  const v=document.getElementById('view-forecast');
  if(v&&v.classList.contains('active'))pfRender();
}
function pfUpdateBadge(){
  const b=document.getElementById('pfBadge');if(!b)return;
  let n=0;try{n=pfAll().filter(a=>a.p==='critical'||a.p==='high').length;}catch(e){}
  b.textContent=n;b.style.display=n>0?'':'none';
}
function showProcurementForecast(){
  setBreadcrumb([{label:'Dashboard',fn:'goHome()'},{label:'Procurement Forecasting Dashboard'}]);
  showView('forecast');
  pfRender();
  logAction('Opened Procurement Forecasting Module');
}

function pfPrintReport(){
  const rows=pfFiltered(pfAll());
  const budget=rows.filter(a=>a.estCost>0).reduce((s,a)=>s+a.estCost,0);
  const col={critical:'#c0392b',high:'#b7791f',medium:'#2b5ca8',low:'#2d7d46'};
  const body=`<p style="font-size:0.74rem;color:#4a5568;margin-bottom:10px;font-family:serif"><i>Decision-support report only. It does not constitute a purchase request, bidding document or approval, and does not replace the LGU's existing procurement procedures.</i></p>
  <table><thead><tr><th>Priority</th><th>Item ID</th><th>Equipment</th><th>Accountable</th><th>Condition</th><th>Acquired</th><th>Useful Life</th><th>Remaining</th><th>Repairs</th><th>Score</th><th>Forecast</th><th>Est. Cost</th></tr></thead><tbody>`+
  rows.map(a=>`<tr><td style="font-weight:700;color:${col[a.p]}">${a.p.toUpperCase()}</td><td>${pfEsc(a.eq.id)}</td><td>${pfEsc(a.eq.name)}<br><span style="color:#718096">${pfEsc(a.eq.brand||'')}</span></td><td>${pfEsc(a.owner)}</td><td>${pfEsc(a.st)}</td>
    <td>${a.acq?a.acq.toLocaleDateString('en-PH'):'N/A'}</td><td>${a.life} yrs${a.lifeDefault?'*':''}</td><td>${a.rul===null?'—':a.rul<=0?'Overdue '+pfYears(a.rul):pfYears(a.rul)}</td>
    <td>${a.repCount}${a.repCost?' ('+pfPeso(a.repCost)+')':''}</td><td>${a.score}</td><td>${PF_BUCKETS[a.b]}</td><td>${a.estCost?pfPeso(a.estCost):'—'}</td></tr>`).join('')+
  `</tbody></table><div style="font-size:0.78rem;margin-top:10px;font-family:serif"><b>Assets listed:</b> ${rows.length} &nbsp; <b>Estimated replacement cost:</b> ${pfPeso(budget)}</div>
   <div style="font-size:0.68rem;color:#718096;margin-top:6px;font-family:serif">* Default useful-life estimate by equipment type. Estimated cost is based on original acquisition cost${pfState.infl?' with '+pfState.infl+'% yearly price increase':''}.</div>`;
  const winLbl=pfState.win==='all'?'All assets':pfState.win==='now'?'Replace now':'Within '+pfState.win+' year(s)';
  openReportWindow('Procurement Forecast Report','Forecast window: '+winLbl+' · Priority: '+(pfState.prio==='all'?'All':pfState.prio),body);
  logAction('Printed Procurement Forecast Report');
}

// Keep the forecast (and nav badge) in sync when assets, repairs or conditions change
['saveEditEquipment','saveAddEquipment','saveRepairRecord','confirmDeleteEquipment','restoreFromBin','applyQuickStatus','updateEqStatus'].forEach(n=>{
  if(typeof window[n]==='function'){
    const orig=window[n];
    window[n]=function(){const r=orig.apply(this,arguments);try{pfAfterChange();}catch(e){}return r;};
  }
});
setTimeout(pfUpdateBadge,1300);

// ── Dashboard summary card + asset-profile remaining-useful-life chip ──
function pfRenderDashCard(){
  const body=document.getElementById('pfDashBody');if(!body)return;
  const all=pfAll();
  const n=f=>all.filter(f).length;
  const y1=all.filter(a=>a.b==='y1');
  const budget=all.filter(a=>a.estCost>0&&(a.b==='now'||a.b==='y1')).reduce((s,a)=>s+a.estCost,0);
  body.innerHTML=
    `<div class="pf-dash-stat crit" onclick="pfOpenFiltered('prio','critical')"><div class="v">${n(a=>a.p==='critical')}</div><div class="l">Critical priority</div></div>
     <div class="pf-dash-stat high" onclick="pfOpenFiltered('prio','high')"><div class="v">${n(a=>a.p==='high')}</div><div class="l">High priority</div></div>
     <div class="pf-dash-stat" onclick="pfOpenFiltered('win','now')"><div class="v">${n(a=>a.b==='now')}</div><div class="l">Replace now</div></div>
     <div class="pf-dash-stat" onclick="pfOpenFiltered('win','1')"><div class="v">${y1.length}</div><div class="l">Due within 1 year</div></div>
     <div class="pf-dash-stat" onclick="pfOpenFiltered('win','1')"><div class="v" style="font-size:1rem">${pfPeso(budget)}</div><div class="l">Est. budget (≤ 1 yr)</div></div>`;
  const miss=n(a=>!a.acq);
  document.getElementById('pfDashNote').textContent=miss?`${miss} of ${all.length} assets have no acquisition date and cannot be forecast by useful life yet.`:'All assets have acquisition dates.';
}
function pfOpenFiltered(k,v){
  pfState.win='all';pfState.prio='all';pfState.q='';
  const q=document.getElementById('pfQ');if(q)q.value='';
  pfState[k]=v;
  showProcurementForecast();
}
function pfProfileChip(eq){
  const acq=pfParseDate(eq.acquiredDate);if(!acq)return '';
  const ul=parseFloat(eq.usefulLife)>0?parseFloat(eq.usefulLife):pfDefaultLife(eq.name);
  const rul=ul-Math.max(0,(new Date()-acq)/31557600000);
  const cls=rul<=0?'over':rul<=1?'soon':'ok';
  const txt=rul<=0?'Life ended '+pfYears(rul)+' ago':'RUL '+pfYears(rul);
  return `<div class="pf-prof-chip ${cls}" title="Remaining Useful Life = Expected Useful Life − Elapsed Useful Life">⏳ ${txt}</div>`;
}
(function(){
  const o=window.pfAfterChange;
  window.pfAfterChange=function(){o();try{pfRenderDashCard();}catch(e){}};
  const u=window.updateDashStats;
  if(typeof u==='function')window.updateDashStats=function(){const r=u.apply(this,arguments);try{pfRenderDashCard();}catch(e){}return r;};
  setTimeout(pfRenderDashCard,1400);
})();
(function(){
  const o=window.pfAfterChange;
  window.pfAfterChange=function(){o();try{lcRenderDashCard();}catch(e){}};
  const u=window.updateDashStats;
  if(typeof u==='function')window.updateDashStats=function(){const r=u.apply(this,arguments);try{lcRenderDashCard();}catch(e){}return r;};
  // Defined in a later script block, so resolve it after the page has finished parsing.
  setTimeout(function(){try{lcRenderDashCard();}catch(e){}},1500);
})();
