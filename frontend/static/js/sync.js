/* Katipunan AMS - Data synchronization and local persistence
   Extracted from frontend/templates/index.html. */

// ══════════════════════════════════════════════════════════
// DATA SYNCHRONIZATION — local persistence + change queue + sync center
// ══════════════════════════════════════════════════════════
const SYNC_STORE='mets_staffdata', SYNC_HIST='mets_sync_history', SYNC_URL='mets_sync_url';
const SYNC_LABELS={qr_scan:'QR scan',status_update:'Status update',location_update:'Location update',asset_add:'Asset added',asset_update:'Asset edited',asset_delete:'Asset deleted',asset_restore:'Asset restored',repair_add:'Repair logged',transfer_add:'Transfer recorded',borrow_issue:'Borrow slip issued'};
let _syncing=false, _lastSnap='';
function syncDeviceId(){let d=localStorage.getItem('mets_device_id');if(!d){d='DEV-'+Math.random().toString(36).slice(2,8).toUpperCase();localStorage.setItem('mets_device_id',d);}return d;}
function syncHistory(){try{return JSON.parse(localStorage.getItem(SYNC_HIST)||'[]');}catch(e){return[];}}
function syncPushHistory(h){const a=syncHistory();a.unshift(h);localStorage.setItem(SYNC_HIST,JSON.stringify(a.slice(0,50)));}

// 1) Restore locally saved asset records (offline data survives reloads)
(function(){
  try{
    const raw=localStorage.getItem(SYNC_STORE);
    if(raw){const d=JSON.parse(raw);Object.keys(d).forEach(k=>{if(Array.isArray(d[k]))staffData[k]=d[k];});_lastSnap=raw;}
  }catch(e){console.warn('Local asset restore failed',e);}
})();
function persistAssets(){
  if(window.__KAT_REMOTE_HYDRATE__)return;
  try{const j=JSON.stringify(staffData);if(j!==_lastSnap){localStorage.setItem(SYNC_STORE,j);_lastSnap=j;}}
  catch(e){console.warn('Local save failed (storage full?)',e);}
}
setInterval(persistAssets,2000);
window.addEventListener('beforeunload',persistAssets);
setTimeout(()=>{try{updateDashStats();buildAlertsPanel();buildStatusChart();}catch(e){}},300);

// 2) Queue every asset-related change for synchronization
function _findAsset(id){for(const l of Object.values(staffData)){if(!Array.isArray(l))continue;for(const s of l){if((s.equipment||[]).some(e=>e.id===id))return s;}}return null;}
function _val(id){const e=document.getElementById(id);return e?e.value.trim():'';}
function _wrapQ(name,pre,post){
  if(typeof window[name]!=='function')return;
  const o=window[name];
  window[name]=function(){
    let p=null;try{p=pre?pre.apply(null,arguments):null;}catch(e){}
    const r=o.apply(this,arguments);
    try{post(p,arguments);}catch(e){}
    return r;
  };
}
_wrapQ('saveAddEquipment',()=>({id:_val('addEqId'),name:_val('addEqName')}),p=>{if(p.id&&p.name&&_findAsset(p.id))queueSync('asset_add',{assetId:p.id,name:p.name,timestamp:new Date().toISOString()});});
_wrapQ('saveEditEquipment',()=>({id:_val('editEqOrigId')}),p=>{if(p.id&&!document.getElementById('editEquipmentModal').classList.contains('open'))queueSync('asset_update',{assetId:_val('editEqId')||p.id,timestamp:new Date().toISOString()});});
_wrapQ('confirmDeleteEquipment',()=>({id:document.getElementById('delEqConfirmModal').dataset.eqId}),p=>{if(p.id&&!_findAsset(p.id))queueSync('asset_delete',{assetId:p.id,timestamp:new Date().toISOString()});});
_wrapQ('restoreFromBin',i=>({n:recycleBin.length,id:recycleBin[i]&&recycleBin[i].id}),p=>{if(p.id&&recycleBin.length<p.n)queueSync('asset_restore',{assetId:p.id,timestamp:new Date().toISOString()});});
_wrapQ('saveRepairRecord',id=>({id,n:getRepairs(id).length}),p=>{if(getRepairs(p.id).length>p.n)queueSync('repair_add',{assetId:p.id,timestamp:new Date().toISOString()});});
_wrapQ('saveTransferRecord',id=>({id,n:getTransfers(id).length}),p=>{if(getTransfers(p.id).length>p.n)queueSync('transfer_add',{assetId:p.id,timestamp:new Date().toISOString()});});
_wrapQ('saveBorrowRecord',id=>({id,n:getBorrows(id).length}),p=>{if(getBorrows(p.id).length>p.n)queueSync('borrow_issue',{assetId:p.id,timestamp:new Date().toISOString()});});

// 3) Synchronization (sends to the configured endpoint; otherwise runs in simulated mode)
window.syncNow=async function(){
  if(_syncing)return;
  if(!isOnline){showSyncToast('📴 Offline — changes will sync when connection returns');return;}
  if(!pendingSync.length){showSyncToast('✅ Nothing to sync');return;}
  _syncing=true;
  const bar=document.getElementById('syncStatusBar'),txt=document.getElementById('syncStatusText');
  const batch=pendingSync.slice(), url=localStorage.getItem(SYNC_URL)||'';
  if(bar)bar.className='syncing';if(txt)txt.textContent=`Syncing ${batch.length} change(s)...`;
  try{
    if(url){
      const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({device:syncDeviceId(),sentAt:new Date().toISOString(),changes:batch})});
      if(!res.ok)throw new Error('Server responded HTTP '+res.status);
    } else {
      await new Promise(r=>setTimeout(r,900));      // simulated: no server configured
    }
    pendingSync=pendingSync.filter(x=>!batch.includes(x));
    localStorage.setItem('mets_pending_sync',JSON.stringify(pendingSync));
    syncPushHistory({time:new Date().toISOString(),count:batch.length,mode:url?'server':'simulated',ok:true});
    logAction(`Synced ${batch.length} record(s) (${url?'central database':'simulated mode'})`);
    showSyncToast('✅ Sync complete — '+batch.length+' change(s)');
  }catch(e){
    syncPushHistory({time:new Date().toISOString(),count:batch.length,mode:url?'server':'simulated',ok:false,error:String(e.message||e)});
    showSyncToast('⚠️ Sync failed — changes kept in queue');
  }finally{_syncing=false;updateSyncBar();}
};
setInterval(()=>{if(isOnline&&pendingSync.length&&localStorage.getItem(SYNC_URL))syncNow();},30000);   // retry failed server syncs

(function(){
  const o=window.updateSyncBar;
  window.updateSyncBar=function(){
    o.apply(this,arguments);
    const scanPending=(typeof window.__KAT_SCAN_PENDING__==='number')?window.__KAT_SCAN_PENDING__:0;
    const total=pendingSync.length+scanPending;
    const b=document.getElementById('syncNavBadge');
    if(b){b.textContent=total;b.style.display=total?'':'none';}
    const g=document.getElementById('gdpSyncBadge');
    if(g){g.textContent=total;g.style.display=total?'':'none';}
    const st=document.getElementById('gdpSyncState');
    if(st){st.textContent=total?total+' item(s) pending sync':'All records synced';st.style.color=total?'#e0a030':'#34A853';}
    const v=document.getElementById('view-synccenter');
    if(v&&v.classList.contains('active'))syncRender();
  };
  const bar=document.getElementById('syncStatusBar');
  if(bar){bar.style.cursor='pointer';bar.title='Open Data Synchronization';bar.addEventListener('click',e=>{if(e.target.id!=='syncNowBtn')showSyncCenter();});}
  setTimeout(()=>window.updateSyncBar(),400);
})();

function showSyncCenter(){
  setBreadcrumb([{label:'Dashboard',fn:'goHome()'},{label:'Data Synchronization'}]);
  showView('synccenter');syncRender();logAction('Opened Data Synchronization');
}
function syncRender(){
  const url=localStorage.getItem(SYNC_URL)||'', hist=syncHistory(), last=hist.find(h=>h.ok);
  const inp=document.getElementById('syncUrl');if(inp&&document.activeElement!==inp)inp.value=url;
  document.getElementById('syncSummary').innerHTML=`
    <div class="pf-stat ${isOnline?'ok':'high'}"><div class="v" style="font-size:1.05rem">${isOnline?'● Online':'● Offline'}</div><div class="l">Connection</div><div class="s">${isOnline?'Changes sync automatically':'Changes are saved on this device'}</div></div>
    <div class="pf-stat ${pendingSync.length?'high':'ok'}"><div class="v">${pendingSync.length}</div><div class="l">Pending changes</div><div class="s">Waiting to be synchronized</div></div>
    <div class="pf-stat"><div class="v" style="font-size:1rem">${last?new Date(last.time).toLocaleString('en-PH'):'Never'}</div><div class="l">Last successful sync</div><div class="s">${last?last.count+' change(s)':'No sync yet'}</div></div>
    <div class="pf-stat"><div class="v" style="font-size:1.05rem">${url?'Server':'Simulated'}</div><div class="l">Sync mode</div><div class="s">Device ${syncDeviceId()}</div></div>`;
  document.getElementById('syncModeNote').innerHTML=url
    ?`<span style="font-size:1.1rem">🌐</span><div><b>Server mode.</b> Pending changes are sent as JSON (<code>POST</code>) to the endpoint above. If the server is unreachable they stay in the queue and retry automatically.</div>`
    :`<span style="font-size:1.1rem">ℹ️</span><div><b>Simulated mode.</b> No central database endpoint is configured, so a sync only clears the local queue. Enter the API address of the MySQL-backed server above to send changes for real. Asset records are always kept on this device, so offline work survives a page reload.</div>`;
  document.getElementById('syncPending').innerHTML=pendingSync.length?
    `<table class="pf-table" style="min-width:0"><thead><tr><th>Time</th><th>Change</th><th>Asset</th></tr></thead><tbody>`+
    pendingSync.slice().reverse().map(x=>`<tr><td>${new Date(x.timestamp).toLocaleString('en-PH')}</td><td>${pfEsc(SYNC_LABELS[x.action]||x.action)}${x.data&&x.data.newStatus?`<div class="pf-sub">→ ${pfEsc(x.data.newStatus)}</div>`:''}${x.data&&x.data.newLocation?`<div class="pf-sub">→ ${pfEsc(x.data.newLocation)}</div>`:''}${x.data&&x.data.scannedLat!=null?`<div class="pf-sub">📍 ${Number(x.data.scannedLat).toFixed(6)}, ${Number(x.data.scannedLng).toFixed(6)}${x.data.scannedAccuracy!=null?' (±'+x.data.scannedAccuracy+'m)':''}${x.data.scannedDemo?' · demo':''}</div>`:''}</td><td>${pfEsc((x.data&&x.data.assetId)||'—')}</td></tr>`).join('')+`</tbody></table>`
    :`<div class="empty-state" style="padding:24px"><div class="es-icon">✅</div><p>All changes are synchronized</p></div>`;
  document.getElementById('syncHistory').innerHTML=hist.length?
    `<table class="pf-table" style="min-width:0"><thead><tr><th>Time</th><th>Result</th><th>Mode</th></tr></thead><tbody>`+
    hist.map(h=>`<tr><td>${new Date(h.time).toLocaleString('en-PH')}</td><td>${h.ok?`<span class="gso-chip gso-chip-green">✔ ${h.count} synced</span>`:`<span class="gso-chip gso-chip-red">✕ Failed</span><div class="pf-sub">${pfEsc(h.error||'')}</div>`}</td><td>${h.mode}</td></tr>`).join('')+`</tbody></table>`
    :`<div class="empty-state" style="padding:24px"><div class="es-icon">🕘</div><p>No sync history yet</p></div>`;
}
function syncSaveUrl(){
  const v=document.getElementById('syncUrl').value.trim();
  if(v&&!/^https?:\/\//i.test(v)){alert('Enter a full address starting with http:// or https://');return;}
  if(v)localStorage.setItem(SYNC_URL,v);else localStorage.removeItem(SYNC_URL);
  logAction('Sync endpoint '+(v?'set':'cleared'));showSyncToast('💾 Sync settings saved');syncRender();
}
function syncResetCache(){
  if(!confirm('Remove the locally saved asset records and restore the built-in sample data?\n\nPending sync changes should be synchronized first.'))return;
  localStorage.removeItem(SYNC_STORE);_lastSnap='__reset__';
  window.removeEventListener('beforeunload',persistAssets);
  location.reload();
}

// ══════════════════════════════════════════════════════════
// ASSET LIFE CYCLE MONITORING
// Acquisition → Assignment → In service → Maintenance/Repair → Near end of life → End of life / Replacement
// ══════════════════════════════════════════════════════════
const LC_STAGES={inservice:{label:'In service',cls:'gso-chip-green',color:'#2d7d46'},near:{label:'Near end of life',cls:'gso-chip-orange',color:'#b7791f'},repair:{label:'Damaged / under repair',cls:'gso-chip-orange',color:'#c9a84c'},eol:{label:'End of life',cls:'gso-chip-red',color:'#c0392b'},lost:{label:'Lost / missing',cls:'gso-chip-red',color:'#8b0000'},nodata:{label:'No life cycle data',cls:'gso-chip-navy',color:'#718096'}};
let lcState={stage:'all',q:''};
function lcStage(a){
  if(a.st==='Lost'||a.st==='Missing')return 'lost';
  if(a.st==='Unserviceable'||(a.rul!==null&&a.rul<=0))return 'eol';
  if(a.st==='Damaged')return 'repair';
  if(a.rul===null)return 'nodata';
  if(a.rul<=1||a.elapsed/a.life>=0.8)return 'near';
  return 'inservice';
}
function lcNext(k){return {inservice:'Continue regular use and maintenance',near:'Plan replacement — see Procurement Forecast',repair:'Complete repair or assess for replacement',eol:'Assess for disposal or replacement',lost:'Verify and report per COA rules',nodata:'Record acquisition date to monitor life cycle'}[k];}
function lcAll(){
  return pfAll().map(a=>{a.stage=lcStage(a);a.transfers=(()=>{try{return getTransfers(a.eq.id).length;}catch(e){return 0;}})();return a;});
}
function lcSet(k,v){lcState[k]=v;lcRender();}
const LC_PREVENTIVE=['Preventive Maintenance','Calibration','Cleaning & Inspection'];
function lcRepairCell(a){
  const reps=(a.r&&a.r.repairs)||[];
  if(!reps.length)return '<span class="pf-sub">No repairs</span>';
  const last=reps.slice().sort((x,y)=>(pfParseDate(y.date)||0)-(pfParseDate(x.date)||0))[0];
  const d=pfParseDate(last.date);
  return `<b>${reps.length}</b> record${reps.length!==1?'s':''}<div class="pf-sub">Last: ${pfEsc(last.type||'Repair')}${d?' · '+d.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}):''}</div>`;
}
function lcCostCell(a){
  const reps=(a.r&&a.r.repairs)||[];
  const tot=reps.reduce((n,x)=>n+pfNum(x.cost),0);
  if(!tot)return '<span class="pf-sub">'+(reps.length?'No cost recorded':'—')+'</span>';
  const prev=reps.filter(x=>LC_PREVENTIVE.includes(x.type)).reduce((n,x)=>n+pfNum(x.cost),0);
  return `<b>${pfPeso(tot)}</b><div class="pf-sub">Preventive ${pfPeso(prev)} · Corrective ${pfPeso(tot-prev)}</div>`;
}
function lcRender(){
  const el=document.getElementById('lcTable');if(!el)return;
  const all=lcAll();
  const q=(lcState.q||'').toLowerCase().trim();
  const rows=all.filter(a=>(lcState.stage==='all'||a.stage===lcState.stage)&&(!q||[a.eq.id,a.eq.name,a.eq.brand,a.owner].join(' ').toLowerCase().includes(q)));
  window._lcRows=rows;
  (function(){
    const n=all.length,pes=pfPeso;
    const withAcq=all.filter(a=>a.acq).length;
    const withLife=all.filter(a=>!a.lifeDefault).length;
    const withRep=all.filter(a=>a.repCount>0).length;
    const totCost=all.reduce((x,a)=>x+a.repCost,0);
    const withCost=all.filter(a=>a.repCost>0).length;
    const items=[
      ['📥','Acquisition',withAcq+' / '+n,withAcq===n,withAcq+' of '+n+' assets have an acquisition date'],
      ['⏳','Expected useful life',withLife+' / '+n,withLife===n,withLife+' of '+n+' assets have a useful life set; the rest use a default'],
      ['🩺','Current condition',n+' / '+n,true,'Condition recorded for every asset'],
      ['🔧','Repair history',withRep+' with records',withRep>0,withRep+' assets have repair or maintenance records'],
      ['💰','Maintenance cost',withCost?pes(totCost):'none yet',withCost>0,withCost?'Total repair and maintenance cost recorded':'No repair or maintenance cost recorded yet']
    ];
    const t=document.getElementById('lcTracked');
    const dn=document.getElementById('lcDemoNote');if(dn)dn.style.display=window._demoSeeded?'':'none';
    if(t)t.innerHTML=items.map(i=>`<span title="${i[4]}" style="display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border);border-radius:999px;padding:5px 12px;font-size:0.76rem;color:var(--text-dark)"><span style="width:8px;height:8px;border-radius:50%;background:${i[3]?'#2d7d46':'#b7791f'}"></span>${i[0]} <b>${i[1]}</b> <span class="pf-sub">${i[2]}</span></span>`).join('');
  })();
  const c=k=>all.filter(a=>a.stage===k).length;
  const ss=document.getElementById('lcStageSel');if(ss)ss.value=lcState.stage;
  document.getElementById('lcSummary').innerHTML=Object.keys(LC_STAGES).filter(k=>k!=='nodata').map(k=>
    `<div class="pf-stat" style="border-left-color:${LC_STAGES[k].color};cursor:pointer" onclick="lcSet('stage','${k}')"><div class="v" style="color:${LC_STAGES[k].color}">${c(k)}</div><div class="l">${LC_STAGES[k].label}</div><div class="s">${all.length?Math.round(c(k)/all.length*100):0}% of assets</div></div>`).join('');
  el.innerHTML=rows.length?`<table class="pf-table" style="min-width:0"><thead><tr><th>Stage</th><th>Asset</th><th>Accountable</th><th>Acquired</th><th>Useful life</th><th>Remaining</th><th>Current condition</th><th>Repair history</th><th>Maintenance cost</th><th></th></tr></thead><tbody>`+
    rows.map((a,i)=>{
      return `<tr><td><span class="gso-chip ${LC_STAGES[a.stage].cls}">${LC_STAGES[a.stage].label}</span></td>
      <td><b>${pfEsc(a.eq.name)}</b><div class="pf-sub">${pfEsc(a.eq.id)} · ${pfEsc(a.eq.brand||'—')}</div></td><td>${pfEsc(a.owner)}</td>
      <td style="white-space:nowrap">${a.acq?a.acq.toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}):'<span class="pf-sub">Not set</span>'}</td>
      <td style="white-space:nowrap">${a.life} yrs${a.lifeDefault?' <span class="pf-sub">(default)</span>':''}</td>
      <td style="white-space:nowrap">${a.rul===null?'<span class="pf-sub">—</span>':a.rul<=0?`<span class="pf-overdue">Ended ${pfYears(a.rul)} ago</span>`:pfYears(a.rul)}</td>
      <td><span class="eq-status ${getStatusClass(a.st)}" style="font-size:0.62rem">${pfEsc(a.st)}</span></td>
      <td>${lcRepairCell(a)}</td><td>${lcCostCell(a)}</td>
      <td style="white-space:nowrap"><button class="pf-edit" onclick="lcTimeline(${i})">🕘 Timeline</button> <button class="pf-edit" title="Edit asset" onclick="lcEdit(${i})">✏️</button></td></tr>`;}).join('')+`</tbody></table>`
    :`<div class="empty-state"><div class="es-icon">♻️</div><p>No assets match the current filters</p></div>`;
  document.getElementById('lcMethod').innerHTML=`<summary>📐 How stages are determined</summary>
    <p style="margin-top:8px"><code>Remaining Useful Life = Expected Useful Life − Elapsed Useful Life</code>. <b>End of life:</b> useful life used up or asset Unserviceable. <b>Near end of life:</b> 1 year or less remaining, or 80% of life used. <b>Damaged / under repair:</b> status Damaged. <b>Lost / missing:</b> status Lost or Missing. <b>No life cycle data:</b> no acquisition date recorded. Assets with an assumed useful life are marked <i>default</i>.</p>`;
}
function lcEdit(i){const a=window._lcRows[i];if(!a)return;currentStaff=null;openEditEquipmentModal(a.staffId,a.eq.id);}
function lcTimeline(i){
  const a=window._lcRows[i];if(!a)return;
  const ev=[];
  if(a.acq)ev.push({d:a.acq,icon:'📥',t:'Acquired',s:(a.amount?pfPeso(a.amount)+' · ':'')+'Assigned to '+a.owner});
  try{getTransfers(a.eq.id).forEach(t=>{const d=pfParseDate(t.date);if(d)ev.push({d,icon:'🔄',t:`Transferred: ${t.from||'—'} → ${t.to||'—'}`,s:[t.fromOffice&&t.toOffice?t.fromOffice+' → '+t.toOffice:'',t.reason].filter(Boolean).join(' · ')});});}catch(e){}
  a.r.repairs.forEach(r=>{const d=pfParseDate(r.date);if(d)ev.push({d,icon:'🔧',t:(r.type||'Repair')+(r.status?' → '+r.status:''),s:(r.cost?pfPeso(pfNum(r.cost))+' · ':'')+(r.tech||'')});});
  const ls=pfParseDate(a.eq.lastScanDate);if(ls)ev.push({d:ls,icon:'📱',t:'Last QR scan',s:''});
  ev.sort((x,y)=>x.d-y.d);
  const eol=a.acq?new Date(a.acq.getTime()+a.life*31557600000):null;
  const html=`<div style="font-size:1.05rem;font-weight:700;color:var(--text-dark)">${pfEsc(a.eq.name)} <span class="gso-chip ${LC_STAGES[a.stage].cls}" style="vertical-align:middle">${LC_STAGES[a.stage].label}</span></div>
    <div class="pf-sub" style="margin-bottom:12px">${pfEsc(a.eq.id)} · ${pfEsc(a.eq.brand||'—')} · ${pfEsc(a.owner)}</div>
    <div class="pf-sub" style="margin-bottom:12px"><b>Next step:</b> ${lcNext(a.stage)}</div>
    <div class="pf-cards" style="margin-bottom:12px">
      <div class="pf-stat"><div class="v" style="font-size:1rem">${a.rul===null?'—':a.rul<=0?'Ended':pfYears(a.rul)}</div><div class="l">Remaining useful life</div></div>
      <div class="pf-stat"><div class="v" style="font-size:1rem">${eol?eol.toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}):'—'}</div><div class="l">Expected end of life</div></div>
      <div class="pf-stat"><div class="v" style="font-size:1rem">${a.p.toUpperCase()}</div><div class="l">Replacement priority</div><div class="s">${PF_BUCKETS[a.b]}</div></div></div>
    <div style="border-left:2px solid var(--border);margin-left:8px;padding-left:16px">`+
    (ev.length?ev.map(e=>`<div style="position:relative;margin-bottom:12px"><span style="position:absolute;left:-26px;top:0;background:var(--card);font-size:0.9rem">${e.icon}</span><div style="font-size:0.8rem;font-weight:700;color:var(--text-dark)">${pfEsc(e.t)}</div><div class="pf-sub">${e.d.toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'})}${e.s?' · '+pfEsc(e.s):''}</div></div>`).join(''):'<div class="pf-sub">No recorded events. Record an acquisition date to start the timeline.</div>')+
    (eol?`<div style="position:relative"><span style="position:absolute;left:-26px;top:0;background:var(--card);font-size:0.9rem">🏁</span><div style="font-size:0.8rem;font-weight:700;color:var(--text-dark)">${eol<new Date()?'Expected end of life (passed)':'Expected end of life (projected)'}</div><div class="pf-sub">${eol.toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'})} · ${pfEsc(a.rec)}</div></div>`:'')+`</div>`;
  showBigModal('lcModal',html);
}
function lcRenderDashCard(){
  const body=document.getElementById('lcDashBody');if(!body)return;
  // Age-based stages only. Condition (damaged / lost / missing) is already shown in the chart above.
  const KEYS=['near','eol'];   // 'In service' omitted (covered by Serviceable in the chart); 'No data' shown as a note only
  const all=lcAll();
  const c=k=>all.filter(a=>a.stage===k).length;
  body.innerHTML=KEYS.map(k=>
    `<div class="pf-dash-stat" style="border-left:3px solid ${LC_STAGES[k].color}" onclick="lcOpenFiltered('${k}')"><div class="v" style="color:${LC_STAGES[k].color}">${c(k)}</div><div class="l">${LC_STAGES[k].label}</div></div>`).join('');
  const dueSoon=all.filter(a=>a.rul!==null&&a.rul>0&&a.rul<=1).length;
  const needAttn=c('near')+c('eol'), noDate=c('nodata');
  document.getElementById('lcDashNote').textContent=all.length
    ?`${needAttn} of ${all.length} assets are near or past their useful life.${dueSoon?` ${dueSoon} will reach end of life within a year.`:''}${noDate?` ${noDate} have no acquisition date yet, so their life cycle can't be tracked.`:''}`
    :'No assets tracked yet.';
}
function lcOpenFiltered(k){
  lcState.stage=k;lcState.q='';
  const q=document.getElementById('lcQ');if(q)q.value='';
  showLifeCycle();
}
function showLifeCycle(){
  setBreadcrumb([{label:'Dashboard',fn:'goHome()'},{label:'Life Cycle Monitoring'}]);
  showView('lifecycle');lcRender();logAction('Opened Asset Life Cycle Monitoring');
}
(function(){
  const o=window.pfAfterChange;
  window.pfAfterChange=function(){o();try{const v=document.getElementById('view-lifecycle');if(v&&v.classList.contains('active'))lcRender();}catch(e){}};
})();

// ══════════════════════════════════════════════════════════
// EXAMPLE DATA (demonstration only) — fills blank acquisition date, useful life,
// amount and repair/maintenance records so the Life Cycle and Procurement Forecast
// modules have values to show. Existing values are never overwritten.
// "Remove example data" (Life Cycle page) turns this off.
// ══════════════════════════════════════════════════════════
(function seedExampleData(){
  // Demo data is disabled: the system must contain only real records.
  return;
  try{
    if(localStorage.getItem('mets_demo_off')==='1')return;
    const hash=str=>{let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0);};
    const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const ANCHOR=new Date(2026,9,1);
    const priceFor=n=>{n=(n||'').toLowerCase();
      if(/laptop/.test(n))return 55000;if(/desktop|computer/.test(n))return 38000;if(/printer/.test(n))return 12000;
      if(/scanner/.test(n))return 9000;if(/air.?con/.test(n))return 32000;if(/projector/.test(n))return 28000;
      if(/typewriter/.test(n))return 15000;if(/calculator/.test(n))return 1500;if(/scale|weigh/.test(n))return 6000;
      if(/radio|phone/.test(n))return 7000;return 8000;};
    const TYPES=['Preventive Maintenance','Corrective Repair','Parts Replacement','Calibration','Cleaning & Inspection','Major Overhaul'];
    const COST={'Preventive Maintenance':[300,1200],'Corrective Repair':[800,6000],'Parts Replacement':[1500,9000],'Calibration':[400,1500],'Cleaning & Inspection':[200,800],'Major Overhaul':[5000,15000]};
    const TECH=['J. Ramos','M. Dela Cruz','R. Tan','IT Section','GSO Maintenance'];
    let rep={};try{rep=JSON.parse(localStorage.getItem('mets_repairs')||'{}')||{};}catch(e){}
    let changed=false,seeded=false;
    for(const list of Object.values(staffData)){
      if(!Array.isArray(list))continue;
      list.forEach(st=>(st.equipment||[]).forEach(eq=>{
        const h=hash(String(eq.id));
        // acquisition date
        if(!pfParseDate(eq.acquiredDate)){
          const life=parseFloat(eq.usefulLife)>0?parseFloat(eq.usefulLife):pfDefaultLife(eq.name);
          const f=0.05+((h%100)/100)*1.0;
          const d=new Date(ANCHOR.getTime()-life*f*365.25*86400000);
          eq.acquiredDate=MON[d.getMonth()]+' '+(1+(h>>>8)%28)+', '+d.getFullYear();
          seeded=true;
        }
        // expected useful life (about half; the rest keep the "default" label)
        if(!(parseFloat(eq.usefulLife)>0)&&h%2===0){eq.usefulLife=pfDefaultLife(eq.name);seeded=true;}
        // amount
        if(pfNum(eq.amount)===0){eq.amount=String(Math.round(priceFor(eq.name)*(0.85+((h>>>4)%31)/100)/50)*50);seeded=true;}
        // repair / maintenance history
        if(!(rep[eq.id]&&rep[eq.id].length)){
          const bad=eq.status==='Damaged'||eq.status==='Unserviceable';
          if(h%3===0||bad){
            const n=bad?1+h%2:1+h%3;
            const acq=pfParseDate(eq.acquiredDate)||ANCHOR;
            const span=Math.max(30*86400000,ANCHOR.getTime()-acq.getTime());
            const rows=[];
            for(let k=0;k<n;k++){
              const type=(bad&&k===n-1)?'Corrective Repair':TYPES[(h>>>(k*3))%TYPES.length];
              const [lo,hi]=COST[type];
              const cost=Math.round((lo+((h>>>(k+5))%100)/100*(hi-lo))/50)*50;
              const when=new Date(acq.getTime()+span*((k+1)/(n+1)));
              const date=when.getFullYear()+'-'+String(when.getMonth()+1).padStart(2,'0')+'-'+String(when.getDate()).padStart(2,'0');
              rows.push({type,date,cost:String(cost),status:(bad&&k===n-1)?(eq.status==='Unserviceable'?'For Further Repair':'Damaged'):'Serviceable',tech:TECH[(h>>>(k+2))%TECH.length],coord:'GSO',recordedAt:when.toISOString(),demo:true});
            }
            rep[eq.id]=rows;changed=true;seeded=true;
          }
        }
      }));
    }
    if(changed)localStorage.setItem('mets_repairs',JSON.stringify(rep));
    window._demoSeeded=seeded;
  }catch(e){console.error('Example data error',e);}
})();
function lcClearDemo(){
  if(!confirm('Remove all example data? Example repair records will be deleted and example dates, useful life and amounts will no longer be filled in.'))return;
  try{
    const rep=JSON.parse(localStorage.getItem('mets_repairs')||'{}');
    Object.keys(rep).forEach(k=>{rep[k]=(rep[k]||[]).filter(r=>!r.demo);if(!rep[k].length)delete rep[k];});
    localStorage.setItem('mets_repairs',JSON.stringify(rep));
    localStorage.setItem('mets_demo_off','1');
  }catch(e){}
  location.reload();
}

function _csvDl(name,rows){const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  const b=new Blob(['\ufeff'+rows.map(r=>r.map(q).join(',')).join('\r\n')],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();}
function exportMasterCSV(){const list=getAllEquipment();
  const cols=['id','name','description','brand','serial','category','status','location','owner','amount','acquired','acquisitionDate','usefulLife','life','regLat','regLng','lastScanLat','lastScanLng'];
  const used=cols.filter(c=>list.some(e=>e&&e[c]!=null&&e[c]!==''));
  _csvDl('asset_master_list_'+new Date().toISOString().slice(0,10)+'.csv',[used].concat(list.map(e=>used.map(c=>e[c]))));
  logAction('Downloaded master list CSV ('+list.length+' assets)');}
function exportActivityLogCSV(){_csvDl('activity_log.csv',[['User','Action','Date/Time','Coordinates']].concat(activityLog.map(e=>[e.user,e.msg,e.time,e.geo||''])));}

const ROLE_PERMS={
  oic:['*'],
  inspector:['view:dashboard','view:municipal','view:dept','view:staff','view:profile','view:equipment','view:search','view:lifecycle','view:gsorecords','view:activitylog','view:mobilescanner','view:synccenter','view:reports','updatestatus','repair'],
  gsostaff:['view:dashboard','view:municipal','view:dept','view:staff','view:profile','view:equipment','view:search','view:lifecycle','view:mobilescanner','view:synccenter','view:reports','view:gsorecords','editasset','updatestatus','qr','borrow','repair'],
  officehead:['view:dashboard','view:municipal','view:dept','view:staff','view:profile','view:equipment','view:search','view:lifecycle','view:gsorecords','view:reports','view:activitylog','view:mobilescanner','view:synccenter']
};
function curRole(){return (typeof currentGSOUser!=='undefined'&&currentGSOUser)?currentGSOUser:null;}
function can(a){const r=curRole(),p=ROLE_PERMS[(r&&r.perm)||'oic']||[];return p.includes('*')||p.includes(a);}
function denyMsg(what){const r=curRole();showSyncToast('🔒 '+((r&&r.role)||'Your role')+' is not allowed to '+what+'.');}
(function(){
  const sv=window.showView;
  window.showView=function(id){if(!can('view:'+id)){denyMsg('open this page');logAction('Access denied: '+id+' ('+((curRole()||{}).role||'')+')');return;}return sv.apply(this,arguments);};
  const G={editasset:['saveAddEquipment','saveEditEquipment','openAddEquipmentModal','openEditEquipmentModal'],
    borrow:['openBorrowModal','saveBorrowRecord','markBorrowReturned'],
    qr:['openQRModal'],updatestatus:['quickUpdateStatus','applyQuickStatus'],export:['exportMasterCSV','exportActivityLogCSV'],
    edit:['saveAddPersonnel','saveEditPersonnel','openAddPersonnelModal','openEditPersonnelModal','saveAddOffice','saveEditOffice','openAddOfficeModal','openEditOfficeModal'],
    delete:['deleteEquipment','confirmDeleteEquipment','deletePersonnel','deleteOfficeSection','deleteEquipmentByEqId','emptyRecycleBin'],
    transfer:['saveTransferRecord'],repair:['saveRepairRecord'],
    backup:['backupToHardDrive','backupToGoogleDrive'],restore:['restoreFromBackup'],
    settings:['resetSystemFull','syncResetCache']};
  Object.keys(G).forEach(a=>G[a].forEach(n=>{const o=window[n];if(typeof o!=='function')return;window[n]=function(){if(!can(a)){denyMsg(({editasset:'add or edit asset records',borrow:'record borrow/issuance',qr:'generate QR codes',updatestatus:'update asset status',export:'export data',edit:'manage personnel and offices',delete:'delete records',transfer:'record transfers',repair:'record repairs',backup:'create backups',restore:'restore backups',settings:'change system settings'})[a]);return;}return o.apply(this,arguments);};}));
  const dl=window.doLogin;
  window.doLogin=function(){const un=(document.getElementById('loginUsername')||{}).value,was=isGSOLoggedIn;dl.apply(this,arguments);
    if(isGSOLoggedIn&&curRole()&&(!was||true)&&isGSOLoggedIn)logAction('Logged in: '+curRole().name+' ('+curRole().role+')');else logAction('Failed login attempt: '+(un||''));};
})();

const BK_KEYS=/^mets_(staffdata|log|recycle|photos|borrows|repairs|transfers|updates|custom|global|hidden|pf|demo|slip)/;
function bkStore(){const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(BK_KEYS.test(k))o[k]=localStorage.getItem(k);}
  try{o.mets_staffdata=JSON.stringify(staffData);}catch(e){}return o;}
function restoreFromBackup(){
  const inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';
  inp.onchange=()=>{const f=inp.files[0];if(!f)return;const rd=new FileReader();
    rd.onload=()=>{let b;try{b=JSON.parse(rd.result);}catch(e){alert('Restore failed: this is not a valid backup file.');return;}
      if(!b||typeof b.store!=='object'||!b.store||!b.store.mets_staffdata){alert('Restore failed: this backup has no full data set (older format or wrong file). Create a new backup and try again.');logAction('Restore rejected: invalid file '+f.name);return;}
      if(!confirm('Restore backup from '+(b.timestamp||'unknown date')+'?\n\nAssets in backup: '+(b.totalAssets??'?')+'\n\nCurrent data will be replaced. A copy of the current data will be downloaded first.'))return;
      try{const cur=JSON.stringify({timestamp:new Date().toISOString(),format:2,store:bkStore()});
        const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([cur],{type:'application/json'}));a.download='PreRestore_'+bkFileName();a.click();}catch(e){}
      const rm=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(BK_KEYS.test(k))rm.push(k);}
      rm.forEach(k=>localStorage.removeItem(k));
      Object.keys(b.store).filter(k=>BK_KEYS.test(k)).forEach(k=>localStorage.setItem(k,b.store[k]));
      try{const lg=JSON.parse(localStorage.getItem('mets_log')||'[]');lg.unshift({msg:'Data restored from backup '+f.name+' ('+(b.timestamp||'')+')',time:new Date().toLocaleString('en-PH'),user:(curRole()||{}).name||'GSO Admin',geo:null});localStorage.setItem('mets_log',JSON.stringify(lg));}catch(e){}
      try{window.removeEventListener('beforeunload',persistAssets);}catch(e){}
      showSyncToast('✅ Backup restored. Reloading…');setTimeout(()=>location.reload(),900);};
    rd.readAsText(f);};
  inp.click();}

(function(){
  const OV='mets_cred_overrides';
  function ovr(){try{return JSON.parse(localStorage.getItem(OV)||'{}');}catch(e){return{};}}
  function setErr(m){const e=document.getElementById('loginError');if(e)e.textContent=m;}
  window.checkPassword=function(){
    const un=(document.getElementById('login-pw-username').value||'').trim();
    const pw=document.getElementById('login-pw-password').value||'';
    const acc=GSO_CREDS.find(c=>c.un===un);
    const real=acc?(ovr()[un]||acc.pw):null;
    if(!acc||pw!==real){setErr('Incorrect username or password.');logAction('Failed login attempt: '+(un||'(blank)'));
      const f=document.getElementById('login-pw-password');f.value='';f.focus();return;}
    setErr('');isGSOLoggedIn=true;currentGSOUser=acc;
    try{localStorage.setItem('mets_admin_name',acc.name);}catch(e){}
    _doPostLogin(acc.name);
    const ad=document.getElementById('adminDeptDisplay');if(ad)ad.textContent=acc.role;
    const lu=document.getElementById('loggedInUser');if(lu)lu.textContent=acc.name;
    if(typeof updateDDLoginState==='function')updateDDLoginState();
    logAction('Logged in: '+acc.name+' ('+acc.role+')');
  };
  window.changePassword=function(){
    const msg=document.getElementById('pw-change-msg');
    const say=(t,ok)=>{if(msg){msg.textContent=t;msg.style.color=ok?'#2d7d46':'var(--red)';}};
    const u=curRole();
    if(!u||!u.un){say('Log in first.');return;}
    const np=(document.getElementById('newPassword')||{}).value||'',cp=(document.getElementById('confirmPassword')||{}).value||'';
    if(np.length<8){say('Password must be at least 8 characters.');return;}
    if(np!==cp){say('Passwords do not match.');return;}
    const o=ovr();o[u.un]=np;localStorage.setItem(OV,JSON.stringify(o));
    ['newPassword','confirmPassword'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
    say('Password updated for '+u.un+'.',true);logAction('Password changed for '+u.un);
  };
  const ls=window.lockSystem;
  window.lockSystem=function(){
    try{ls.apply(this,arguments);}catch(e){}
    isGSOLoggedIn=false;currentGSOUser=null;
    ['login-pw-username','login-pw-password'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
    const cu=document.getElementById('changeUsername');if(cu)cu.value='';
  };
  const ap=window.applyLockTypeUI;
  window.applyLockTypeUI=function(){try{ap&&ap('password');}catch(e){}const cu=document.getElementById('changeUsername');if(cu){cu.readOnly=true;cu.value=(curRole()||{}).un||'';}};
  const rs=window.showView;
  window.showView=function(id){const r=rs.apply(this,arguments);if(id==='settings')window.applyLockTypeUI();return r;};
})();

window.resetPasswordCredentials=function(){
  if(!confirm('Saved password changes will be cleared and the default accounts restored.\n\nContinue?'))return;
  ['mets_pin','mets_password','mets_username','mets_lock_type','mets_cred_overrides'].forEach(k=>localStorage.removeItem(k));
  logAction('Saved passwords reset to default accounts');
  lockSystem();showLoginScreen();
};

(function(){
  const ROLES={oic:'GSO-OIC',inspector:'Inspectorate Personnel',gsostaff:'GSO Office Personnel',officehead:'Municipal Office Head'};
  const OV='mets_cred_overrides', MAXA=3;
  let attempts=0; window._pendingRole=null;
  const ovr=()=>{try{return JSON.parse(localStorage.getItem(OV)||'{}');}catch(e){return{};}};
  const $=id=>document.getElementById(id);
  const err=m=>{const e=$('loginError');if(e)e.textContent=m;};
  window.showRoleSelect=function(){
    window._pendingRole=null;attempts=0;err('');
    const fl=$('forgotPasswordLink');if(fl)fl.style.display='none';
    $('loginScreen').classList.add('hidden');
    $('roleSelectScreen').style.display='flex';
  };
  window.selectRole=function(perm){
    window._pendingRole=perm;attempts=0;err('');
    $('roleSelectScreen').style.display='none';
    const fl=$('forgotPasswordLink');if(fl)fl.style.display='none';
    $('loginRoleName').textContent=ROLES[perm];
    ['login-pw-username','login-pw-password'].forEach(id=>{const e=$(id);if(e)e.value='';});
    const pm=$('login-pin-mode'),wm=$('login-pw-mode');if(pm)pm.style.display='none';if(wm)wm.style.display='';
    $('loginScreen').classList.remove('hidden');
    setTimeout(()=>$('login-pw-username').focus(),50);
  };
  window.initPostLanding=function(){showRoleSelect();};
  window.checkPassword=function(){
    const un=($('login-pw-username').value||'').trim(),pw=$('login-pw-password').value||'';
    const role=window._pendingRole;if(!role){showRoleSelect();return;}
    const acc=GSO_CREDS.find(c=>c.un===un&&c.perm===role);
    if(!acc||pw!==(ovr()[un]||acc.pw)){
      attempts++;
      if(attempts>=MAXA){err('Incorrect password ('+attempts+' failed attempts).');$('forgotPasswordLink').style.display='block';}
      else err('Incorrect username or password. Attempt '+attempts+'/'+MAXA+'.');
      logAction('Failed login attempt ('+attempts+'): '+(un||'(blank)')+' as '+ROLES[role]);
      const f=$('login-pw-password');f.value='';f.focus();return;
    }
    attempts=0;err('');isGSOLoggedIn=true;currentGSOUser=acc;
    try{localStorage.setItem('mets_admin_name',acc.name);}catch(e){}
    _doPostLogin(acc.name);
    const ad=$('adminDeptDisplay');if(ad)ad.textContent=acc.role;
    const lu=$('loggedInUser');if(lu)lu.textContent=acc.name;
    if(typeof updateDDLoginState==='function')updateDDLoginState();
    logAction('Logged in: '+acc.name+' ('+acc.role+')');
  };
  window.resetPinOption=function(){
    $('recoveryOptions').style.display='none';$('newPinSetArea').style.display='block';
    $('rpUsername').value=($('login-pw-username').value||'').trim();
    $('rpNewPw').value='';$('rpConfirmPw').value='';$('rpError').textContent='';
  };
  window.saveResetPassword=function(){
    const e=$('rpError'),un=$('rpUsername').value.trim(),np=$('rpNewPw').value,cp=$('rpConfirmPw').value;
    const acc=GSO_CREDS.find(c=>c.un===un&&c.perm===window._pendingRole);
    if(!acc){e.textContent='Username not found for '+ROLES[window._pendingRole]+'.';return;}
    if(np.length<8){e.textContent='Password must be at least 8 characters.';return;}
    if(np!==cp){e.textContent='Passwords do not match.';return;}
    const o=ovr();o[un]=np;localStorage.setItem(OV,JSON.stringify(o));
    attempts=0;$('forgotPasswordLink').style.display='none';closeForgotPassword();
    logAction('Password reset via recovery for '+un);
    err('Password reset! Please log in with your new password.');
    setTimeout(()=>err(''),4000);
  };
  const ls=window.lockSystem;
  window.lockSystem=function(){try{ls.apply(this,arguments);}catch(e){}showRoleSelect();};
})();

/* ── Account creation (non-OIC roles), approval, role-based sidebar ── */
(function(){
  const AK='mets_accounts', $=id=>document.getElementById(id);
  const RN={inspector:'Inspectorate Personnel',gsostaff:'GSO Office Personnel',officehead:'Municipal Office Head'};
  const load=()=>{try{return JSON.parse(localStorage.getItem(AK)||'[]');}catch(e){return[];}};
  const save=a=>{try{localStorage.setItem(AK,JSON.stringify(a));}catch(e){}};
  load().filter(a=>a.status==='approved'&&!GSO_CREDS.some(c=>c.un===a.un)).forEach(a=>GSO_CREDS.push({un:a.un,pw:a.pw,name:a.name,role:a.role,perm:a.perm,office:a.office}));

  function closeSU(){const m=$('signupModal');if(m)m.remove();}
  const officeOpts=()=>Object.entries(officeData).map(([k,o])=>'<option value="'+k+'">'+o.name+'</option>').join('')+'<option value="municipal">Admin Office</option>';
  const officeName=k=>k==='municipal'?'Admin Office':(officeData[k]||{}).name||k;
  window.openSignup=function(){
    const perm=window._pendingRole;if(!RN[perm])return;closeSU();
    const st='width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:9px;background:var(--bg-dark,#0d1420);color:var(--text-dark);font-size:0.85rem;font-family:inherit;box-sizing:border-box;margin-bottom:9px;';
    const d=document.createElement('div');d.id='signupModal';
    d.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(5,10,25,0.96);display:flex;align-items:center;justify-content:center;padding:16px;';
    d.innerHTML='<div style="width:100%;max-width:340px;background:var(--bg-card,#111a2e);border:1px solid var(--border);border-radius:14px;padding:22px;text-align:left;">'
      +'<div style="font-size:1rem;font-weight:700;color:var(--gold);margin-bottom:4px">Create Account</div>'
      +'<div style="font-size:0.74rem;color:#8899bb;margin-bottom:14px">'+RN[perm]+'</div>'
      +(perm==='officehead'?'<select id="suOffice" style="'+st+'">'+officeOpts()+'</select>':'')+'<input id="suName" placeholder="Full name" style="'+st+'"><input id="suUser" placeholder="Username" autocomplete="off" style="'+st+'">'
      +'<input id="suPw" type="password" placeholder="Password (min. 8 characters)" style="'+st+'"><input id="suPw2" type="password" placeholder="Confirm password" style="'+st+'">'
      +'<div id="suErr" style="color:var(--red);font-size:0.74rem;min-height:16px;margin-bottom:8px"></div>'
      +'<div style="display:flex;gap:8px"><button onclick="closeSignup()" style="flex:1;padding:10px;border-radius:9px;border:1px solid var(--border);background:transparent;color:#8899bb;cursor:pointer;font-family:inherit">Cancel</button>'
      +'<button onclick="submitSignup()" style="flex:1;padding:10px;border-radius:9px;border:none;background:var(--gold);color:#0d1420;font-weight:700;cursor:pointer;font-family:inherit">Submit</button></div></div>';
    document.body.appendChild(d);setTimeout(()=>$('suName').focus(),50);
  };
  window.closeSignup=closeSU;
  window.submitSignup=function(){
    const perm=window._pendingRole,e=$('suErr'),name=$('suName').value.trim(),un=$('suUser').value.trim(),pw=$('suPw').value,pw2=$('suPw2').value;
    if(!RN[perm]){return;}
    if(!name||!un){e.textContent='Please enter your name and a username.';return;}
    if(!/^[A-Za-z0-9._-]{3,}$/.test(un)){e.textContent='Username: at least 3 letters, numbers, . _ or -';return;}
    if(pw.length<8){e.textContent='Password must be at least 8 characters.';return;}
    if(pw!==pw2){e.textContent='Passwords do not match.';return;}
    const all=load();
    if(GSO_CREDS.some(c=>c.un===un)||all.some(a=>a.un===un)){e.textContent='That username is already taken.';return;}
    const office=perm==='officehead'?($('suOffice')||{}).value:undefined;
    all.push({un,pw,name,role:RN[perm],perm,office,status:'pending',date:new Date().toISOString()});save(all);
    logAction('Account requested: '+un+' ('+RN[perm]+')');closeSU();
    const le=$('loginError');if(le){le.textContent='Account submitted. You can log in once the GSO-OIC approves it.';}
  };

  // OIC reviews pending requests after login
  function reviewPending(){
    const u=curRole();if(!u||u.perm!=='oic')return;
    const all=load();let changed=false;
    all.filter(a=>a.status==='pending').forEach(a=>{
      if(confirm('Account request\n\nName: '+a.name+'\nUsername: '+a.un+'\nRole: '+a.role+(a.office?'\nOffice: '+officeName(a.office):'')+'\n\nOK = Approve    Cancel = more options')){
        a.status='approved';GSO_CREDS.push({un:a.un,pw:a.pw,name:a.name,role:a.role,perm:a.perm,office:a.office});logAction('Account approved: '+a.un+' ('+a.role+')');changed=true;
      }else if(confirm('Reject the request from '+a.name+'?\n\nOK = Reject    Cancel = keep pending')){
        a.status='rejected';logAction('Account rejected: '+a.un);changed=true;
      }
    });
    if(changed)save(all);
  }

  // Hide sidebar items the signed-in role cannot open
  function roleNav(){
    const map={"showView('reports')":'view:reports',"showSettings()":'view:settings',"showGSORecords()":'view:gsorecords',"showProcurementForecast()":'view:forecast'};
    document.querySelectorAll('.nav-item[onclick]').forEach(n=>{
      const k=Object.keys(map).find(x=>(n.getAttribute('onclick')||'').indexOf(x)>-1);
      if(k)n.style.display=can(map[k])?'':'none';
    });
  }
  const pl=window._doPostLogin;
  window._doPostLogin=function(){const r=pl.apply(this,arguments);roleNav();setTimeout(reviewPending,700);return r;};

  // "Create account" link: shown on the login screen for every role except GSO-OIC
  const sr=window.selectRole;
  window.selectRole=function(perm){
    const r=sr.apply(this,arguments);
    const b=$('loginRoleBanner');
    if(b){let l=$('signupLink');
      if(!l){l=document.createElement('span');l.id='signupLink';l.className='forgot-link';l.textContent='Sign up';l.onclick=openSignup;}
      b.querySelectorAll('.su-sep').forEach(x=>x.remove());
      if(RN[perm]){const sep=document.createElement('span');sep.className='su-sep';sep.innerHTML='&nbsp;·&nbsp;';b.appendChild(sep);b.appendChild(l);}
      else if(l.parentNode)l.remove();}
    return r;
  };
})();

/* ── v66: final role rules ── */
(function(){
  const $=id=>document.getElementById(id);
  const me=()=>curRole();
  const myOffice=()=>{const u=me();return u&&u.perm==='officehead'?(u.office||'__none__'):null;};
  const myDepts=()=>{const o=myOffice();if(!o)return null;
    const l=o==='municipal'?(window.adminOfficeDepts||[]):((officeData[o]||{}).depts||[]);return new Set(l.map(d=>d.id));};

  // Office Head sees only their own office's assets (dashboard, reports, search, lifecycle all use this)
  const gae=window.getAllEquipment;
  window.getAllEquipment=function(){const l=gae.apply(this,arguments),d=myDepts();return d?l.filter(e=>d.has(e.dept)):l;};
  const ss=window.showStaff;
  window.showStaff=function(id){const d=myDepts();if(d&&!d.has(id)){denyMsg('open other offices');return;}return ss.apply(this,arguments);};
  const sod=window.showOfficeDept;
  window.showOfficeDept=function(id){const o=myOffice();if(o&&o!==id){denyMsg('open other offices');return;}return sod.apply(this,arguments);};
  const so=window.showOffices;
  window.showOffices=function(t){const o=myOffice();if(o&&o!=='municipal'){denyMsg('open other offices');return;}return so.apply(this,arguments);};
  const rbo=window.openReportByOfficeModal;
  window.openReportByOfficeModal=function(){const r=rbo.apply(this,arguments),o=myOffice();
    if(o)document.querySelectorAll('#rboOfficeList label').forEach(l=>{const c=l.querySelector('input');if(c&&c.value!==o)l.remove();});return r;};
  // Office Head activity log: own actions only
  const sal=window.showActivityLog;
  window.showActivityLog=function(){const u=me();if(u&&u.perm==='officehead'){const full=activityLog;activityLog=full.filter(e=>e.user===u.name);try{return sal.apply(this,arguments);}finally{activityLog=full;}}return sal.apply(this,arguments);};

  // Transfer / repair: everyone with access can view history; only permitted roles see the entry form
  function hideForm(txt,act){if(can(act))return;
    setTimeout(()=>document.querySelectorAll('.modal-overlay.open div,.modal div').forEach(d=>{
      const t=(d.firstElementChild&&d.firstElementChild.textContent||'').trim();
      if(t.indexOf(txt)===0&&d.children.length>1&&d.querySelector('input,select'))d.style.display='none';}),0);}
  const oc=window.openChainModal;window.openChainModal=function(){const r=oc.apply(this,arguments);hideForm('📝 Add Transfer Record','transfer');return r;};
  const orp=window.openRepairModal;window.openRepairModal=function(){const r=orp.apply(this,arguments);hideForm('➕ Log Repair','repair');return r;};

  // Sidebar, report cards, scan screen
  function roleUI(){
    const u=me();if(!u)return;
    document.body.className=document.body.className.replace(/\brole-\w+/g,'').trim()+' role-'+u.perm;
    const o=myOffice();
    document.querySelectorAll('.nav-item[onclick]').forEach(n=>{
      const c=n.getAttribute('onclick')||'',m=c.match(/showOfficeDept\('(\w+)'\)/);let hide=null;
      if(c.indexOf("showView('reports')")>-1)hide=!can('view:reports');
      else if(c.indexOf('showSettings()')>-1)hide=!can('view:settings');
      else if(c.indexOf('showGSORecords()')>-1)hide=!can('view:gsorecords');
      else if(c.indexOf('showProcurementForecast()')>-1)hide=!can('view:forecast');
      else if(o&&m)hide=m[1]!==o;
      else if(o&&c.indexOf("showOffices('municipal')")>-1)hide=o!=='municipal';
      if(hide!==null)n.style.display=hide?'none':'';
    });
    document.querySelectorAll('#view-reports .report-card').forEach(c=>{const k=c.getAttribute('onclick')||'';
      if(k.indexOf('exportMasterCSV')>-1)c.style.display=can('export')?'':'none';
      if(k.indexOf('showProcurementForecast')>-1)c.style.display=can('view:forecast')?'':'none';});
    const pf=$('pfDashCard');if(pf)pf.style.display=can('view:forecast')?'':'none';
    document.querySelectorAll('#quickUpdateBtn,#quickStatusRow,.sc-footer .scan-btn').forEach(e=>{if(!can('updatestatus'))e.style.display='none';else e.style.display='';});
    const al=document.querySelector('#view-activitylog button[onclick*="exportActivityLogCSV"]');if(al)al.style.display=can('export')?'':'none';
  }
  const pl=window._doPostLogin;
  window._doPostLogin=function(){let r;try{r=pl.apply(this,arguments);}catch(e){console.warn('Post-login step failed:',e);}try{roleUI();}catch(e){}return r;};
  const sb=document.querySelector('.sidebar');
  if(sb&&window.MutationObserver)new MutationObserver(()=>{try{roleUI();}catch(e){}}).observe(sb,{childList:true,subtree:true});
  const lk=window.lockSystem;
  window.lockSystem=function(){document.body.className=document.body.className.replace(/\brole-\w+/g,'').trim();return lk.apply(this,arguments);};
  ['openScanner','openQRScanner','onQRScanSuccess','onQRDecoded'].forEach(n=>{const f=window[n];if(typeof f!=='function')return;
    window[n]=function(){const r=f.apply(this,arguments);try{roleUI();}catch(e){}return r;};});
})();

/* ── v69: clearer login / recovery ── */
(function(){
  const $=id=>document.getElementById(id);
  const RL={oic:'GSO-OIC',inspector:'Inspectorate Personnel',gsostaff:'GSO Office Personnel',officehead:'Municipal Office Head'};
  // keep the dashboard usable if the charting library could not be downloaded (offline)
  if(typeof Chart==='undefined'){window.Chart=function(){this.destroy=function(){};this.update=function(){};};window.Chart.register=function(){};}
  // explain WHY a login fails
  const cp=window.checkPassword;
  window.checkPassword=function(){
    const un=(($('login-pw-username')||{}).value||'').trim(),role=window._pendingRole,e=$('loginError');
    if(!un){if(e)e.textContent='Please enter your username.';return;}
    const other=GSO_CREDS.find(c=>c.un===un&&c.perm!==role);
    if(other&&!GSO_CREDS.some(c=>c.un===un&&c.perm===role)){if(e)e.textContent='That username belongs to '+RL[other.perm]+'. Tap "Change role" and choose that role.';return;}
    try{const pend=JSON.parse(localStorage.getItem('mets_accounts')||'[]').find(a=>a.un===un&&a.status==='pending');
      if(pend){if(e)e.textContent='Your account is still waiting for GSO-OIC approval.';return;}}catch(x){}
    return cp.apply(this,arguments);
  };
  // explain WHY a password reset fails
  const rp=window.saveResetPassword;
  window.saveResetPassword=function(){
    const e=$('rpError'),un=(($('rpUsername')||{}).value||'').trim(),role=window._pendingRole;
    if(!un){e.textContent='Enter your username.';return;}
    const other=GSO_CREDS.find(c=>c.un===un&&c.perm!==role);
    if(other&&!GSO_CREDS.some(c=>c.un===un&&c.perm===role)){e.textContent='That username belongs to '+RL[other.perm]+'. Close this window, tap "Change role" and choose that role.';return;}
    e.textContent='';
    return rp.apply(this,arguments);
  };
})();

/* ── Cross-user refresh (in place, no page reload) ───────────────────────
   Every signed-in browser asks for a tiny content-hash version. When another
   user adds or updates equipment, the latest shared state is hydrated into
   memory/localStorage and the current screen is re-rendered. The page is
   never reloaded, so open filters, scroll position, and navigation survive. */
(function(){
  'use strict';
  const TOKEN_KEY='kat_token';
  const SENSITIVE={
    mets_pin:1,mets_password:1,mets_username:1,mets_lock_type:1,
    mets_pending_sync:1,mets_device_id:1,mets_cred_overrides:1,mets_accounts:1,
    mets_admin_name:1,mets_admin_user:1,mets_admin_dept:1,
    mets_theme:1,mets_camera_id:1,mets_sidebar_collapsed:1,
    mets_last_backup_drive:1,mets_sync_history:1
  };
  const POLL_MS=5000;
  let lastVersion=window.__KAT_STATE_VERSION__||'';
  let timer=null,checking=false,deferred=false,deferredNotified=false;

  function token(){
    try{return localStorage.getItem(TOKEN_KEY)||'';}catch(e){return '';}
  }
  function sharedKey(key){
    return typeof key==='string'&&key.indexOf('mets_')===0&&!SENSITIVE[key];
  }
  function parse(raw,fallback){
    try{return JSON.parse(raw);}catch(e){return fallback;}
  }
  function busy(){
    if(document.querySelector('.modal-overlay.open'))return true;
    const ae=document.activeElement;
    if(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)&&ae.id!=='searchInput'&&!ae.readOnly&&!ae.disabled)return true;
    return false;
  }
  function notifyDeferred(){
    if(deferredNotified)return;
    deferredNotified=true;
    if(typeof window.showSyncToast==='function'){
      window.showSyncToast('🔄 New updates are ready — they will appear when you finish this entry');
    }
  }

  function applyState(state){
    let changed=false,staffChanged=false;
    const beforeStaff=JSON.stringify(staffData);
    window.__KAT_REMOTE_HYDRATE__=true;
    try{
      Object.keys(state||{}).forEach(function(key){
        if(!sharedKey(key)||typeof state[key]!=='string')return;
        const value=state[key];
        if(key==='mets_staffdata'){
          if(value===beforeStaff)return;
          const parsed=parse(value,null);
          if(!parsed||typeof parsed!=='object')return;
          Object.keys(staffData).forEach(function(k){delete staffData[k];});
          Object.keys(parsed).forEach(function(k){
            if(Array.isArray(parsed[k]))staffData[k]=parsed[k];
          });
          _lastSnap=JSON.stringify(staffData);
          staffChanged=true;changed=true;
        }else{
          let previous=null;
          try{previous=localStorage.getItem(key);}catch(e){}
          if(previous===value)return;
          if(key==='mets_log'){
            const arr=parse(value,[]);
            if(!Array.isArray(arr))return;
            activityLog.length=0;
            arr.forEach(function(entry){activityLog.push(entry);});
          }else if(key==='mets_photos'){
            const obj=parse(value,{});
            if(!obj||typeof obj!=='object')return;
            Object.keys(photoStore).forEach(function(k){delete photoStore[k];});
            Object.assign(photoStore,obj);
          }else if(key==='mets_recycle'){
            const arr=parse(value,[]);
            if(!Array.isArray(arr))return;
            recycleBin.length=0;
            arr.forEach(function(item){recycleBin.push(item);});
          }
          changed=true;
        }
        try{localStorage.setItem(key,value);}catch(e){}
      });
    }finally{
      window.__KAT_REMOTE_HYDRATE__=false;
    }

    if(staffChanged){
      try{
        if(typeof currentDeptId!=='undefined'&&currentDeptId){
          currentDeptStaff=staffData[currentDeptId]||[];
        }
        if(typeof currentStaff!=='undefined'&&currentStaff){
          const dept=currentDeptId||Object.keys(staffData).find(function(k){
            return Array.isArray(staffData[k])&&staffData[k].some(function(s){return s.id===currentStaff.id;});
          });
          const fresh=dept?((staffData[dept]||[]).find(function(s){return s.id===currentStaff.id;})):null;
          if(fresh)currentStaff=fresh;
        }
      }catch(e){}
    }
    return {changed:changed,staffChanged:staffChanged};
  }

  function refreshView(result){
    const active=document.querySelector('.view.active');
    const id=active&&active.id?active.id.replace(/^view-/,''):'';
    const scrollY=window.scrollY||window.pageYOffset||0;
    const previousSilent=window.__KAT_SILENT_REFRESH__;
    window.__KAT_SILENT_REFRESH__=true;
    try{
      if(id==='dashboard'){
        if(typeof window.updateDashStats==='function')window.updateDashStats();
        if(typeof window.buildAlertsPanel==='function')window.buildAlertsPanel();
        if(typeof window.buildStatusChart==='function')window.buildStatusChart();
      }else if(id==='equipment'){
        if(typeof window.renderEquipmentMaster==='function')window.renderEquipmentMaster();
      }else if(id==='search'){
        const q=((document.getElementById('searchInput')||{}).value||'').trim();
        if(q&&typeof window.performSearch==='function')window.performSearch(q);
      }else if(id==='staff'){
        if(typeof currentDeptId!=='undefined'&&currentDeptId&&typeof window.showStaff==='function'){
          window.showStaff(currentDeptId);
        }
      }else if(id==='profile'){
        if(typeof currentStaff!=='undefined'&&currentStaff&&typeof window.showProfile==='function'){
          const stack=navStack.slice();
          window.showProfile(currentStaff);
          navStack=stack;
          if(navStack.length){
            navStack[navStack.length-1]={label:currentStaff.name,fn:function(){window.showProfile(currentStaff);}};
          }
        }
      }else if(id==='municipal'){
        if(typeof window.renderMunicipalView==='function')window.renderMunicipalView();
      }else if(id==='dept'){
        if(typeof currentOfficeId!=='undefined'&&currentOfficeId&&typeof window.showOfficeDept==='function'){
          window.showOfficeDept(currentOfficeId);
        }
      }else if(id==='gsorecords'){
        if(typeof window.updateGSORecordsBadge==='function')window.updateGSORecordsBadge();
        if(typeof currentGSOTab!=='undefined'&&typeof window.renderGSOTab==='function'){
          window.renderGSOTab(currentGSOTab);
        }
      }else if(id==='recyclebin'){
        if(typeof window.renderRecycleBin==='function')window.renderRecycleBin();
      }else if(id==='activitylog'){
        if(typeof window.showActivityLog==='function')window.showActivityLog();
      }else if(id==='lifecycle'){
        if(typeof window.lcRender==='function')window.lcRender();
      }else if(id==='synccenter'){
        if(typeof window.syncRender==='function')window.syncRender();
      }
    }catch(e){
      console.warn('In-place refresh failed',e);
    }finally{
      window.__KAT_SILENT_REFRESH__=previousSilent;
    }
    try{window.scrollTo(0,scrollY);}catch(e){}
    if(result&&result.staffChanged&&typeof window.showSyncToast==='function'){
      window.showSyncToast('🔄 Equipment list updated');
    }
  }

  async function hydrate(version){
    const res=await fetch('/api/state',{
      headers:{Authorization:'Bearer '+token()},
      cache:'no-store'
    });
    if(res.status===401||res.status===403)return;
    if(!res.ok)return;
    const data=await res.json().catch(function(){return {};});
    const result=applyState((data&&data.state)||{});
    lastVersion=(data&&(data.version||data.updated_at))||version;
    window.__KAT_STATE_VERSION__=lastVersion;
    deferred=false;deferredNotified=false;
    if(result.changed)refreshView(result);
  }

  async function check(force){
    if(checking||!token()||!navigator.onLine)return;
    if(document.hidden&&!force)return;
    checking=true;
    try{
      const res=await fetch('/api/state/version',{
        headers:{Authorization:'Bearer '+token()},
        cache:'no-store'
      });
      if(res.status===401||res.status===403)return;
      if(!res.ok)return;
      const data=await res.json().catch(function(){return {};});
      const version=(data&&(data.version||data.updated_at))||'';
      if(!version)return;
      if(!lastVersion){
        lastVersion=version;
        window.__KAT_STATE_VERSION__=version;
        return;
      }
      if(version===lastVersion)return;
      if(busy()){
        deferred=true;
        notifyDeferred();
        return;
      }
      await hydrate(version);
    }catch(e){
      /* Offline or a temporary server error: try again on the next poll. */
    }finally{
      checking=false;
    }
  }

  function start(){
    if(timer)clearInterval(timer);
    timer=setInterval(function(){check(false);},POLL_MS);
    setTimeout(function(){check(false);},1200);
  }

  const sv=window.showView;
  if(typeof sv==='function'){
    window.showView=function(id){
      const result=sv.apply(this,arguments);
      if(!window.__KAT_SILENT_REFRESH__&&/^(dashboard|equipment|staff|profile|search|municipal|dept|gsorecords|recyclebin|activitylog|lifecycle|synccenter)$/.test(String(id))){
        setTimeout(function(){check(false);},150);
      }
      return result;
    };
  }

  document.addEventListener('visibilitychange',function(){
    if(!document.hidden)check(true);
  });
  window.addEventListener('online',function(){setTimeout(function(){check(true);},400);});
  document.addEventListener('click',function(){
    if(deferred)setTimeout(function(){check(false);},250);
  },true);
  document.addEventListener('focusout',function(){
    if(deferred)setTimeout(function(){check(false);},250);
  },true);

  window.KatLiveRefresh={check:check,hydrate:hydrate,applyState:applyState,refreshView:refreshView};
  start();
})();
