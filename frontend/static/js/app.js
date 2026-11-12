/* Katipunan AMS - v71 application core (data, UI, assets, dashboard)
   Extracted from frontend/templates/index.html. */

// ══════════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════════
const avatarColors=['#2c5282','#2d7d46','#7b341e','#553c9a','#2b6cb0','#744210','#c05621','#276749','#1a365d','#702459'];

const officeData = {
  mayors:{name:"Mayor's Office",icon:'👨‍💼',depts:[{id:'exec_asst',name:'Executive Assistant',icon:'📋',desc:'Scheduling & correspondence',count:2},{id:'public_rel',name:'Public Relations',icon:'📢',desc:'Media & communications',count:2},{id:'protocol',name:'Protocol Section',icon:'🎖️',desc:'Official functions & ceremonies',count:2}]},
  budget:{name:'Budget Office',icon:'💰',depts:[{id:'budget_prep',name:'Budget Preparation',icon:'📊',desc:'Annual budget planning',count:2},{id:'budget_ctrl',name:'Budget Control',icon:'🔐',desc:'Expenditure monitoring',count:2},{id:'budget_rpt',name:'Reporting Section',icon:'📈',desc:'Financial reporting',count:2}]},
  mpc:{name:'Municipal Planning & Development Office',icon:'📊',depts:[{id:'mpc_plans',name:'Plans & Programs',icon:'🗺️',desc:'Development plans & programs',count:3},{id:'mpc_stats',name:'Statistics & Data',icon:'📉',desc:'Data collection & analysis',count:2},{id:'pdo_local',name:'Local Development',icon:'🏘️',desc:'Community development projects',count:3},{id:'pdo_invest',name:'Investment Promotion',icon:'💼',desc:'Business & investment',count:2}]},
  accounting:{name:'Accounting Office',icon:'🧾',depts:[{id:'acct_gen',name:'General Accounting',icon:'📒',desc:'General ledger & journal',count:3},{id:'acct_audit',name:'Pre-Audit Section',icon:'🔍',desc:'Voucher review & audit',count:2},{id:'acct_payroll',name:'Payroll Section',icon:'💵',desc:'Salary processing',count:2},{id:'acct_prop',name:'Property Account',icon:'🏠',desc:'Asset accounting',count:2}]},
  treasury:{name:"Treasurer's Office",icon:'🏦',depts:[{id:'treas_col',name:'Collection Section',icon:'💳',desc:'Tax & fee collection',count:3},{id:'treas_cash',name:'Cashiering',icon:'💰',desc:'Cash management',count:2},{id:'treas_real',name:'Real Property Tax',icon:'🏡',desc:'RPT management',count:2},{id:'treas_bus',name:'Business Tax',icon:'🏪',desc:'Business permit & tax',count:2}]},
  engineering:{name:'Engineering Office',icon:'🚧',depts:[{id:'eng_infra',name:'Infrastructure',icon:'🏗️',desc:'Roads, bridges & buildings',count:3},{id:'eng_maint',name:'Maintenance',icon:'🔧',desc:'Facility upkeep',count:3},{id:'eng_design',name:'Designs & Plans',icon:'📐',desc:'Engineering drawings',count:2},{id:'eng_inspect',name:'Inspection',icon:'🔎',desc:'Project inspection',count:2}]},
  assessor:{name:"Assessor's Office",icon:'📋',depts:[{id:'assess_map',name:'Mapping Section',icon:'🗺️',desc:'Cadastral maps & surveys',count:2},{id:'assess_val',name:'Valuation Section',icon:'💲',desc:'Property appraisal',count:2},{id:'assess_rec',name:'Records Section',icon:'📁',desc:'Property records',count:2}]},
  civilreg:{name:'Civil Registrar',icon:'📝',depts:[{id:'creg_birth',name:'Birth Registration',icon:'👶',desc:'Birth certificates',count:2},{id:'creg_marr',name:'Marriage Registration',icon:'💍',desc:'Marriage certificates',count:2},{id:'creg_death',name:'Death Registration',icon:'📜',desc:'Death certificates',count:2}]},
  rhu:{name:'Rural Health Unit (RHU)',icon:'🏥',depts:[{id:'rhu_phys',name:'Medical Section',icon:'🩺',desc:'Physicians & consultations',count:2},{id:'rhu_nurse',name:'Nursing Section',icon:'💊',desc:'Nursing care & immunization',count:3},{id:'rhu_dent',name:'Dental Section',icon:'🦷',desc:'Dental health services',count:2},{id:'rhu_midwife',name:'Midwifery Section',icon:'🤱',desc:'Maternal & child health',count:3}]},
  bfp:{name:'Bureau of Fire Protection',icon:'🚒',depts:[{id:'bfp_ops',name:'Operations',icon:'🔥',desc:'Fire suppression & rescue',count:3},{id:'bfp_prev',name:'Fire Prevention',icon:'🛡️',desc:'Inspection & prevention',count:2},{id:'bfp_admin',name:'Administration',icon:'📋',desc:'Admin & logistics',count:2}]},
  pnp:{name:'PNP Office',icon:'👮',depts:[{id:'pnp_patrol',name:'Patrol Section',icon:'🚔',desc:'Community patrol & law enforcement',count:4},{id:'pnp_invest',name:'Investigation',icon:'🔍',desc:'Crime investigation',count:3},{id:'pnp_admin',name:'Admin Section',icon:'📋',desc:'Admin & records',count:2}]},
  motorpool:{name:'Motorpool',icon:'🚚',depts:[{id:'motor_maint',name:'Maintenance',icon:'🔧',desc:'Vehicle repair & maintenance',count:3},{id:'motor_ops',name:'Operations',icon:'🚗',desc:'Fleet operations & dispatch',count:4},{id:'motor_rec',name:'Records',icon:'📁',desc:'Vehicle records & licensing',count:2}]},
  ldrrmo:{name:'LDRRMO',icon:'🌀',depts:[{id:'ldrrmo_prep',name:'Preparedness',icon:'📦',desc:'Disaster preparedness & training',count:2},{id:'ldrrmo_resp',name:'Response',icon:'🚨',desc:'Emergency response',count:3},{id:'ldrrmo_mit',name:'Mitigation',icon:'🗺️',desc:'Risk reduction & mapping',count:2}]},
  dswd:{name:'DSWD',icon:'❤️',depts:[{id:'dswd_sw',name:'Social Welfare',icon:'🤲',desc:'Social welfare services',count:3},{id:'dswd_4ps',name:'4Ps Program',icon:'👨‍👩‍👧',desc:'Pantawid Pamilyang Pilipino Program',count:2},{id:'dswd_ewt',name:'Emergency Welfare',icon:'🆘',desc:'Emergency welfare assistance',count:2}]},
  mswd:{name:'MSWD',icon:'🤝',depts:[{id:'mswd_solo',name:'Solo Parents',icon:'👩‍👦',desc:'Solo parent welfare',count:2},{id:'mswd_pwd',name:'PWD Section',icon:'♿',desc:'Persons with disabilities',count:2},{id:'mswd_child',name:'Child Protection',icon:'👶',desc:'Child welfare & protection',count:2}]},
  seniors:{name:'Senior Citizens Office',icon:'👴',depts:[{id:'sc_prog',name:'Programs Section',icon:'🎯',desc:'Senior citizen programs',count:3},{id:'sc_health',name:'Health Section',icon:'💊',desc:'Senior health services',count:2}]},
  owwa:{name:'OWWA',icon:'🌍',depts:[{id:'owwa_ofw',name:'OFW Services',icon:'✈️',desc:'OFW welfare & assistance',count:3},{id:'owwa_livelihood',name:'Livelihood',icon:'🌱',desc:'Livelihood programs',count:2}]},
  water:{name:'Water System',icon:'💧',depts:[{id:'water_ops',name:'Operations',icon:'⚙️',desc:'Water supply operations',count:3},{id:'water_maint',name:'Maintenance',icon:'🔧',desc:'Pipeline & facility maintenance',count:3},{id:'water_bill',name:'Billing',icon:'📄',desc:'Meter reading & billing',count:2}]},
  market:{name:'Market Office',icon:'🏪',depts:[{id:'mkt_ops',name:'Operations',icon:'🛒',desc:'Market operations & collections',count:3},{id:'mkt_san',name:'Sanitation',icon:'🧹',desc:'Market sanitation & health',count:2},{id:'mkt_sec',name:'Security',icon:'🔒',desc:'Market security',count:3}]},
  gso:{name:'GSO',icon:'📦',depts:[{id:'gso_main',name:'Property Custodianship',icon:'🗄️',desc:'Asset management & issuance',count:3},{id:'gso_supply',name:'Supply Section',icon:'📦',desc:'Supplies & stock management',count:2},{id:'gso_janitorial',name:'Janitorial Services',icon:'🧹',desc:'Custodial & janitorial',count:3}]}
};

const staffData = {};

// ══════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════
let navStack=[], currentOfficeId=null, currentDeptId=null, currentStaff=null;
let activityLog=JSON.parse(localStorage.getItem('mets_log')||'[]');
let photoStore=JSON.parse(localStorage.getItem('mets_photos')||'{}');
let currentLocation=null, currentQRData=null;
let lockTimer=null, lockMinutes=10;
let statusChartInstance=null;
let currentEqFilter='all';
let currentDeptStaff=[];

// ══════════════════════════════════════════════════════════
// FIRST-RUN / CREATE ACCOUNT
// ══════════════════════════════════════════════════════════
let caPin='', caPinConfirm='';
const PIN_LENGTH=6;   // minimum
const PIN_MAX=12;     // maximum

function renderCaPinDots(buf,dotId){
  const el=document.getElementById(dotId);if(!el)return;
  const visible=(dotId==='caPinDots'&&caPinVisible)||(dotId==='caPinConfirmDots'&&caPinConfirmVisible);
  el.textContent=visible?(buf||'')+'─'.repeat(Math.max(0,PIN_LENGTH-buf.length)):'●'.repeat(buf.length)+'─'.repeat(Math.max(0,PIN_LENGTH-buf.length));
}

// Eye-visibility state
let loginPinVisible=false, caPinVisible=false, caPinConfirmVisible=false, rpPinVisible=false;

const EYE_OPEN_SVG=`<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const EYE_CLOSED_SVG=`<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;

function toggleLoginPinVisibility(){
  loginPinVisible=!loginPinVisible;
  document.getElementById('loginEyeIcon').innerHTML=loginPinVisible?EYE_CLOSED_SVG:EYE_OPEN_SVG;
  updateLoginPinSpan();
}
function toggleCaPinVisibility(){
  caPinVisible=!caPinVisible;
  document.getElementById('caEyeIcon').innerHTML=caPinVisible?EYE_CLOSED_SVG:EYE_OPEN_SVG;
  renderCaPinDots(caPin,'caPinDots');
}
function toggleCaPinConfirmVisibility(){
  caPinConfirmVisible=!caPinConfirmVisible;
  document.getElementById('caConfirmEyeIcon').innerHTML=caPinConfirmVisible?EYE_CLOSED_SVG:EYE_OPEN_SVG;
  renderCaPinDots(caPinConfirm,'caPinConfirmDots');
}
function toggleRpPinVisibility(){
  rpPinVisible=!rpPinVisible;
  document.getElementById('rpEyeIcon').innerHTML=rpPinVisible?EYE_CLOSED_SVG:EYE_OPEN_SVG;
  const rd=document.getElementById('rpPinDots');if(!rd)return;
  rd.textContent=rpPinVisible?(rpPin||'')+'─'.repeat(Math.max(0,PIN_LENGTH-rpPin.length)):'●'.repeat(rpPin.length)+'─'.repeat(Math.max(0,PIN_LENGTH-rpPin.length));
}

function _renderRpPinDots(){
  const rd=document.getElementById('rpPinDots');if(!rd)return;
  rd.textContent=rpPinVisible?(rpPin||'')+'─'.repeat(Math.max(0,PIN_LENGTH-rpPin.length)):'●'.repeat(rpPin.length)+'─'.repeat(Math.max(0,PIN_LENGTH-rpPin.length));
}
function caPinPress(d){if(caPin.length>=PIN_MAX)return;caPin+=d;renderCaPinDots(caPin,'caPinDots');}
function caPinClear(){caPin=caPin.slice(0,-1);renderCaPinDots(caPin,'caPinDots');}
function caPinReset(){caPin='';renderCaPinDots(caPin,'caPinDots');}
function caPinConfirmPress(d){if(caPinConfirm.length>=PIN_MAX)return;caPinConfirm+=d;renderCaPinDots(caPinConfirm,'caPinConfirmDots');}
function caPinConfirmClear(){caPinConfirm=caPinConfirm.slice(0,-1);renderCaPinDots(caPinConfirm,'caPinConfirmDots');}
function caPinConfirmReset(){caPinConfirm='';renderCaPinDots(caPinConfirm,'caPinConfirmDots');}

function createAccount(){
  const err=document.getElementById('caError');
  if(caPin.length<PIN_LENGTH){err.textContent=`PIN must be at least ${PIN_LENGTH} digits.`;return;}
  if(caPin!==caPinConfirm){err.textContent='PINs do not match.';return;}
  localStorage.setItem('mets_pin',caPin);
  localStorage.setItem('mets_setup_done','1');
  document.getElementById('createAccountScreen').style.display='none';
  document.getElementById('loginScreen').classList.remove('hidden');
  updateLoginInfo();
  document.getElementById('loginError').textContent='PIN set! Please log in.';
  setTimeout(()=>{document.getElementById('loginError').textContent='';},3000);
}

function updateLoginInfo(){
  const sub=document.getElementById('loginSubtitle');
  if(sub)sub.textContent=`Welcome`;
  const badge=document.getElementById('adminNameDisplay');
  if(badge)badge.textContent='GSO - OIC';
  const roleEl=document.getElementById('adminDeptDisplay');
  if(roleEl)roleEl.textContent='General Services Office';
  const av=document.getElementById('adminAvatarInitials');
  if(av)av.textContent='GSO';
}

// ── ADMIN PROFILE EDIT ──
function openAdminProfileModal(){
  document.getElementById('modalAdminName').value=localStorage.getItem('mets_admin_name')||'';
  document.getElementById('modalAdminUsername').value=localStorage.getItem('mets_admin_user')||'';
  document.getElementById('modalAdminDept').value=localStorage.getItem('mets_admin_dept')||'';
  document.getElementById('adminProfileModal').classList.add('open');
}
function saveAdminProfileModal(){
  const name=document.getElementById('modalAdminName').value.trim();
  const user=document.getElementById('modalAdminUsername').value.trim();
  const dept=document.getElementById('modalAdminDept').value.trim();
  if(name)localStorage.setItem('mets_admin_name',name);
  if(user)localStorage.setItem('mets_admin_user',user);
  if(dept)localStorage.setItem('mets_admin_dept',dept);
  // Sync to settings card inputs
  const sn=document.getElementById('adminEditName');if(sn)sn.value=name||localStorage.getItem('mets_admin_name')||'';
  const su=document.getElementById('adminEditUsername');if(su)su.value=user||localStorage.getItem('mets_admin_user')||'';
  const sd=document.getElementById('adminEditDept');if(sd)sd.value=dept||localStorage.getItem('mets_admin_dept')||'';
  document.getElementById('adminProfileModal').classList.remove('open');
  logAction('Admin profile updated via modal');
  showSyncToast('✅ Profile updated');
}
function saveAdminProfile(){
  const name=document.getElementById('adminEditName').value.trim();
  const user=document.getElementById('adminEditUsername').value.trim();
  const dept=document.getElementById('adminEditDept').value.trim();
  if(name)localStorage.setItem('mets_admin_name',name);
  if(user)localStorage.setItem('mets_admin_user',user);
  if(dept)localStorage.setItem('mets_admin_dept',dept);
  logAction('Admin profile updated via Settings');
  showSyncToast('✅ Profile saved');
}
// ══════════════════════════════════════════════════════════
// OFFICE GROUPS MANAGEMENT (Settings)
// ══════════════════════════════════════════════════════════
const navGroupMap={
  municipal:{label:'Municipal Offices',icon:'🏢',officeIds:['mayors','budget','mpc','accounting','treasury','assessor','civilreg','rhu']},
  operations:{label:'Operational Offices',icon:'🚧',officeIds:['engineering','bfp','pnp','motorpool','ldrrmo']},
  social:{label:'Social Services Office',icon:'❤️',officeIds:['dswd','mswd','seniors','owwa']},
  utilities:{label:'Utility Offices',icon:'💡',officeIds:['water','market','gso']}
};
let currentOGTab='municipal';
function switchOGTab(tab,btn){
  currentOGTab=tab;
  document.querySelectorAll('.og-tab-btn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  renderOGList();
}
function renderOGList(){
  const group=navGroupMap[currentOGTab];
  if(!group){document.getElementById('og-list').innerHTML='';return;}
  const rows=group.officeIds.map(oid=>{
    const o=officeData[oid];if(!o)return'';
    const cnt=o.depts.length;
    return`<div class="setting-row">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:1.3rem;line-height:1">${o.icon}</span>
        <div>
          <div class="setting-label">${o.name}</div>
          <div class="setting-sub">${cnt} section${cnt!==1?'s':''}</div>
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button class="settings-btn" onclick="openEditNavOfficeModal('${oid}')">✏️ Edit</button>
        <button class="settings-btn danger" onclick="removeNavOffice('${oid}')">🗑 Remove</button>
      </div>
    </div>`;
  }).filter(Boolean).join('');
  document.getElementById('og-list').innerHTML=rows||
    '<div class="setting-row"><div class="setting-label" style="color:var(--text-light)">No offices in this group yet.</div></div>';
}

function openAddNavOfficeModal(){
  const id=prompt('Enter a unique office ID (e.g. "newoffice"):');
  if(!id||!id.trim())return;
  const cleanId=id.trim().toLowerCase().replace(/\s+/g,'_');
  if(officeData[cleanId]){alert('An office with that ID already exists.');return;}
  const name=prompt('Office name:');if(!name)return;
  const icon=prompt('Icon (emoji):','🏢')||'🏢';
  officeData[cleanId]={name,icon,depts:[]};
  navGroupMap[currentOGTab].officeIds.push(cleanId);
  renderOGList();
  rebuildNavSidebar();
  logAction(`Added office: ${name} to ${navGroupMap[currentOGTab].label}`);
  showSyncToast(`✅ ${name} added to sidebar`);
}
function openEditNavOfficeModal(oid){
  const o=officeData[oid];if(!o)return;
  const newName=prompt('Office name:',o.name);if(newName===null)return;
  const newIcon=prompt('Icon (emoji):',o.icon);if(newIcon===null)return;
  o.name=newName||o.name;
  o.icon=newIcon||o.icon;
  renderOGList();
  rebuildNavSidebar();
  logAction(`Edited office: ${o.name}`);
  showSyncToast(`✏️ ${o.name} updated`);
}
function removeNavOffice(oid){
  const o=officeData[oid];if(!o)return;
  if(!confirm(`Remove "${o.name}" from the sidebar group? The office data is kept but it won't appear in the sidebar.`))return;
  navGroupMap[currentOGTab].officeIds=navGroupMap[currentOGTab].officeIds.filter(id=>id!==oid);
  renderOGList();
  rebuildNavSidebar();
  logAction(`Removed office from sidebar: ${o.name}`);
  showSyncToast(`🗑 ${o.name} removed from sidebar`);
}
function rebuildNavSidebar(){
  // Rebuild the sidebar nav groups dynamically
  const groups=[
    {tab:'municipal',headerId:'navgrp-municipal',label:'🏢 Municipal Offices'},
    {tab:'operations',headerId:'navgrp-operations',label:'🚧 Operations'},
    {tab:'social',headerId:'navgrp-social',label:'❤️ Social Services'},
    {tab:'utilities',headerId:'navgrp-utilities',label:'💡 Utilities'}
  ];
  groups.forEach(({tab,headerId})=>{
    const childrenEl=document.getElementById('navchildren-'+tab);
    if(!childrenEl)return;
    const ids=navGroupMap[tab].officeIds;
    childrenEl.innerHTML=ids.map(oid=>{
      const o=officeData[oid];if(!o)return'';
      return`<div class="nav-item" onclick="showOfficeDept('${oid}')"><span class="icon">${o.icon}</span><span class="label">${o.name}</span><span class="count">${o.depts.length}</span></div>`;
    }).filter(Boolean).join('');
  });
}

// ── CATEGORY MANAGER ──────────────────────────────────────
function openCategoryManagerModal(){
  renderCatMgrList();
  document.getElementById('newCatLabel').value='';
  document.getElementById('newCatIcon').value='';
  document.getElementById('categoryManagerModal').style.display='flex';
}
function closeCategoryManagerModal(){
  document.getElementById('categoryManagerModal').style.display='none';
}
function renderCatMgrList(){
  const keys=Object.keys(navGroupMap);
  const el=document.getElementById('catMgrList');
  if(!keys.length){el.innerHTML='<div style="color:var(--text-light);font-size:0.8rem;">No categories yet.</div>';return;}
  el.innerHTML=keys.map(k=>{
    const g=navGroupMap[k];
    return`<div style="display:flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 10px;">
      <span style="font-size:1.2rem;">${g.icon||'🏢'}</span>
      <span style="flex:1;font-size:0.82rem;font-weight:600;color:var(--text);">${g.label}</span>
      <button class="settings-btn" onclick="renameCategoryPrompt('${k}')" style="padding:4px 8px;font-size:0.72rem;">✏️ Rename</button>
      <button class="settings-btn danger" onclick="deleteCategoryConfirm('${k}')" style="padding:4px 8px;font-size:0.72rem;">🗑 Delete</button>
    </div>`;
  }).join('');
}
function addNewCategory(){
  const label=(document.getElementById('newCatLabel').value||'').trim();
  if(!label){alert('Please enter a category name.');return;}
  const icon=(document.getElementById('newCatIcon').value||'').trim()||'🏢';
  // generate a key from the label
  const key=label.toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'');
  if(navGroupMap[key]){alert('A category with a similar name already exists.');return;}
  navGroupMap[key]={label,icon,officeIds:[]};
  document.getElementById('newCatLabel').value='';
  document.getElementById('newCatIcon').value='';
  renderCatMgrList();
  rebuildOGTabs();
  rebuildNavSidebarFull();
  logAction(`Added category: ${label}`);
  showSyncToast(`✅ Category "${label}" added`);
}
function renameCategoryPrompt(key){
  const g=navGroupMap[key];if(!g)return;
  const newLabel=prompt('New category name:',g.label);
  if(!newLabel||!newLabel.trim())return;
  const newIcon=prompt('New icon (emoji):',g.icon||'🏢')||g.icon||'🏢';
  g.label=newLabel.trim();
  g.icon=newIcon.trim();
  renderCatMgrList();
  rebuildOGTabs();
  rebuildNavSidebarFull();
  logAction(`Renamed category to: ${g.label}`);
  showSyncToast(`✏️ Category renamed to "${g.label}"`);
}
function deleteCategoryConfirm(key){
  const g=navGroupMap[key];if(!g)return;
  if(!confirm(`Delete category "${g.label}"? The offices inside will be removed from the sidebar (office data is kept).`))return;
  delete navGroupMap[key];
  if(currentOGTab===key) currentOGTab=Object.keys(navGroupMap)[0]||'';
  renderCatMgrList();
  rebuildOGTabs();
  rebuildNavSidebarFull();
  logAction(`Deleted category: ${g.label}`);
  showSyncToast(`🗑 Category "${g.label}" deleted`);
}
function rebuildOGTabs(){
  const container=document.querySelector('#view-settings .og-tab-btn')?.parentElement;
  if(!container)return;
  container.innerHTML=Object.entries(navGroupMap).map(([k,g])=>
    `<button class="og-tab-btn${currentOGTab===k?' active':''}" id="og-tab-${k}" onclick="switchOGTab('${k}',this)">${g.icon||'🏢'} ${g.label}</button>`
  ).join('');
}
function rebuildNavSidebarFull(){
  // Rebuild the entire sidebar nav groups section dynamically
  const sidebarNav=document.getElementById('sidebar-nav-groups');
  if(!sidebarNav){rebuildNavSidebar();return;}
  sidebarNav.innerHTML=Object.entries(navGroupMap).map(([k,g])=>{
    const items=g.officeIds.map(oid=>{
      const o=officeData[oid];if(!o)return'';
      return`<div class="nav-item" onclick="showOfficeDept('${oid}')"><span class="icon">${o.icon}</span><span class="label">${o.name}</span><span class="count">${o.depts.length}</span></div>`;
    }).filter(Boolean).join('');
    return`<div class="nav-group">
      <div class="nav-group-header${currentOGTab===k?' open':''}" onclick="toggleNavGroup(this)">
        <span style="font-size:0.9rem">${g.icon||'🏢'}</span>
        <span class="ngh-label">${g.label}</span>
        <span class="ngh-arrow">›</span>
      </div>
      <div class="nav-children" id="navchildren-${k}">${items}</div>
    </div>`;
  }).join('');
  renderOGList();
}

// Pre-fill Settings admin profile inputs when settings is shown
const _origShowSettings=window.showSettings;
function showSettings(){
  if(typeof _origShowSettings==='function')_origShowSettings();
  setTimeout(()=>{
    // sync tab button active states
    document.querySelectorAll('.og-tab-btn').forEach(b=>b.classList.remove('active'));
    const activeBtn=document.getElementById('og-tab-'+currentOGTab);
    if(activeBtn)activeBtn.classList.add('active');
    renderOGList();
  },50);
  setTimeout(()=>{
    const sn=document.getElementById('adminEditName');if(sn)sn.value=localStorage.getItem('mets_admin_name')||'';
    const su=document.getElementById('adminEditUsername');if(su)su.value=localStorage.getItem('mets_admin_user')||'';
    const sd=document.getElementById('adminEditDept');if(sd)sd.value=localStorage.getItem('mets_admin_dept')||'';
  },50);
}

// Check first run — called after landing page completes
function initPostLanding(){
  showLoginScreen();
  updateLoginInfo();
}
// Pre-load updateLoginInfo on page start (updates admin name if account exists)
(()=>{ if(localStorage.getItem('mets_setup_done')) updateLoginInfo(); })();

// ══════════════════════════════════════════════════════════
// PIN / LOGIN
// ══════════════════════════════════════════════════════════
let pinBuffer='';
let loginAttempts=0;
const MAX_ATTEMPTS=3;
const CORRECT_PIN=()=>localStorage.getItem('mets_pin')||'123456';

function updateLoginPinSpan(){
  const el=document.getElementById('loginPinSpan');if(!el)return;
  if(loginPinVisible){
    el.textContent=(pinBuffer||'')+'─'.repeat(Math.max(0,PIN_LENGTH-pinBuffer.length));
  } else {
    el.textContent='●'.repeat(pinBuffer.length)+'─'.repeat(Math.max(0,PIN_LENGTH-pinBuffer.length));
  }
}

function pinPress(d){
  if(pinBuffer.length>=PIN_MAX)return;
  pinBuffer+=d;
  updateLoginPinSpan();
}
function pinClear(){pinBuffer=pinBuffer.slice(0,-1);updateLoginPinSpan();}
function pinReset(){pinBuffer='';updateLoginPinSpan();}
function updatePinDots(){updateLoginPinSpan();}
function checkPin(){
  if(pinBuffer.length<PIN_LENGTH){
    document.getElementById('loginError').textContent=`PIN must be at least ${PIN_LENGTH} digits.`;
    setTimeout(()=>document.getElementById('loginError').textContent='',2500);
    return;
  }
  if(pinBuffer===CORRECT_PIN()){
    loginAttempts=0;
    document.getElementById('forgotPasswordLink').style.display='none';
    document.getElementById('loginScreen').classList.add('hidden');
    logAction('System unlocked by '+(localStorage.getItem('mets_admin_name')||'Admin'));
    resetLockTimer();
    initDashboard();
    // Update admin badge in sidebar
    const ab=document.getElementById('adminNameDisplay');
    if(ab)ab.textContent='GSO - OIC';
    const ad=document.getElementById('adminDeptDisplay');
    if(ad)ad.textContent='General Services Office';
    const av=document.getElementById('adminAvatarInitials');
    if(av)av.textContent='GSO';
  } else {
    loginAttempts++;
    pinBuffer='';updateLoginPinSpan();
    if(loginAttempts>=MAX_ATTEMPTS){
      document.getElementById('loginError').textContent=`Incorrect PIN (${loginAttempts} failed attempts).`;
      document.getElementById('forgotPasswordLink').style.display='block';
    } else {
      document.getElementById('loginError').textContent=`Incorrect PIN. Attempt ${loginAttempts}/${MAX_ATTEMPTS}.`;
    }
    setTimeout(()=>document.getElementById('loginError').textContent='',3000);
  }
}
function lockSystem(){
  clearTimeout(lockTimer);
  document.getElementById('loginScreen').classList.remove('hidden');
  pinBuffer='';updateLoginPinSpan();
  logAction('System locked');
}
function openLogoutConfirm(){
  document.getElementById('logoutConfirmModal').classList.add('open');
}
function closeLogoutConfirm(){
  document.getElementById('logoutConfirmModal').classList.remove('open');
}
function confirmLogout(){
  closeLogoutConfirm();
  lockSystem();
}

// ── FORGOT PASSWORD ──
let rpPin='';
function openForgotPassword(){
  document.getElementById('forgotPasswordModal').style.display='flex';
  document.getElementById('captchaCheck').checked=false;
  // Restore captcha box visibility for next open
  const box=document.getElementById('captchaBoxWrap');
  const lbl=document.getElementById('captchaSubLabel');
  if(box){box.style.display='';box.style.opacity='1';}
  if(lbl){lbl.style.display='';lbl.style.opacity='1';}
  document.getElementById('recoveryOptions').style.display='none';
  document.getElementById('newPinSetArea').style.display='none';
  rpPin='';
  const rd=document.getElementById('rpPinDots');if(rd)rd.textContent='──────';
}
function closeForgotPassword(){document.getElementById('forgotPasswordModal').style.display='none';}
function verifyCaptcha(){
  if(document.getElementById('captchaCheck').checked){
    // Hide captcha box and label after verification
    setTimeout(()=>{
      const box=document.getElementById('captchaBoxWrap');
      const lbl=document.getElementById('captchaSubLabel');
      if(box){box.style.transition='opacity 0.4s';box.style.opacity='0';setTimeout(()=>{box.style.display='none';},400);}
      if(lbl){lbl.style.transition='opacity 0.4s';lbl.style.opacity='0';setTimeout(()=>{lbl.style.display='none';},400);}
      document.getElementById('recoveryOptions').style.display='block';
    },500);
  }
}
function resetPinOption(){
  document.getElementById('recoveryOptions').style.display='none';
  document.getElementById('newPinSetArea').style.display='block';
  rpPin='';
  const rd=document.getElementById('rpPinDots');if(rd)rd.textContent='──────';
}
function rpPinPress(d){if(rpPin.length>=PIN_MAX)return;rpPin+=d;_renderRpPinDots();}
function rpPinClear(){rpPin=rpPin.slice(0,-1);_renderRpPinDots();}
function rpPinReset(){rpPin='';const rd=document.getElementById('rpPinDots');if(rd)rd.textContent='──────';rpPinVisible=false;const ic=document.getElementById('rpEyeIcon');if(ic)ic.innerHTML=EYE_OPEN_SVG;}
function saveResetPin(){
  if(rpPin.length<PIN_LENGTH){document.getElementById('rpError').textContent=`PIN must be at least ${PIN_LENGTH} digits.`;return;}
  localStorage.setItem('mets_pin',rpPin);
  loginAttempts=0;
  document.getElementById('forgotPasswordLink').style.display='none';
  closeForgotPassword();
  logAction('PIN reset via forgot password');
  document.getElementById('loginError').textContent='PIN reset! Please log in with your new PIN.';
  setTimeout(()=>document.getElementById('loginError').textContent='',4000);
}

function changePIN(){
  const np=document.getElementById('newPin').value.trim();
  if(!/^\d{6,12}$/.test(np)){alert('PIN must be 6–12 digits.');return;}
  localStorage.setItem('mets_pin',np);
  document.getElementById('newPin').value='';
  logAction('PIN changed');
  alert('PIN updated successfully.');
}
function resetLockTimer(){
  clearTimeout(lockTimer);
  const mins=parseInt(document.getElementById('lockTimerSel')?.value||'10');
  if(mins>0) lockTimer=setTimeout(lockSystem,mins*60000);
}
document.addEventListener('click',resetLockTimer);
document.addEventListener('keydown',resetLockTimer);
function saveLockTimer(){resetLockTimer();}

// ══════════════════════════════════════════════════════════
// SIDEBAR COLLAPSE TOGGLE
// ══════════════════════════════════════════════════════════
function toggleSidebar(){
  const sb=document.getElementById('sidebar');
  const btn=document.getElementById('sidebarToggleBtn');
  const isCollapsed=sb.classList.toggle('collapsed');
  if(btn){
    const label=btn.querySelector('.stb-label');
    if(label)label.textContent=isCollapsed?'Expand Sidebar':'Collapse Sidebar';
  }
  localStorage.setItem('mets_sidebar_collapsed',isCollapsed?'1':'0');
}
// Restore sidebar state
(()=>{
  if(localStorage.getItem('mets_sidebar_collapsed')==='1'){
    const sb=document.getElementById('sidebar');
    const btn=document.getElementById('sidebarToggleBtn');
    if(sb){sb.classList.add('collapsed');}
    if(btn){const l=btn.querySelector('.stb-label');if(l)l.textContent='Expand Sidebar';}
  }
})();


function toggleDarkMode(){
  const isDark=document.documentElement.getAttribute('data-theme')==='dark';
  const next=isDark?'light':'dark';
  document.documentElement.setAttribute('data-theme',next);
  localStorage.setItem('mets_theme',next);
  const cb=document.getElementById('darkModeToggle');
  if(cb)cb.checked=!isDark;
  const btn=document.getElementById('darkToggleBtn');
  if(btn){btn.textContent=isDark?'🌙 Dark Mode':'☀️ Light Mode';btn.classList.toggle('active-dark',!isDark);}
  logAction(`Switched to ${next} mode`);
  if(statusChartInstance)setTimeout(buildStatusChart,100);
}
// Apply saved theme
(()=>{
  const t=localStorage.getItem('mets_theme');
  if(t){
    document.documentElement.setAttribute('data-theme',t);
    if(t==='dark'){
      const cb=document.getElementById('darkModeToggle');if(cb)cb.checked=true;
      const btn=document.getElementById('darkToggleBtn');if(btn){btn.textContent='☀️ Light Mode';btn.classList.add('active-dark');}
    }
  }
})();

// ══════════════════════════════════════════════════════════
// GEOLOCATION
// ══════════════════════════════════════════════════════════
function updateGeoIndicators(loc){
  const ind=document.getElementById('geoIndicator'),lbl=document.getElementById('geoLabel');
  if(ind&&lbl){
    if(loc){
      ind.classList.add('active');ind.style.color='';
      lbl.textContent=`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
    }else{
      ind.classList.remove('active');ind.style.color='';
      lbl.textContent='Enable Location';
    }
  }
  const st=document.getElementById('geoSettingStatus');
  if(st)st.textContent=loc?`${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)} ±${loc.acc}m`:'Not detected';
  const hg=document.getElementById('heroGeo');
  if(hg)hg.textContent=loc?`📍 ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`:'📍 Location not set';
}
function requestGeolocation(){
  const ind=document.getElementById('geoIndicator'),lbl=document.getElementById('geoLabel');
  if(!navigator.geolocation){if(lbl)lbl.textContent='Geolocation N/A';return;}
  if(ind)ind.style.color='var(--orange)';if(lbl)lbl.textContent='Locating...';
  navigator.geolocation.getCurrentPosition(
    pos=>{
      currentLocation={lat:pos.coords.latitude,lng:pos.coords.longitude,acc:Math.round(pos.coords.accuracy),at:new Date().toISOString()};
      updateGeoIndicators(currentLocation);
      logAction('Geolocation detected');
    },
    ()=>{if(ind)ind.style.color='';if(lbl)lbl.textContent='Location denied';showSyncToast('📍 Allow location access for this site so scans can record where they happen');}
  ,{enableHighAccuracy:true,timeout:12000,maximumAge:0});
}
function getLocationString(){
  if(!currentLocation)return null;
  return `${currentLocation.lat.toFixed(5)},${currentLocation.lng.toFixed(5)} (±${currentLocation.acc}m)`;
}
let _scanBusy=false;
// Reads the device's geolocation at the moment of a scan. Resolves to {lat,lng,acc,at} or null if unavailable/denied.
function getScanLocation(){
  return new Promise(resolve=>{
    const finish=loc=>resolve(loc);
    // Use a fresh real fix captured when the scanner opened (under 90s old).
    if(currentLocation&&currentLocation.at){
      const age=Date.now()-new Date(currentLocation.at).getTime();
      if(age>=0&&age<90000){finish({...currentLocation,at:new Date().toISOString()});return;}
    }
    const fallback=()=>{
      // Reuse a very recent real fix instead of inventing coordinates.
      if(currentLocation&&currentLocation.at){
        const age=Date.now()-new Date(currentLocation.at).getTime();
        if(age>=0&&age<120000){finish({...currentLocation,at:new Date().toISOString()});return;}
      }
      finish(null);
    };
    if(!navigator.geolocation){fallback();return;}
    const ok=pos=>{
      const loc={lat:pos.coords.latitude,lng:pos.coords.longitude,acc:Math.round(pos.coords.accuracy),at:new Date().toISOString()};
      currentLocation=loc;
      updateGeoIndicators(loc);
      finish(loc);
    };
    // High-accuracy fix first; if the device times out, retry with a
    // network/cell fix so scanning still records a real location.
    navigator.geolocation.getCurrentPosition(
      ok,
      ()=>{
        navigator.geolocation.getCurrentPosition(
          ok,
          fallback,
          {enableHighAccuracy:false,timeout:8000,maximumAge:120000}
        );
      },
      {enableHighAccuracy:true,timeout:15000,maximumAge:0}
    );
  });
}
function fmtLoc(l){return l?`${l.lat.toFixed(6)}, ${l.lng.toFixed(6)} (±${l.acc}m)${l.demo?' · demo':''}`:'Location not captured';}
// Saves the scan's latitude/longitude on the asset record (numeric fields + short scan history).
function recordAssetScan(assetId,loc,source){
  if(!assetId)return;
  for(const list of Object.values(staffData)){
    if(!Array.isArray(list))continue;
    for(const s of list){
      const eq=s.equipment&&s.equipment.find(e=>e.id===assetId);
      if(!eq)continue;
      const when=new Date().toISOString();
      eq.lastScannedTime=when;
      eq.lastScanDate=when.slice(0,10);
      eq.lastScanLat=loc?loc.lat:null;
      eq.lastScanLng=loc?loc.lng:null;
      eq.lastScanAcc=loc?loc.acc:null;
      eq.lastScanDemo=!!(loc&&loc.demo);
      eq.lastScannedLocation=loc?fmtLoc(loc):'Location not captured';
      eq.scanHistory=(eq.scanHistory||[]);
      eq.scanHistory.unshift({time:when,lat:eq.lastScanLat,lng:eq.lastScanLng,acc:eq.lastScanAcc,demo:eq.lastScanDemo,source:source||'qr_scan'});
      if(eq.scanHistory.length>20)eq.scanHistory.length=20;
      return;
    }
  }
}

// Persists the scan in the offline-first IndexedDB queue. The server ignores
// duplicate scan_ids, so retries are safe. Demo coordinates are never saved.
function queueAssetScan(assetId,loc,source,eq){
  if(!assetId||!window.KatScanQueue)return null;
  const demo=!!(loc&&loc.demo);
  const lat=loc&&!demo?loc.lat:null;
  const lng=loc&&!demo?loc.lng:null;
  const acc=loc&&!demo?loc.acc:null;
  const where=loc? (demo?' (demo location not saved)':' at '+Number(lat).toFixed(5)+', '+Number(lng).toFixed(5)+' (±'+acc+'m)') : ' (location not captured)';
  const scanId=window.KatScanQueue.newId();
  window._lastQueuedScanId=scanId;
  window._lastScanLoc=loc||null;
  window.KatScanQueue.enqueue({
    scan_id:scanId,
    asset_id:assetId,
    latitude:lat,
    longitude:lng,
    accuracy:acc,
    scanned_at:new Date().toISOString(),
    activity:'QR scan — '+assetId+where,
    source:source||'qr_scan'
  });
  return scanId;
}

// ── Scan location monitoring, map previews, and history ────────────────
const MODAL_SCAN_SPEC={regLocation:'scanResLocation',regCoords:'scanResRegCoords',scanCoords:'scanResScannedLoc',accuracy:'scanResAccuracy',time:'scanResTime',check:'scanResLocCheck',mapWrap:'scanResMapWrap',map:'scanResMap',history:'scanResHistory',msg:'scanResLocMsg'};
const MOBILE_SCAN_SPEC={regLocation:'resRegLocation',regCoords:'resRegCoords',scanCoords:'resScanCoords',accuracy:'resScanAccuracy',time:'resScanTime',check:'resLocCheck',mapWrap:'resScanMapWrap',map:'resScanMap',history:'resScanHistory',msg:'resLocMsg'};
function coordOk(value){return value!==null&&value!==undefined&&value!==''&&isFinite(Number(value));}
function coordText(lat,lng){return Number(lat).toFixed(5)+', '+Number(lng).toFixed(5);}
function haversineMeters(lat1,lng1,lat2,lng2){
  const R=6371000,toRad=d=>d*Math.PI/180;
  const dLat=toRad(lat2-lat1),dLng=toRad(lng2-lng1);
  const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return 2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function scanHistoryItems(eq){
  return (eq&&Array.isArray(eq.scanHistory)?eq.scanHistory:[]).map(h=>({...h,source:h.source||'qr_scan'}));
}
function renderScanHistory(items,spec){
  const box=document.getElementById(spec.history);if(!box)return;
  if(!items.length){box.innerHTML='<div class="scan-history-empty">No scans recorded yet. Each QR scan records time, coordinates, and accuracy.</div>';return;}
  box.innerHTML=items.slice(0,10).map(item=>{
    const lat=item.latitude!=null?item.latitude:item.lat;
    const lng=item.longitude!=null?item.longitude:item.lng;
    const acc=item.accuracy!=null?item.accuracy:item.acc;
    const coords=(coordOk(lat)&&coordOk(lng))?coordText(lat,lng):'Location not captured';
    const when=item.scanned_at||item.time;
    const timeText=when?new Date(when).toLocaleString('en-PH'):'—';
    const who=item.user_name?dashEsc(item.user_name)+(item.user_role_label?' ('+dashEsc(item.user_role_label)+')':''):'';
    return '<div class="scan-history-item">'+
      '<div class="shi-top"><b>'+dashEsc(timeText)+'</b>'+(item.demo?' <span class="shi-demo">demo</span>':'')+'</div>'+
      '<div class="shi-coords">📍 '+dashEsc(coords)+(acc!=null?' · ±'+Number(acc).toFixed(1)+'m':'')+'</div>'+
      (who?'<div class="shi-user">'+who+'</div>':'')+
      '<div class="shi-src">'+dashEsc(item.source||'qr_scan')+'</div></div>';
  }).join('');
}
async function refreshScanHistory(spec,assetId,eq){
  const local=scanHistoryItems(eq);
  renderScanHistory(local,spec);
  try{
    if(!navigator.onLine)return;
    const token=localStorage.getItem('kat_token');if(!token)return;
    const res=await fetch('/api/scans?asset_id='+encodeURIComponent(assetId)+'&limit=10',{headers:{Authorization:'Bearer '+token}});
    if(!res.ok)return;
    const data=await res.json();
    if(Array.isArray(data.items)&&data.items.length){
      const merged=data.items.slice();
      local.forEach(l=>{
        const t=new Date(l.time).getTime();
        if(!merged.some(m=>{
          const mt=new Date(m.scanned_at).getTime();
          return Math.abs(mt-t)<2500;
        }))merged.push(l);
      });
      merged.sort((a,b)=>new Date(b.scanned_at||b.time)-new Date(a.scanned_at||a.time));
      renderScanHistory(merged,spec);
    }
  }catch(e){}
}
function renderScanMonitoring(spec,assetId,loc,eq){
  eq=eq||((typeof katFindAsset==='function'&&katFindAsset(assetId).eq)||null);
  const regLat=eq?(coordOk(eq.regLat)?eq.regLat:(coordOk(eq.latitude)?eq.latitude:null)):null;
  const regLng=eq?(coordOk(eq.regLng)?eq.regLng:(coordOk(eq.longitude)?eq.longitude:null)):null;
  const hasReg=coordOk(regLat)&&coordOk(regLng);
  const isDemo=!!(loc&&loc.demo);
  const scanOk=!!(loc&&!isDemo&&coordOk(loc.lat)&&coordOk(loc.lng));
  setText(spec.regLocation,eq&&eq.location?eq.location:'—');
  setText(spec.regCoords,hasReg?coordText(regLat,regLng):'Not available');
  setText(spec.scanCoords,scanOk?coordText(loc.lat,loc.lng):(isDemo?'Demo coordinates (not saved)':'Location not captured'));
  setText(spec.accuracy,scanOk?'±'+Number(loc.acc).toFixed(1)+' m':'—');
  const scanAt=(loc&&loc.at)?loc.at:(window._lastScanAt||null);
  setText(spec.time,scanAt?new Date(scanAt).toLocaleString('en-PH'):'—');
  let check='Registered coordinates are not available — compare with the assigned location.';
  if(hasReg&&scanOk){
    const d=haversineMeters(Number(regLat),Number(regLng),Number(loc.lat),Number(loc.lng));
    check=d<=150?`Within ${Math.round(d)} m of registered coordinates`:`Scanned ${Math.round(d)} m from registered coordinates — official location unchanged.`;
  }else if(scanOk&&!hasReg){
    check='Scanned coordinates recorded; registered coordinates are not set.';
  }else if(!scanOk){
    check='No real GPS fix was recorded for this scan.';
  }
  setText(spec.check,check);
  window._scanMapCoords=scanOk?{lat:Number(loc.lat),lng:Number(loc.lng)}:(hasReg?{lat:Number(regLat),lng:Number(regLng)}:null);
  window._registeredMapCoords=hasReg?{lat:Number(regLat),lng:Number(regLng)}:null;
  const wrap=document.getElementById(spec.mapWrap),map=document.getElementById(spec.map);
  if(wrap&&map){
    if(window._scanMapCoords&&navigator.onLine){
      const s=window._scanMapCoords,r=window._registeredMapCoords;
      map.src=r?('https://maps.google.com/maps?saddr='+r.lat+','+r.lng+'&daddr='+s.lat+','+s.lng+'&z=17&output=embed'):('https://maps.google.com/maps?q='+s.lat+','+s.lng+'&z=17&output=embed');
      wrap.style.display='block';
    }else{
      map.src='about:blank';wrap.style.display='none';
    }
  }
  refreshScanHistory(spec,assetId,eq);
}
function openScanMap(){
  const c=window._scanMapCoords;
  if(!c){alert('No coordinates available for this scan.');return;}
  window.open('https://www.google.com/maps?q='+c.lat+','+c.lng,'_blank');
}
function openRegisteredMap(){
  const c=window._registeredMapCoords;
  if(!c){alert('No registered coordinates are available for this asset.');return;}
  window.open('https://www.google.com/maps?q='+c.lat+','+c.lng,'_blank');
}
function openCompareMap(){
  const s=window._scanMapCoords,r=window._registeredMapCoords;
  if(!s||!r){alert('Both registered and scanned coordinates are needed to compare on the map.');return;}
  window.open('https://www.google.com/maps/dir/?api=1&origin='+r.lat+','+r.lng+'&destination='+s.lat+','+s.lng,'_blank');
}
async function retryScanLocation(spec,assetId){
  const msg=document.getElementById(spec.msg);
  if(msg)msg.textContent='Locating…';
  const loc=await getScanLocation();
  if(!loc){if(msg)msg.textContent='Location unavailable — allow location access and retry.';return;}
  if(loc.demo){if(msg)msg.textContent='Demo coordinates are ON. Turn them off in Settings to record real GPS.';return;}
  _scanLoc=loc;window._lastScanLoc=loc;
  const eq=(typeof katFindAsset==='function'&&katFindAsset(assetId).eq)||null;
  recordAssetScan(assetId,loc,'qr_scan_retry');
  let updated=false;
  if(window._lastQueuedScanId&&window.KatScanQueue){
    updated=await window.KatScanQueue.updatePending(window._lastQueuedScanId,{
      latitude:loc.lat,longitude:loc.lng,accuracy:loc.acc,
      activity:'QR scan retry — '+assetId+' at '+coordText(loc.lat,loc.lng)+' (±'+loc.acc+'m)'
    });
  }
  if(!updated)queueAssetScan(assetId,loc,'qr_scan_retry',eq);
  renderScanMonitoring(spec,assetId,loc,eq);
  if(msg)msg.textContent='✅ Location updated: '+coordText(loc.lat,loc.lng)+' (±'+loc.acc+'m)';
}
function retryMobileScanLocation(){return retryScanLocation(MOBILE_SCAN_SPEC,scannedAsset.id);}
function retryModalScanLocation(){return retryScanLocation(MODAL_SCAN_SPEC,window._lastScannedId||'');}


// ══════════════════════════════════════════════════════════
// NAVIGATION HELPERS
// ══════════════════════════════════════════════════════════
function toggleNavGroup(header){header.classList.toggle('open');}

function setActiveNav(el){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  if(el)el.classList.add('active');
}
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  const el=document.getElementById('view-'+id);
  if(el)el.classList.add('active');
}
function setBreadcrumb(items){
  const bc=document.getElementById('breadcrumb');
  bc.innerHTML=items.map((it,i)=>{
    if(i===items.length-1)return`<span class="current">${it.label}</span>`;
    const fn=it.fn?`onclick="${it.fn}"`:'';
    return`<span ${fn}>${it.label}</span><span class="sep">›</span>`;
  }).join('');
}
function goHome(){
  navStack=[];currentOfficeId=null;currentDeptId=null;currentStaff=null;
  setBreadcrumb([{label:'Dashboard'}]);showView('dashboard');
  setActiveNav(null);
  try{updateDashStats();buildAlertsPanel();}catch(e){}
}
function goBack(){
  if(navStack.length>1){navStack.pop();const last=navStack[navStack.length-1];last.fn();}
  else goHome();
}
function goToNav(i){const t=navStack[i];navStack=navStack.slice(0,i+1);t.fn();}

/* ── RESPONSIVE SIDEBAR DRAWER ── */
function toggleMobileSidebar(force){
  const sidebar=document.getElementById('sidebar');
  const overlay=document.getElementById('mobileSidebarOverlay');
  if(!sidebar)return;
  const open=force===true?true:force===false?false:!sidebar.classList.contains('mobile-open');
  sidebar.classList.toggle('mobile-open',open);
  if(overlay)overlay.classList.toggle('show',open);
  document.body.classList.toggle('mobile-nav-open',open);
}
function closeMobileSidebar(){toggleMobileSidebar(false);}
function normalizeSidebarForViewport(){
  const sidebar=document.getElementById('sidebar');
  if(window.innerWidth>900){
    closeMobileSidebar();
  }else if(sidebar){
    sidebar.classList.remove('collapsed');
  }
}
window.addEventListener('resize',normalizeSidebarForViewport);
document.addEventListener('DOMContentLoaded',normalizeSidebarForViewport);
document.addEventListener('keydown',function(event){
  if(event.key==='Escape')closeMobileSidebar();
});
document.addEventListener('click',function(event){
  if(window.innerWidth>900)return;
  if(event.target.closest('#sidebar .nav-item'))closeMobileSidebar();
});

function getStatusClass(s){
  if(s==='Serviceable')return 'eq-usable';
  if(s==='Unserviceable')return 'eq-unusable';
  if(s==='Damaged')return 'eq-repair';
  if(s==='Lost')return 'eq-lost';
  if(s==='Missing')return 'eq-missing';
  return 'eq-usable';
}
function getStatusIcon(s){
  if(s==='Serviceable')return '✅';
  if(s==='Unserviceable')return '❌';
  if(s==='Damaged')return '🔧';
  if(s==='Lost')return '🔴';
  if(s==='Missing')return '🟡';
  return '✅';
}
function isBadStatus(s){return s!=='Serviceable';}

// ══════════════════════════════════════════════════════════
// ONLINE / OFFLINE SYNC
// ══════════════════════════════════════════════════════════
let isOnline=navigator.onLine;
let pendingSync=JSON.parse(localStorage.getItem('mets_pending_sync')||'[]');

function updateSyncBar(){
  const bar=document.getElementById('syncStatusBar');
  const txt=document.getElementById('syncStatusText');
  const badge=document.getElementById('pendingSyncCount');
  const btn=document.getElementById('syncNowBtn');
  const chip=document.getElementById('heroSyncChip');
  if(!bar)return;
  const scanPending=(typeof window.__KAT_SCAN_PENDING__==='number')?window.__KAT_SCAN_PENDING__:0;
  const totalPending=pendingSync.length+scanPending;
  if(isOnline){
    bar.className='online';
    txt.textContent=totalPending?`Online — ${totalPending} item(s) pending sync`:'Online — All data synchronized ✓';
    badge.style.display=totalPending?'inline':'none';
    badge.textContent=totalPending+' pending';
    btn.style.display=totalPending?'inline-block':'none';
    if(chip)chip.textContent=totalPending?`🌐 Online — ${totalPending} pending`:'🌐 Online — Synced';
  } else {
    bar.className='offline';
    txt.textContent=totalPending?`Offline Mode — ${totalPending} item(s) queued for sync`:'Offline Mode — Changes will sync when online';
    badge.style.display=totalPending?'inline':'none';
    badge.textContent=totalPending+' queued';
    btn.style.display='none';
    if(chip)chip.textContent=totalPending?`📴 Offline — ${totalPending} queued`:'📴 Offline Mode';
  }
}

function queueSync(action,data){
  pendingSync.push({action,data,timestamp:new Date().toISOString(),id:Date.now()});
  localStorage.setItem('mets_pending_sync',JSON.stringify(pendingSync));
  updateSyncBar();
  if(isOnline)setTimeout(syncNow,500);
}

async function syncNow(){
  if(!isOnline||!pendingSync.length)return;
  const bar=document.getElementById('syncStatusBar');
  const txt=document.getElementById('syncStatusText');
  bar.className='syncing';
  txt.textContent=`Syncing ${pendingSync.length} change(s)...`;
  // Simulate sync (in production, POST to your backend/Firebase)
  await new Promise(r=>setTimeout(r,1200));
  logAction(`Synced ${pendingSync.length} record(s) to central database`);
  pendingSync=[];
  localStorage.setItem('mets_pending_sync','[]');
  updateSyncBar();
  showSyncToast(`✅ Sync complete — all records updated`);
}

function showSyncToast(msg){
  let t=document.getElementById('syncToast');
  if(!t){t=document.createElement('div');t.id='syncToast';
    t.style.cssText='position:fixed;bottom:24px;right:24px;background:var(--navy);color:var(--gold);padding:10px 18px;border-radius:10px;font-size:0.78rem;font-weight:600;z-index:9000;box-shadow:0 4px 20px rgba(0,0,0,0.3);transition:opacity 0.4s';
    document.body.appendChild(t);}
  t.textContent=msg;t.style.opacity='1';
  setTimeout(()=>{t.style.opacity='0';},3000);
}

window.addEventListener('online',()=>{
  isOnline=true;updateSyncBar();
  showSyncToast('🌐 Back online — syncing...');
  if(pendingSync.length)syncNow();
});
window.addEventListener('offline',()=>{
  isOnline=false;updateSyncBar();
  showSyncToast('📴 Offline — changes saved locally');
});

// ══════════════════════════════════════════════════════════
// QR SCANNER
// ══════════════════════════════════════════════════════════
let html5QrScanner=null;

function createQrScanner(elementId){
  const config={
    useBarCodeDetectorIfSupported:true,
    experimentalFeatures:{useBarCodeDetectorIfSupported:true}
  };
  if(typeof Html5QrcodeSupportedFormats!=='undefined'&&typeof Html5QrcodeSupportedFormats.QR_CODE!=='undefined'){
    config.formatsToSupport=[Html5QrcodeSupportedFormats.QR_CODE];
  }
  return new Html5Qrcode(elementId,config);
}
function cameraErrorMessage(err){
  return 'Scanner unavailable';
}
function qrCameraCandidates(selectId){
  const list=[];
  const seen=new Set();
  const add=(cfg,key)=>{if(cfg&&!seen.has(key)){seen.add(key);list.push(cfg);}};
  const selected=((document.getElementById(selectId)||{}).value)||localStorage.getItem('mets_camera_id')||'';
  if(selected)add({deviceId:{exact:selected}},'id:'+selected);
  const mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||'');
  if(mobile)add({facingMode:{ideal:'environment'}},'env');
  (window._availableCameras||[]).forEach(cam=>{
    if(cam&&cam.id&&cam.id!==selected)add({deviceId:{exact:cam.id}},'id:'+cam.id);
  });
  if(!mobile)add({facingMode:{ideal:'environment'}},'env');
  add({facingMode:{ideal:'user'}},'user');
  add({facingMode:'environment'},'env2');
  add({facingMode:'user'},'user2');
  return list;
}
function openQRScanner(target){
  window._qrScanTarget=target||'modal';
  document.getElementById('qrScannerModal').classList.add('open');
  document.getElementById('qrScanResult').style.display='none';
  document.getElementById('qrScanActions').style.display='none';
  document.getElementById('quickStatusRow').style.display='none';
  document.getElementById('qrScanError').style.display='none';
  document.getElementById('qrScanError').textContent='';
  _scanBusy=false;
  if((target||'modal')==='modal' && navigator.geolocation){
    // Prime the device location when the scanner opens so the scan can record
    // a real fix immediately instead of waiting mid-scan.
    try{getScanLocation();}catch(e){}
  }
  clearTimeout(window._qrStartTimer);
  window._qrStartTimer=setTimeout(()=>{startModalScanner();},250);
}
async function startModalScanner(){
  const errEl=document.getElementById('qrScanError');
  if(typeof Html5Qrcode==='undefined'){
    if(errEl){errEl.style.display='block';errEl.textContent='QR scanner library not loaded. Reopen the app to load it.';}
    return null;
  }
  if(!window.isSecureContext){
    if(errEl){errEl.style.display='block';errEl.textContent=cameraErrorMessage(null);}
    return null;
  }
  if(errEl){errEl.style.display='block';errEl.textContent='Requesting camera…';}
  const reader=document.getElementById('qr-reader');
  if(html5QrScanner){try{await html5QrScanner.stop();}catch(e){}html5QrScanner=null;}
  await loadCameraSelectors();
  let lastError=null;
  for(const cfg of qrCameraCandidates('qrCameraSel')){
    if(!document.getElementById('qrScannerModal').classList.contains('open'))return null;
    if(reader)reader.innerHTML='';
    const scanner=createQrScanner('qr-reader');
    html5QrScanner=scanner;
    try{
      await scanner.start(
        cfg,
        {fps:30,qrbox:(w,h)=>{const s=Math.max(160,Math.floor(Math.min(w,h)*0.65));return{width:s,height:s};},aspectRatio:1.0,disableFlip:false},
        onQRScanSuccess,
        ()=>{}
      );
      if(!document.getElementById('qrScannerModal').classList.contains('open')){
        try{await scanner.stop();}catch(e){}
        if(html5QrScanner===scanner)html5QrScanner=null;
        return null;
      }
      if(errEl){errEl.style.display='none';errEl.textContent='';}
      return scanner;
    }catch(err){
      lastError=err;
      if(html5QrScanner===scanner)html5QrScanner=null;
      try{await scanner.stop();}catch(e){}
      try{scanner.clear();}catch(e){}
    }
  }
  if(errEl){errEl.style.display='block';errEl.textContent=cameraErrorMessage(lastError);}
  return null;
}

async function loadCameraSelectors(){
  if(typeof Html5Qrcode==='undefined'||typeof Html5Qrcode.getCameras!=='function')return;
  try{
    const cams=await Html5Qrcode.getCameras();
    window._availableCameras=cams||[];
    const saved=(()=>{try{return localStorage.getItem('mets_camera_id')||'';}catch(e){return'';}})();
    ['qrCameraSel'].forEach(id=>{
      const sel=document.getElementById(id);if(!sel)return;
      const current=sel.value||saved;
      sel.innerHTML='<option value="">Auto (default / rear camera)</option>'+cams.map((c,i)=>{
        const label=String(c.label||('Camera '+(i+1))).replace(/</g,'&lt;').replace(/>/g,'&gt;');
        return '<option value="'+c.id+'">'+label+'</option>';
      }).join('');
      if(current&&cams.some(c=>c.id===current))sel.value=current;
    });
  }catch(e){
    window._availableCameras=window._availableCameras||[];
  }
}
function restartQRScannerCamera(deviceId){
  if(deviceId){try{localStorage.setItem('mets_camera_id',deviceId);}catch(e){}}
  if(html5QrScanner){try{html5QrScanner.stop().catch(()=>{});}catch(e){}html5QrScanner=null;}
  _scanBusy=false;
  openQRScanner('modal');
}
function stopQRScannerCamera(){
  if(html5QrScanner){try{html5QrScanner.stop().catch(()=>{});}catch(e){}html5QrScanner=null;}
  _scanBusy=false;
  const reader=document.getElementById('qr-reader');if(reader)reader.innerHTML='';
  const result=document.getElementById('qrScanResult');if(result)result.style.display='none';
  const actions=document.getElementById('qrScanActions');if(actions)actions.style.display='none';
  const err=document.getElementById('qrScanError');
  if(err){err.style.display='block';err.textContent='Scanner stopped — press ▶ Start to resume.';}
}


async function onQRScanSuccess(decodedText){
  if(_scanBusy)return;
  _scanBusy=true;
  // Mobile scanner page: hand the decoded code to its own result screens.
  if(window._qrScanTarget==='mobile'){
    try{closeQRScanner();}catch(e){}
    try{await onQRDecoded(decodedText);}catch(e){}
    return;
  }
  if(html5QrScanner){try{html5QrScanner.pause();}catch(e){}}
  try{
    const scanLoc=await getScanLocation();   // geolocation captured at the moment of the scan
    let data;
    try{data=JSON.parse(decodedText);}
    catch{data={id:String(decodedText||'').trim()};}
    if(!data.id&&data.assetId)data.id=data.assetId;
    const found=katFindAsset(data.id);
    if(found.eq){
      data.name=found.eq.name||data.name;
      data.brand=found.eq.brand||data.brand;
      data.serial=found.eq.serial||data.serial;
      data.owner=found.staff?found.staff.name:data.owner;
      data.location=found.eq.location||data.location;
      data.acquiredDate=found.eq.acquiredDate||data.acquiredDate;
      data.amount=found.eq.amount||data.amount;
      data.status=found.eq.status||data.status;
    }
    document.getElementById('scanResId').textContent=data.id||'—';
    document.getElementById('scanResName').textContent=data.name||'—';
    document.getElementById('scanResBrand').textContent=data.brand||'—';
    document.getElementById('scanResSerial').textContent=data.serial||'—';
    document.getElementById('scanResOwner').textContent=data.owner||'—';
    document.getElementById('scanResLocation').textContent=data.location||'—';
    document.getElementById('scanResScannedLoc').textContent=fmtLoc(scanLoc);
    document.getElementById('scanResAcquired').textContent=data.acquiredDate||'N/A';
    document.getElementById('scanResAmount').textContent=formatAmt(data.amount);
    document.getElementById('scanResStatus').textContent=(data.status?getStatusIcon(data.status)+' ':'')+( data.status||'—');
    document.getElementById('scanResLGU').textContent=data.lgu||'LGU Katipunan';
    document.getElementById('scanResTime').textContent=new Date().toLocaleString('en-PH');
    document.getElementById('qrScanResult').style.display='block';
    document.getElementById('qrScanActions').style.display='block';
    document.getElementById('quickStatusRow').style.display='none';
    // Store last scanned ID for quick update
    window._lastScannedId=data.id;
    // Record latitude/longitude on the asset
    recordAssetScan(data.id,scanLoc,'qr_scan');
    _scanLoc=scanLoc;window._lastScanLoc=scanLoc;window._lastScanAt=new Date().toISOString();
    if(found.eq)queueAssetScan(data.id,scanLoc,'qr_scan',found.eq);
    try{renderScanMonitoring(MODAL_SCAN_SPEC,data.id,scanLoc,found.eq);}catch(e){}
    if(!scanLoc)showSyncToast('📍 Location not captured — allow location access to record where assets are scanned');
    logAction(`QR scanned: Asset ${data.id||decodedText} — ${data.status||'status unknown'} · ${fmtLoc(scanLoc)}`);
    queueSync('qr_scan',{assetId:data.id,scannedAt:new Date().toISOString(),scannedLat:scanLoc?scanLoc.lat:null,scannedLng:scanLoc?scanLoc.lng:null,scannedAccuracy:scanLoc?scanLoc.acc:null,scannedDemo:!!(scanLoc&&scanLoc.demo),scannedLocation:fmtLoc(scanLoc)});
  }catch(e){
    _scanBusy=false;
    if(html5QrScanner){try{html5QrScanner.resume();}catch(_){}}
    document.getElementById('qrScanError').style.display='block';
    document.getElementById('qrScanError').textContent='Invalid QR code format.';
  }
}

function quickUpdateStatus(){
  const row=document.getElementById('quickStatusRow');
  row.style.display=row.style.display==='none'?'flex':'none';
}

function applyQuickStatus(newStatus){
  const eqId=window._lastScannedId;
  if(!eqId){alert('No asset scanned yet.');return;}
  for(const list of Object.values(staffData)){
    if(!Array.isArray(list))continue;
    for(const s of list){
      if(s.equipment){
        const eq=s.equipment.find(e=>e.id===eqId);
        if(eq){
          const old=eq.status;eq.status=newStatus;
          logAction(`[QR Scan] Asset ${eqId} status updated: ${old} → ${newStatus}`);pushAssetUpdate(eqId,newStatus);
          queueSync('status_update',{assetId:eqId,staffId:s.id,oldStatus:old,newStatus,source:'qr_scan',timestamp:new Date().toISOString()});
          buildAlertsPanel();buildStatusChart();updateDashStats();
          document.getElementById('scanResStatus').textContent=getStatusIcon(newStatus)+' '+newStatus;
          document.getElementById('quickStatusRow').style.display='none';
          showSyncToast(`✅ Status updated via QR scan: ${newStatus}`);
          return;
        }
      }
    }
  }
  alert('Asset not found in database. QR may be from an external source.');
}

function resumeQRScan(){
  document.getElementById('qrScanResult').style.display='none';
  document.getElementById('qrScanActions').style.display='none';
  document.getElementById('quickStatusRow').style.display='none';
  _scanBusy=false;
  if(html5QrScanner){
    try{html5QrScanner.resume();}catch(e){closeQRScanner();openQRScanner();}
  }else{
    openQRScanner();
  }
}

function closeQRScanner(){
  _scanBusy=false;
  clearTimeout(window._qrStartTimer);
  window._qrScanTarget='modal';
  if(html5QrScanner){
    try{html5QrScanner.stop().catch(()=>{});}catch(e){}
    html5QrScanner=null;
  }
  document.getElementById('qrScannerModal').classList.remove('open');
  document.getElementById('qr-reader').innerHTML='';
}

async function scanQRImage(file){
  if(!file)return;
  clearTimeout(window._qrStartTimer);
  _scanBusy=false;
  const err=document.getElementById('qrScanError');
  if(err){err.style.display='none';err.textContent='';}
  if(typeof Html5Qrcode==='undefined'){
    if(err){err.style.display='block';err.textContent='QR scanner library not loaded.';}
    return;
  }
  try{
    if(html5QrScanner){try{await html5QrScanner.stop();}catch(e){}html5QrScanner=null;}
    document.getElementById('qr-reader').innerHTML='';
    const scanner=createQrScanner('qr-reader');
    html5QrScanner=scanner;
    const text=await scanner.scanFile(file,true);
    await onQRScanSuccess(text);
  }catch(e){
    _scanBusy=false;
    if(err){err.style.display='block';err.textContent='No QR code found in that image. Try a clearer photo.';}
  }
}
function initDashboard(){
  updateHeroTime();setInterval(updateHeroTime,60000);
  buildAlertsPanel();buildStatusChart();updateDashStats();
  updateSyncBar();
}
function updateHeroTime(){
  const now=new Date();
  document.getElementById('heroTime').textContent=`⏱ ${now.toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric',year:'numeric'})} ${now.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'})}`;
}
function getAllEquipment(){
  const all=[];
  for(const [deptId,list]of Object.entries(staffData)){
    if(!Array.isArray(list))continue;
    list.forEach(s=>{if(s.equipment)s.equipment.forEach(eq=>all.push({...eq,owner:s.name,dept:deptId}));});
  }
  return all;
}
const DASH_BAD=['Damaged','Unserviceable','Lost','Missing'];
function dashIsBad(st){return DASH_BAD.includes(st);}
function dashEsc(t){return String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const DASH_OFFICE_COLORS={municipal:'#1e3a6e',mayors:'#2d5a8e',budget:'#b7791f',mpc:'#2d7d46',accounting:'#553c9a',treasury:'#c0392b',assessor:'#0d6e6e',civilreg:'#6b4c11',engineering:'#7b3f00',rhu:'#1a6b3a',gso:'#0d1b3e',bfp:'#9b1c1c',pnp:'#1e4d8c',motorpool:'#4a5568',ldrrmo:'#2c5f8a'};
function dashDeptName(deptId){
  const ad=(window.adminOfficeDepts||[]).find(d=>d.id===deptId);if(ad)return 'Admin Office · '+ad.name;
  for(const o of Object.values(officeData)){const d=(o.depts||[]).find(x=>x.id===deptId);if(d)return o.name+' · '+d.name;}
  return '';
}
function dashTally(deptIds){
  const t={sections:deptIds.length,staff:0,assets:0,svc:0,dmg:0,unsvc:0,lost:0,miss:0,none:0};
  deptIds.forEach(id=>{(staffData[id]||[]).forEach(p=>{t.staff++;(p.equipment||[]).forEach(e=>{t.assets++;
    if(e.status==='Serviceable')t.svc++;else if(e.status==='Damaged')t.dmg++;else if(e.status==='Unserviceable')t.unsvc++;
    else if(e.status==='Lost')t.lost++;else if(e.status==='Missing')t.miss++;else t.none++;});});});
  return t;
}
function dashOfficeRows(){
  const rows=[];const used=new Set();
  const adminIds=(window.adminOfficeDepts||[]).map(d=>d.id);adminIds.forEach(i=>used.add(i));
  rows.push({id:'municipal',name:'Admin Office',icon:'🏢',click:"showOffices('municipal')",...dashTally(adminIds)});
  Object.keys(officeData).forEach(oid=>{const o=officeData[oid];const ids=(o.depts||[]).map(d=>d.id);ids.forEach(i=>used.add(i));
    rows.push({id:oid,name:o.name,icon:o.icon,click:`showOfficeDept('${oid}')`,...dashTally(ids)});});
  const orphan=Object.keys(staffData).filter(k=>Array.isArray(staffData[k])&&!used.has(k));
  if(orphan.length){const t=dashTally(orphan);if(t.staff||t.assets)rows.push({id:'_other',name:'Unassigned / other',icon:'📁',click:'',...t});}
  return rows;
}
function renderDashOffices(){
  const grid=document.getElementById('dashOfficeGrid'),tbl=document.getElementById('dashOfficeTable');
  if(!grid&&!tbl)return;
  const rows=dashOfficeRows();
  const real=rows.filter(r=>r.id!=='_other');
  const offEl=document.getElementById('dashTotalOff');if(offEl)offEl.textContent=real.length;
  const sec=real.reduce((n,r)=>n+r.sections,0);
  const offSub=document.getElementById('dashTotalOffSub');if(offSub)offSub.textContent=sec+' sections / departments';
  const staffEl=document.getElementById('dashTotalStaff');if(staffEl)staffEl.textContent=rows.reduce((n,r)=>n+r.staff,0);
  if(grid)grid.innerHTML=real.map((r,i)=>{
    const col=DASH_OFFICE_COLORS[r.id]||avatarColors[i%avatarColors.length];
    const bad=r.dmg+r.unsvc+r.lost+r.miss;
    return `<div class="staff-card" onclick="${r.click}"><div class="staff-avatar" style="background:${col};font-size:1.6rem">${r.icon}</div><div class="s-name">${dashEsc(r.name)}</div><div class="s-pos">${r.sections} section${r.sections!==1?'s':''} · ${r.staff} staff</div><div class="s-pos">${r.assets} asset${r.assets!==1?'s':''}</div><div class="s-status">${bad?`<span style="color:var(--red);font-weight:700">⚠ ${bad} need attention</span>`:(r.assets?'<span class="status-dot dot-active"></span>All serviceable':'<span class="status-dot dot-active"></span>Active')}</div></div>`;}).join('');
  if(tbl){
    const tot=rows.reduce((a,r)=>{['staff','assets','svc','dmg','unsvc','lost','miss','none'].forEach(k=>a[k]+=r[k]);return a;},{staff:0,assets:0,svc:0,dmg:0,unsvc:0,lost:0,miss:0,none:0});
    const cell=(v,c)=>`<td style="text-align:center;${v&&c?`color:${c};font-weight:700`:'color:var(--text-light)'}">${v}</td>`;
    const tr=r=>`<tr${r.click?` onclick="${r.click}" style="cursor:pointer"`:''}><td>${r.icon} ${dashEsc(r.name)}</td><td style="text-align:center">${r.staff}</td><td style="text-align:center"><b>${r.assets}</b></td>${cell(r.svc,'#2d7d46')}${cell(r.dmg,'#b7791f')}${cell(r.unsvc,'#c0392b')}${cell(r.lost,'#8b0000')}${cell(r.miss,'#7a5c00')}${cell(r.none,'#718096')}</tr>`;
    tbl.innerHTML=`<table class="pf-table" style="min-width:640px"><thead><tr><th style="text-align:left">Office</th><th>Personnel</th><th>Assets</th><th>Serviceable</th><th>Damaged</th><th>Unserviceable</th><th>Lost</th><th>Missing</th><th>No status</th></tr></thead><tbody>${rows.map(tr).join('')}<tr style="font-weight:700;border-top:2px solid var(--border)"><td>Total</td><td style="text-align:center">${tot.staff}</td><td style="text-align:center">${tot.assets}</td><td style="text-align:center">${tot.svc}</td><td style="text-align:center">${tot.dmg}</td><td style="text-align:center">${tot.unsvc}</td><td style="text-align:center">${tot.lost}</td><td style="text-align:center">${tot.miss}</td><td style="text-align:center">${tot.none}</td></tr></tbody></table>`;
  }
}
const dashAssetState={q:'',st:'all',limit:25};
function dashAssetSet(k,v){dashAssetState[k]=v;dashAssetState.limit=25;renderDashAssets();}
function dashAssetMore(){dashAssetState.limit+=50;renderDashAssets();}
function renderDashAssets(){
  const el=document.getElementById('dashAssetTable');if(!el)return;
  const sev={Lost:0,Missing:1,Unserviceable:2,Damaged:3};
  const stKey=e=>['Serviceable','Damaged','Unserviceable','Lost','Missing'].includes(e.status)?e.status:'none';
  const all=getAllEquipment().map(e=>({...e,office:dashDeptName(e.dept)}));
  const q=dashAssetState.q.trim().toLowerCase(),st=dashAssetState.st;
  const rows=all.filter(e=>(st==='all'||stKey(e)===st)&&(!q||[e.id,e.name,e.brand,e.serial,e.owner,e.office].some(v=>String(v||'').toLowerCase().includes(q))))
    .sort((a,b)=>{const x=sev[a.status]??(a.status==='Serviceable'?9:8),y=sev[b.status]??(b.status==='Serviceable'?9:8);return x-y||String(a.office).localeCompare(b.office)||String(a.name).localeCompare(b.name);});
  const cnt=document.getElementById('dashAssetCount');if(cnt)cnt.textContent=rows.length===all.length?all.length:rows.length+' of '+all.length;
  if(!rows.length){el.innerHTML='<div class="empty-state"><div class="es-icon">🔎</div><p>No assets match your search.</p></div>';return;}
  const shown=rows.slice(0,dashAssetState.limit);
  el.innerHTML=`<table class="pf-table" style="min-width:820px"><thead><tr><th style="text-align:left">Asset ID</th><th style="text-align:left">Asset</th><th style="text-align:left">Brand / Model</th><th style="text-align:left">Serial No.</th><th style="text-align:left">Accountable</th><th style="text-align:left">Office · Section</th><th>Status</th></tr></thead><tbody>`+
    shown.map(e=>`<tr><td>${dashEsc(e.id)}</td><td><b>${dashEsc(e.name)}</b></td><td>${dashEsc(e.brand)}</td><td>${dashEsc(e.serial||'—')}</td><td>${dashEsc(e.owner)}</td><td>${dashEsc(e.office||'—')}</td><td style="text-align:center"><span class="eq-status ${e.status?getStatusClass(e.status):''}" style="font-size:0.62rem${e.status?'':';background:#a0aec0;color:#fff'}">${dashEsc(e.status||'No status')}</span></td></tr>`).join('')+
    `</tbody></table>`+(rows.length>shown.length?`<div style="text-align:center;padding:10px"><button class="pf-btn primary" onclick="dashAssetMore()">Show more (${rows.length-shown.length} remaining)</button></div>`:'');
}
function updateDashStats(){
  const allEq=getAllEquipment();
  const n=st=>allEq.filter(e=>e.status===st).length;
  const svc=n('Serviceable'),unsvc=n('Unserviceable'),dmg=n('Damaged'),lost=n('Lost'),miss=n('Missing');
  const none=allEq.length-svc-unsvc-dmg-lost-miss;
  document.getElementById('dashTotalEq').textContent=allEq.length;
  document.getElementById('dashRepairEq').textContent=dmg+unsvc+lost+miss;
  const sub=document.getElementById('dashRepairSub');
  if(sub)sub.textContent=(dmg+unsvc+lost+miss)?`${dmg} damaged · ${unsvc} unserviceable · ${lost+miss} lost/missing`:'All assets accounted for';
  const ids=['slcSvc','slcUnsvc','slcDmg','slcLost','slcMiss','slcNone'];
  const vals=[svc,unsvc,dmg,lost,miss,none];
  ids.forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=vals[i];});
  const w=document.getElementById('slcNoneWrap');if(w)w.style.display=none>0?'':'none';
  try{renderDashOffices();}catch(e){console.error(e);}
  try{renderDashAssets();}catch(e){console.error(e);}
}
function buildAlertsPanel(){
  const alerts=getAllEquipment().filter(e=>dashIsBad(e.status));
  const bell=document.getElementById('alertsBadge');if(bell)bell.textContent=alerts.length;
  try{renderDashRecords();}catch(e){console.error(e);}
}
function dashStore(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(e){return {};}}
function pushAssetUpdate(eqId,status){
  try{const a=JSON.parse(localStorage.getItem('mets_updates')||'[]');a.unshift({eqId,status,at:new Date().toISOString()});localStorage.setItem('mets_updates',JSON.stringify(a.slice(0,50)));}catch(e){}
}
function dashOpenRecords(tab){showGSORecords();switchGSOTab(tab,document.getElementById('gsoTab-'+tab));}
function renderDashRecords(){
  const tiles=document.getElementById('dashRecordTiles'),list=document.getElementById('dashRecentUpdates');
  if(!tiles&&!list)return;
  const tr=dashStore('mets_transfers'),rp=dashStore('mets_repairs'),bw=dashStore('mets_borrows');
  const cnt=o=>Object.values(o).reduce((n,a)=>n+(Array.isArray(a)?a.length:0),0);
  const borrows=Object.entries(bw).flatMap(([id,a])=>(Array.isArray(a)?a:[]).map(b=>({...b,eqId:id})));
  const overdue=borrows.filter(b=>getBorrowStatus(b)==='Overdue').length;
  const out=borrows.filter(b=>!b.returnedDate).length;
  const tile=(icon,label,n,sub,col,tab)=>`<div onclick="dashOpenRecords('${tab}')" style="cursor:pointer;border:1px solid var(--border);border-left:3px solid ${col};border-radius:10px;padding:10px 12px"><div style="font-size:1.35rem;font-weight:800;color:${col}">${n}</div><div style="font-size:0.74rem;font-weight:700;color:var(--text-dark)">${icon} ${label}</div><div class="pf-sub">${sub}</div></div>`;
  if(tiles)tiles.innerHTML=
    tile('🔄','Transfers',cnt(tr),'Total records','#2c5f8a','transfers')+
    tile('🔧','Repairs',cnt(rp),'Total records','#b7791f','repairs')+
    tile('📤','Borrow',borrows.length,overdue?`${overdue} overdue`:(out?`${out} not yet returned`:'None outstanding'),overdue?'#c0392b':'#2d7d46','borrows');
  if(!list)return;
  const eqMap={};getAllEquipment().forEach(e=>eqMap[e.id]=e);
  const ev=[];
  try{JSON.parse(localStorage.getItem('mets_updates')||'[]').forEach(u=>ev.push({id:u.eqId,t:u.at,line:'Status: '+u.status,st:u.status}));}catch(e){}
  Object.entries(rp).forEach(([id,a])=>(Array.isArray(a)?a:[]).forEach(r=>ev.push({id,t:r.recordedAt,line:'Repair: '+(r.type||'Repair')+(r.status?' · '+r.status:'')})));
  Object.entries(tr).forEach(([id,a])=>(Array.isArray(a)?a:[]).forEach(r=>ev.push({id,t:r.recordedAt,line:'Transferred to '+(r.toOffice||r.to||'another office')})));
  borrows.forEach(b=>ev.push({id:b.eqId,t:b.recordedAt,line:'Borrowed by '+(b.borrower||'—')+(getBorrowStatus(b)==='Overdue'?' (overdue)':b.returnedDate?' (returned)':'')}));
  ev.sort((x,y)=>new Date(y.t||0)-new Date(x.t||0));
  const COL={Serviceable:'#2d7d46',Damaged:'#b7791f',Unserviceable:'#c0392b',Lost:'#8b0000',Missing:'#7a5c00'};
  if(!ev.length){list.innerHTML='<div class="pf-sub" style="padding:8px 0">No updates yet. Status changes, repairs, transfers and borrow slips will appear here.</div>';return;}
  list.innerHTML=ev.slice(0,5).map(e=>{
    const a=eqMap[e.id],name=a?a.name:e.id,office=a?(dashDeptName(a.dept).split(' · ')[0]):'';
    const d=e.t?new Date(e.t).toLocaleDateString('en-PH',{month:'short',day:'numeric'}):'';
    return `<div style="border-left:3px solid ${COL[e.st]||'#2c5f8a'};padding:6px 10px;margin-bottom:8px;background:var(--bg);border-radius:0 8px 8px 0"><div style="font-size:0.8rem;font-weight:700;color:var(--text-dark)">${dashEsc(name)}${office?' — '+dashEsc(office):''}</div><div class="pf-sub">${dashEsc(e.line)}${d?' · '+d:''}</div></div>`;}).join('');
}
function openAlertsModal(){
  const allEq=getAllEquipment();
  const alerts=allEq.filter(e=>dashIsBad(e.status));
  const c=document.getElementById('alertsModalContent');
  if(!alerts.length){c.innerHTML='<div class="empty-state"><div class="es-icon">✅</div><p>No alerts</p></div>';}
  else c.innerHTML=alerts.map(a=>`
    <div class="alert-item ${a.status==='Damaged'?'warn':'danger'}" style="margin-bottom:6px">
      <span class="ai-icon">${getStatusIcon(a.status)}</span>
      <div class="ai-text"><strong>${a.name}</strong> (${a.id})<br><span style="font-size:0.68rem">${a.brand} · S/N: ${a.serial||a.id} · Owner: ${a.owner}${dashDeptName(a.dept)?' · '+dashEsc(dashDeptName(a.dept)):''}</span></div>
      <span class="eq-status ${getStatusClass(a.status)}" style="font-size:0.62rem">${a.status}</span>
    </div>`).join('');
  document.getElementById('alertsModal').classList.add('open');
}
function buildStatusChart(){
  const allEq=getAllEquipment();
  const serviceable=allEq.filter(e=>e.status==='Serviceable').length;
  const damaged=allEq.filter(e=>e.status==='Damaged').length;
  const unserviceable=allEq.filter(e=>e.status==='Unserviceable').length;
  const lost=allEq.filter(e=>e.status==='Lost').length;
  const missing=allEq.filter(e=>e.status==='Missing').length;
  const noStatus=allEq.length-serviceable-damaged-unserviceable-lost-missing;
  const isDark=document.documentElement.getAttribute('data-theme')==='dark';
  const ctx=document.getElementById('statusChart');
  if(!ctx)return;
  if(statusChartInstance)statusChartInstance.destroy();
  statusChartInstance=new Chart(ctx,{
    type:'doughnut',
    data:{labels:['Serviceable','Damaged','Unserviceable','Lost','Missing'].concat(noStatus>0?['No status']:[]),
      datasets:[{data:[serviceable,damaged,unserviceable,lost,missing].concat(noStatus>0?[noStatus]:[]),
        backgroundColor:['#2d7d46','#b7791f','#c0392b','#8b0000','#7a5c00'].concat(noStatus>0?['#a0aec0']:[]),
        borderWidth:2,borderColor:isDark?'#1e2540':'#ffffff'}]},
    options:{responsive:true,plugins:{legend:{position:'bottom',labels:{font:{size:11},color:isDark?'#a0aec0':'#4a5568'}},
      tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${ctx.raw} (${allEq.length?Math.round(ctx.raw/allEq.length*100):0}%)`}}},cutout:'65%'}
  });
}

// ══════════════════════════════════════════════════════════
// OFFICE / DEPT NAVIGATION
// ══════════════════════════════════════════════════════════
// Admin Office depts stored separately so they can be managed
if(!window.adminOfficeDepts){
  window.adminOfficeDepts=[
    {id:'hr',name:'Human Resources (HR)',icon:'👥',desc:'Personnel management, recruitment & welfare',color:'#1e3a6e',count:3},
    {id:'records',name:'Records Management',icon:'📁',desc:'Document control and archiving',color:'#553c9a',count:2},
    {id:'procurement',name:'Procurement',icon:'🛒',desc:'Bidding, supplies & contracts',color:'#b7791f',count:2},
    {id:'it',name:'IT Section',icon:'💻',desc:'Systems & technology support',color:'#0d6e6e',count:2},
    {id:'liaison',name:'Liaison Office',icon:'🤝',desc:'Inter-agency coordination',color:'#6b4c11',count:2}
  ];
}
function renderMunicipalView(){
  const depts=window.adminOfficeDepts;
  document.getElementById('municipal-list-content').innerHTML=depts.map(d=>`
    <div class="staff-card" style="position:relative">
      <div onclick="showStaff('${d.id}')" style="cursor:pointer">
        <div class="staff-avatar" style="background:${d.color||'#1e3a6e'};font-size:1.5rem">${d.icon}</div>
        <div class="s-name">${d.name}</div>
        <div class="s-pos">${d.desc}</div>
        <div class="s-status"><span style="background:#2d7d46;color:#fff;border-radius:10px;padding:1px 8px;font-size:0.65rem;font-weight:700">${(staffData[d.id]||[]).length} staff</span></div>
      </div>
      <div style="display:flex;gap:4px;justify-content:center;margin-top:8px;padding-top:6px;border-top:1px solid var(--border)">
        <button class="action-btn edit" onclick="event.stopPropagation();openEditAdminDeptModal('${d.id}')">✏️ Edit</button>
        <button class="action-btn delete" onclick="event.stopPropagation();deleteAdminDept('${d.id}')">🗑 Delete</button>
      </div>
    </div>`).join('');
}
function showOffices(type){
  navStack=[{label:'Dashboard',fn:goHome},{label:'Admin Office',fn:()=>showOffices(type)}];
  setBreadcrumb([{label:'Dashboard',fn:'goHome()'},{label:'Admin Office'}]);
  renderMunicipalView();
  showView('municipal');
}
function showOfficeDept(officeId){
  const office=officeData[officeId];if(!office)return;
  currentOfficeId=officeId;
  navStack=[{label:'Dashboard',fn:goHome},{label:office.name,fn:()=>showOfficeDept(officeId)}];
  document.getElementById('dept-title').textContent=`${office.icon} ${office.name}`;
  document.getElementById('dept-subtitle').textContent='Select a department to view personnel';
  document.getElementById('dept-list-content').innerHTML=office.depts.map(d=>`
    <div class="staff-card" style="position:relative">
      <div onclick="showStaff('${d.id}')" style="cursor:pointer">
        <div class="staff-avatar" style="background:${d.color||'#1e3a6e'};font-size:1.5rem">${d.icon}</div>
        <div class="s-name">${d.name}</div>
        <div class="s-pos">${d.desc}</div>
        <div class="s-status"><span style="background:#2d7d46;color:#fff;border-radius:10px;padding:1px 8px;font-size:0.65rem;font-weight:700">${(staffData[d.id]||[]).length} staff</span></div>
      </div>
      <div style="display:flex;gap:4px;justify-content:center;margin-top:8px;padding-top:6px;border-top:1px solid var(--border)">
        <button class="action-btn edit" onclick="event.stopPropagation();openEditOfficeModal('${officeId}','${d.id}')">✏️ Edit</button>
        <button class="action-btn delete" onclick="event.stopPropagation();deleteOfficeSection('${officeId}','${d.id}')">🗑 Delete</button>
      </div>
    </div>`).join('');
  setBreadcrumb([{label:'Dashboard',fn:'goHome()'},{label:office.name}]);
  showView('dept');
  logAction(`Viewed ${office.name} departments`);
}

// ══════════════════════════════════════════════════════════
// STAFF
// ══════════════════════════════════════════════════════════
function showStaff(deptId){
  currentDeptId=deptId;
  const list=staffData[deptId]||[];
  currentDeptStaff=list;
  let deptName=deptId;
  for(const[oid,odata]of Object.entries(officeData)){const f=odata.depts.find(d=>d.id===deptId);if(f){deptName=f.name;break;}}
  navStack=[{label:'Dashboard',fn:goHome},{label:deptName,fn:()=>showStaff(deptId)}];
  document.getElementById('staff-title').textContent=`👥 ${deptName}`;
  document.getElementById('staff-subtitle').textContent=`${list.length} personnel — click to view profile`;
  document.getElementById('staff-grid-content').innerHTML=list.map(s=>{
    const photo=photoStore[`avatar_${s.id}`];
    return`<div class="staff-card" style="position:relative">
      <div onclick="showProfile(getStaff('${deptId}','${s.id}'))" style="cursor:pointer">
        <div class="staff-avatar" style="background:${s.color}">${photo?`<img src="${photo}" alt="${s.initials}">`:`<span>${s.initials}</span>`}</div>
        <div class="s-name">${s.name}</div><div class="s-pos">${s.pos}</div>
        <div class="s-status"><span class="status-dot ${s.status==='Active'?'dot-active':'dot-leave'}"></span>${s.status}</div>
      </div>
      <div style="display:flex;gap:4px;justify-content:center;margin-top:8px;padding-top:6px;border-top:1px solid var(--border)">
        <button class="action-btn edit" onclick="event.stopPropagation();openEditPersonnelModal('${deptId}','${s.id}')">✏️ Edit</button>
        <button class="action-btn delete" onclick="event.stopPropagation();deletePersonnel('${deptId}','${s.id}')">🗑 Delete</button>
      </div>
    </div>`;
  }).join('');
  setBreadcrumb([{label:'Dashboard',fn:'goHome()'},{label:deptName}]);
  showView('staff');
  logAction(`Viewed staff list: ${deptName}`);
}
function getStaff(deptId,staffId){return(staffData[deptId]||[]).find(s=>s.id===staffId);}

// ══════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════
function showProfile(staff){
  if(!staff)return;
  currentStaff=staff;
  navStack.push({label:staff.name,fn:()=>showProfile(staff)});
  const photo=photoStore[`avatar_${staff.id}`];
  const eqRows=staff.equipment.map(eq=>{
    const eqPhoto=photoStore[`eq_${eq.id}`];
    const loc=eq.location||'Not Set';
    const acquiredDate=eq.acquiredDate||'N/A';
    const amount=eq.amount||'';
    const isPPE = eq.amount && parseFloat(String(eq.amount).replace(/,/g,''))>=50000;
    const category=eq.category||(isPPE?'PPE':'Semi-Expendable');
    const sClass=eq.status==='Serviceable'?'eq-usable':eq.status==='Unserviceable'?'eq-unusable':eq.status==='Damaged'?'eq-repair':eq.status==='Lost'?'eq-lost':'eq-missing';
    const sIcon=eq.status==='Serviceable'?'●':eq.status==='Unserviceable'?'✕':eq.status==='Damaged'?'⚠':eq.status==='Lost'?'◉':'?';
    return`<tr>
      <td><span class="eq-id-cell">${eq.id}</span></td>
      <td><div class="eq-name-cell">${eq.name}</div></td>
      <td><div class="eq-sub-cell" style="font-size:0.75rem;color:rgba(168,184,212,0.7)">${eq.brand}</div></td>
      <td><span class="eq-serial-cell">${eq.serial}</span></td>
      <td style="font-size:0.72rem;color:rgba(168,184,212,0.65);white-space:nowrap">${acquiredDate}${window.pfProfileChip?pfProfileChip(eq):''}</td>
      <td><span class="eq-amount-cell">${formatAmt(amount)||'—'}</span></td>
      <td><span class="eq-category-pill ${isPPE?'ppe':''}">${category}</span></td>
      <td style="font-size:0.72rem;color:rgba(168,184,212,0.65)">${loc}</td>
      <td><span class="eq-status ${sClass}">${sIcon} ${eq.status}</span></td>
      <td><div class="eq-photo-cell">
        ${eqPhoto?`<img class="photo-thumb" src="${eqPhoto}" ondblclick="openPhotoLightbox('${eq.id}')" title="Double-click to expand photo" style="cursor:zoom-in;">`:''}
        <label class="photo-upload-label" title="Attach photo">📷<input class="photo-upload-input" type="file" accept="image/*" onchange="uploadEqPhoto('${eq.id}',this)"></label>
      </div></td>
      <td><button class="eq-col-btn qr" onclick="openQRModal('${eq.id}','${eq.name.replace(/'/g,"&#39;")}','${staff.name.replace(/'/g,"&#39;")}','${eq.serial}','${staff.id}')">📱 QR</button></td>
      <td><button class="eq-col-btn chain" onclick="openChainModal('${eq.id}','${eq.name.replace(/'/g,"&#39;")}','${staff.name.replace(/'/g,"&#39;")}')">🔗 Transfer</button></td>
      <td><button class="eq-col-btn repair" onclick="openRepairModal('${eq.id}','${eq.name.replace(/'/g,"&#39;")}')">🔧 Repairs</button></td>
      <td><button class="eq-col-btn borrow" onclick="openBorrowModal('${eq.id}','${eq.name.replace(/'/g,"&#39;")}','${staff.name.replace(/'/g,"&#39;")}')">📤 Preview</button></td>
      ${getCustomColCells(staff.id, eq)}
      ${(function(){const gc=window.getGlobalColStore?window.getGlobalColStore('equipment'):[];return gc.map(c=>`<td style="font-size:0.75rem;color:var(--text-dark);background:rgba(201,168,76,0.04)">—</td>`).join('');})()}
      <td><div class="eq-actions-row">
        <button class="eq-icon-btn edit" title="Edit"   onclick="openEditEquipmentModal('${staff.id}','${eq.id}')">✏️</button>
        <button class="eq-icon-btn del"  title="Delete" onclick="deleteEquipment('${staff.id}','${eq.id}')">🗑</button>
      </div></td>
    </tr>`;
  }).join('');

  document.getElementById('profile-content').innerHTML=`
    <div class="profile-card">
      <div class="profile-card-header">
        <div class="profile-big-avatar" style="background:${staff.color}">${photo?`<img src="${photo}" alt="${staff.initials}">`:`<span>${staff.initials}</span>`}</div>
        <div class="profile-name">${staff.name}</div>
        <div class="profile-pos">${staff.pos}</div>
        <div class="profile-dept"><span class="status-dot ${staff.status==='Active'?'dot-active':'dot-leave'}" style="display:inline-block"></span>${staff.status}</div>
      </div>
      <div class="profile-body">
        <div class="pinfo-row"><span class="pir-icon">🎂</span><div class="pir-text"><div class="pir-label">Age</div><div class="pir-val">${staff.age} years old</div></div></div>
        <div class="pinfo-row"><span class="pir-icon">📍</span><div class="pir-text"><div class="pir-label">Address</div><div class="pir-val">${staff.address}</div></div></div>
        <div class="pinfo-row"><span class="pir-icon">📞</span><div class="pir-text"><div class="pir-label">Contact</div><div class="pir-val">${staff.contact}</div></div></div>
        <div class="pinfo-row"><span class="pir-icon">⚧</span><div class="pir-text"><div class="pir-label">Gender</div><div class="pir-val">${staff.gender==='F'?'Female':'Male'}</div></div></div>
        <div class="pinfo-row"><span class="pir-icon">📌</span><div class="pir-text"><div class="pir-label">Employment Status</div><div class="pir-val">${staff.status}</div></div></div>
        <div class="yos-badge"><div class="y-num">${staff.yos}</div><div class="y-label">Years of Service</div></div>
        <div class="profile-actions">
          <label class="pact-btn" style="cursor:pointer" title="Upload profile photo">📷 Photo<input type="file" accept="image/*" style="display:none" onchange="uploadAvatarPhoto('${staff.id}',this)"></label>
          <button class="pact-btn" onclick="openEditPersonalModal('${staff.id}')" style="background:rgba(201,168,76,0.12);color:var(--gold);border:1px solid var(--gold-dim)">✏️ Edit Info</button>
        </div>
      </div>
    </div>
    <div>
      <div class="equip-section-title"><span style="display:flex;align-items:center;gap:7px">🖥️ Assigned Equipment <span class="tag tag-blue" id="eqCountTag">${staff.equipment.length} items</span></span>
        <div style="display:flex;gap:6px;flex-shrink:0;align-items:center;">
          <button onclick="openAddEquipmentModal('${staff.id}')" style="display:inline-flex;align-items:center;gap:5px;padding:5px 13px;border-radius:7px;border:1.5px solid var(--gold-dim);background:rgba(201,168,76,0.08);color:var(--gold);font-family:'Source Sans 3',sans-serif;font-size:0.73rem;font-weight:600;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(201,168,76,0.2)'" onmouseout="this.style.background='rgba(201,168,76,0.08)'">＋ Add Equipment</button>
        </div>
      </div>
      <div class="equip-table-wrap">
        <table class="equip-table">
          <thead><tr>
            <th>Item ID</th>
            <th>Equipment</th>
            <th>Brand/Model</th>
            <th>Serial No.</th>
            <th>Acquired</th>
            <th>Amount (₱)</th>
            <th>Category</th>
            <th>Location</th>
            <th>Status</th>
            <th>Photo</th>
            <th>QR</th>
            <th>Transfer</th>
            <th>Repairs</th>
            <th>Borrow</th>
            ${getCustomColHeaders(staff.id)}
            ${(function(){const gc=window.getGlobalColStore?window.getGlobalColStore('equipment'):[];return gc.map(c=>`<th style="white-space:nowrap;background:rgba(201,168,76,0.07)">${c.label}</th>`).join('');})()}
            <th>Actions</th>
          </tr></thead>
          <tbody>${eqRows||`<tr><td colspan="${14+getCustomColCount(staff.id)+(window.getGlobalColStore?window.getGlobalColStore('equipment').length:0)}" style="text-align:center;color:rgba(168,184,212,0.4);padding:32px;font-size:0.8rem">No equipment assigned</td></tr>`}</tbody>
        </table>
      </div>
      <div class="eq-legend">
        <span class="eq-legend-chip eq-usable">● Serviceable <b id="profileSvcCount" style="margin-left:3px">${(staff.equipment||[]).filter(e=>e.status==='Serviceable').length}</b></span>
        <span class="eq-legend-chip eq-unusable">✕ Unserviceable <b id="profileUnsvcCount" style="margin-left:3px">${(staff.equipment||[]).filter(e=>e.status==='Unserviceable').length}</b></span>
        <span class="eq-legend-chip eq-repair">⚠ Damaged <b id="profileDmgCount" style="margin-left:3px">${(staff.equipment||[]).filter(e=>e.status==='Damaged').length}</b></span>
        <span class="eq-legend-chip eq-lost">◉ Lost <b id="profileLostCount" style="margin-left:3px">${(staff.equipment||[]).filter(e=>e.status==='Lost').length}</b></span>
        <span class="eq-legend-chip eq-missing">? Missing <b id="profileMissCount" style="margin-left:3px">${(staff.equipment||[]).filter(e=>e.status==='Missing').length}</b></span>
      </div>
    </div>`;

  setBreadcrumb(navStack.map((n,i)=>({label:n.label,fn:i<navStack.length-1?`goToNav(${i})`:undefined})));
  showView('profile');
  logAction(`Viewed profile: ${staff.name}`);
}

// ══════════════════════════════════════════════════════════
// CUSTOM COLUMNS
// ══════════════════════════════════════════════════════════
// Storage: localStorage key 'mets_custom_cols'
// Structure: { [staffId]: { colDefs: [{key,label}], rows: {[eqId]: {[key]: value}} } }
function getCustomColStore() {
  try { return JSON.parse(localStorage.getItem('mets_custom_cols')||'{}'); } catch(e){ return {}; }
}
function saveCustomColStore(store) {
  try { localStorage.setItem('mets_custom_cols', JSON.stringify(store)); } catch(e){}
}
function getCustomColDefs(staffId) {
  const store = getCustomColStore();
  return (store[staffId]||{}).colDefs||[];
}
function getCustomColCount(staffId) {
  return getCustomColDefs(staffId).length;
}
function getCustomColHeaders(staffId) {
  return getCustomColDefs(staffId).map(c=>`<th style="white-space:nowrap">${esc(c.label)}</th>`).join('');
}
function getCustomColCells(staffId, eq) {
  const defs = getCustomColDefs(staffId);
  if (!defs.length) return '';
  const store = getCustomColStore();
  const rows = (store[staffId]||{}).rows||{};
  const eqVals = rows[eq.id]||{};
  return defs.map(c=>`<td style="font-size:0.75rem;color:var(--text-dark)">${esc(eqVals[c.key]||'—')}</td>`).join('');
}
let _addColMode = null; // 'row' or 'all'
function openAddColModal(staffId, eqId) {
  _addColMode = eqId ? 'row' : 'all';
  document.getElementById('addColStaffId').value = staffId||'';
  document.getElementById('addColEqId').value = eqId||'';
  const sub = document.getElementById('addColModalSub');
  const valRow = document.getElementById('addColValueRow');
  const allNote = document.getElementById('addColAllNote');
  if (_addColMode === 'all') {
    sub.textContent = 'Add a new column to all equipment rows in this table';
    valRow.style.display = 'none';
    allNote.style.display = 'block';
  } else {
    sub.textContent = 'Add a custom column to this equipment row';
    valRow.style.display = '';
    allNote.style.display = 'none';
  }
  document.getElementById('addColName').value = '';
  document.getElementById('addColValue').value = '';
  // Show existing columns
  const defs = getCustomColDefs(staffId);
  const wrap = document.getElementById('addColExistingWrap');
  const list = document.getElementById('addColExistingList');
  if (defs.length) {
    wrap.style.display = '';
    list.innerHTML = defs.map(c=>`
      <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:5px 10px;">
        <span style="font-size:0.78rem;color:var(--text-dark);font-weight:600">${esc(c.label)}</span>
        <button onclick="deleteCustomCol('${staffId}','${c.key}')" style="background:var(--red-light);color:var(--red);border:none;border-radius:5px;padding:2px 8px;font-size:0.7rem;cursor:pointer;font-weight:700">✕ Remove</button>
      </div>`).join('');
  } else {
    wrap.style.display = 'none';
  }
  document.getElementById('addColModal').classList.add('open');
  setTimeout(()=>document.getElementById('addColName').focus(), 200);
}
function closeAddColModal() {
  document.getElementById('addColModal').classList.remove('open');
}
function saveAddCol() {
  const staffId = document.getElementById('addColStaffId').value;
  const eqId    = document.getElementById('addColEqId').value;
  const label   = document.getElementById('addColName').value.trim();
  const value   = document.getElementById('addColValue').value.trim();
  if (!label) { document.getElementById('addColName').focus(); return; }
  const key = 'cc_' + label.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'') + '_' + Date.now();
  const store = getCustomColStore();
  if (!store[staffId]) store[staffId] = {colDefs:[], rows:{}};
  // Add col def if not already present with same label
  const exists = store[staffId].colDefs.find(c=>c.label.toLowerCase()===label.toLowerCase());
  const colKey = exists ? exists.key : key;
  if (!exists) store[staffId].colDefs.push({key:colKey, label});
  // Set value on specific row if in row mode
  if (_addColMode === 'row' && eqId && value) {
    if (!store[staffId].rows) store[staffId].rows = {};
    if (!store[staffId].rows[eqId]) store[staffId].rows[eqId] = {};
    store[staffId].rows[eqId][colKey] = value;
  }
  saveCustomColStore(store);
  logAction(`Custom column "${label}" added for staff ${staffId}`);
  closeAddColModal();
  if (currentStaff) showProfile(currentStaff);
  if (typeof renderSettingsColLists === 'function') renderSettingsColLists();
}
function deleteCustomCol(staffId, colKey) {
  const store = getCustomColStore();
  if (!store[staffId]) return;
  store[staffId].colDefs = (store[staffId].colDefs||[]).filter(c=>c.key!==colKey);
  const rows = store[staffId].rows||{};
  Object.values(rows).forEach(r=>{ delete r[colKey]; });
  saveCustomColStore(store);
  logAction(`Custom column removed for staff ${staffId}`);
  closeAddColModal();
  // Re-render the list in the modal instead of closing it
  openDelColModal(staffId);
  if (currentStaff) showProfile(currentStaff);
  showSyncToast('🗑 Column deleted');
  if (typeof renderSettingsColLists === 'function') renderSettingsColLists();
  if (typeof renderSettingsColLists === 'function') renderSettingsColLists();
}
// Default equipment table columns (key matches data-col attr on th/td)
const EQ_DEFAULT_COLS = [
  { key:'col_itemid',    label:'Item ID',      deletable: false },
  { key:'col_name',      label:'Equipment',    deletable: true  },
  { key:'col_brand',     label:'Brand/Model',  deletable: true  },
  { key:'col_serial',    label:'Serial No.',   deletable: true  },
  { key:'col_acquired',  label:'Acquired',     deletable: true  },
  { key:'col_amount',    label:'Amount (₱)',   deletable: true  },
  { key:'col_category',  label:'Category',     deletable: true  },
  { key:'col_location',  label:'Location',     deletable: true  },
  { key:'col_status',    label:'Status',       deletable: true  },
  { key:'col_photo',     label:'Photo',        deletable: true  },
  { key:'col_qr',        label:'QR',           deletable: true  },
  { key:'col_chain',     label:'Transfer',     deletable: true  },
  { key:'col_repairs',   label:'Repairs',      deletable: true  },
  { key:'col_borrow',    label:'Borrow',       deletable: true  },
  { key:'col_actions',   label:'Actions',      deletable: false },
];
function getHiddenCols() {
  try { return JSON.parse(localStorage.getItem('mets_hidden_cols') || '[]'); } catch(e){ return []; }
}
function saveHiddenCols(arr) {
  try { localStorage.setItem('mets_hidden_cols', JSON.stringify(arr)); } catch(e){}
}
function hideDefaultCol(key) {
  const h = getHiddenCols();
  if (!h.includes(key)) { h.push(key); saveHiddenCols(h); }
}
function restoreDefaultCol(key) {
  saveHiddenCols(getHiddenCols().filter(k=>k!==key));
}

function openDelColModal(staffId) {
  document.getElementById('delColStaffId').value = staffId||'';
  const list  = document.getElementById('delColList');
  const empty = document.getElementById('delColEmpty');
  empty.style.display = 'none';

  const hidden     = getHiddenCols();
  const customDefs = getCustomColDefs(staffId);

  // Build rows for every default col
  const defaultRows = EQ_DEFAULT_COLS.map(c => {
    const isHidden = hidden.includes(c.key);
    if (!c.deletable) {
      return `<div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 14px;gap:10px;opacity:0.45;">
        <div>
          <div style="font-size:0.82rem;font-weight:700;color:var(--text-dark);">${esc(c.label)}</div>
          <div style="font-size:0.67rem;color:var(--text-light);margin-top:1px;">Required · cannot be removed</div>
        </div>
        <span style="font-size:0.68rem;color:var(--text-light);border:1px solid var(--border);border-radius:5px;padding:3px 9px;">🔒 Fixed</span>
      </div>`;
    }
    return `<div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg);border:1px solid ${isHidden?'var(--red)':'var(--border)'};border-radius:8px;padding:9px 14px;gap:10px;">
      <div>
        <div style="font-size:0.82rem;font-weight:700;color:${isHidden?'var(--red)':'var(--text-dark)'};">${esc(c.label)} ${isHidden?'<span style="font-size:0.65rem;background:var(--red-light);color:var(--red);border-radius:4px;padding:1px 6px;font-weight:600;">hidden</span>':''}</div>
        <div style="font-size:0.67rem;color:var(--text-light);margin-top:1px;">Default column</div>
      </div>
      <button data-defkey="${c.key}" data-deflabel="${esc(c.label)}" data-ishidden="${isHidden}"
        class="action-btn ${isHidden?'add':'delete'} del-default-col-btn"
        style="padding:5px 12px;font-size:0.7rem;flex-shrink:0;">
        ${isHidden?'👁 Restore':'🗑 Hide'}
      </button>
    </div>`;
  });

  // Build rows for custom cols
  const customRows = customDefs.map(c =>
    `<div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 14px;gap:10px;">
      <div>
        <div style="font-size:0.82rem;font-weight:700;color:var(--text-dark);">${esc(c.label)}</div>
        <div style="font-size:0.67rem;color:var(--gold);margin-top:1px;">Custom column · all rows</div>
      </div>
      <button data-staffid="${staffId}" data-colkey="${c.key}" data-collabel="${esc(c.label)}" class="action-btn delete del-col-confirm-btn" style="padding:5px 12px;font-size:0.7rem;flex-shrink:0;">🗑 Delete</button>
    </div>`
  );

  list.innerHTML =
    (defaultRows.length ? `<div style="font-size:0.68rem;color:var(--text-light);text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:5px;">Default Columns</div>` + defaultRows.join('') : '') +
    (customRows.length  ? `<div style="font-size:0.68rem;color:var(--gold);text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin:10px 0 5px;">Custom Columns</div>` + customRows.join('') : '');

  // Listeners for default hide/restore
  list.querySelectorAll('.del-default-col-btn').forEach(btn => {
    btn.addEventListener('click', function(){
      const key    = this.dataset.defkey;
      const hidden = this.dataset.ishidden === 'true';
      if (hidden) { restoreDefaultCol(key); } else { hideDefaultCol(key); }
      applyHiddenCols();
      if (currentStaff) showProfile(currentStaff);
      openDelColModal(staffId); // refresh list
    });
  });

  // Listeners for custom delete
  list.querySelectorAll('.del-col-confirm-btn').forEach(btn=>{
    btn.addEventListener('click', function(){
      openDelColConfirm(this.dataset.staffid, this.dataset.colkey, this.dataset.collabel);
    });
  });

  document.getElementById('delColModal').classList.add('open');
}

// Apply hidden cols to the currently rendered table via CSS
function applyHiddenCols() {
  const hidden = getHiddenCols();
  // Remove old style
  let st = document.getElementById('mets-hidden-cols-style');
  if (!st) { st = document.createElement('style'); st.id='mets-hidden-cols-style'; document.head.appendChild(st); }
  const colIndexMap = { col_itemid:1, col_name:2, col_brand:3, col_serial:4, col_acquired:5, col_amount:6, col_category:7, col_location:8, col_status:9, col_photo:10, col_qr:11, col_chain:12, col_repairs:13, col_borrow:14 };
  const rules = hidden.map(k => {
    const i = colIndexMap[k];
    return i ? `.equip-table th:nth-child(${i}),.equip-table td:nth-child(${i}){display:none!important;}` : '';
  }).join('\n');
  st.textContent = rules;
}

// Run on load
document.addEventListener('DOMContentLoaded', applyHiddenCols);
setTimeout(applyHiddenCols, 400);
function closeDelColModal() {
  document.getElementById('delColModal').classList.remove('open');
  if (typeof applyHiddenCols === 'function') applyHiddenCols();
}
function openDelColConfirm(staffId, colKey, colLabel) {
  document.getElementById('delColConfirmLabel').textContent = colLabel;
  document.getElementById('delColConfirmModal').dataset.staffId = staffId;
  document.getElementById('delColConfirmModal').dataset.colKey = colKey;
  document.getElementById('delColConfirmModal').classList.add('open');
}
function closeDelColConfirm() {
  document.getElementById('delColConfirmModal').classList.remove('open');
}
function confirmDeleteCustomCol() {
  const modal = document.getElementById('delColConfirmModal');
  const staffId = modal.dataset.staffId;
  const colKey  = modal.dataset.colKey;
  closeDelColConfirm();
  deleteCustomCol(staffId, colKey);
}

// ══════════════════════════════════════════════════════════
// PHOTO UPLOAD
// ══════════════════════════════════════════════════════════
function uploadEqPhoto(eqId,input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    photoStore[`eq_${eqId}`]=e.target.result;
    localStorage.setItem('mets_photos',JSON.stringify(photoStore));
    logAction(`Photo attached to equipment ${eqId}`);
    if(currentStaff)showProfile(currentStaff);
  };
  reader.readAsDataURL(file);
}
function uploadAvatarPhoto(staffId,input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    photoStore[`avatar_${staffId}`]=e.target.result;
    localStorage.setItem('mets_photos',JSON.stringify(photoStore));
    logAction(`Profile photo updated for staff ${staffId}`);
    if(currentStaff)showProfile(currentStaff);
  };
  reader.readAsDataURL(file);
}
function openPhotoLightbox(eqId){
  const src=photoStore[`eq_${eqId}`];if(!src)return;
  const lb=document.getElementById('photoLightbox');
  const img=document.getElementById('photoLightboxImg');
  img.src=src;
  lb.dataset.eqId=eqId;
  lb.classList.add('open');
}
function closePhotoLightbox(){
  const lb=document.getElementById('photoLightbox');
  lb.classList.remove('open');
  lb.dataset.eqId='';
}
function lightboxRemovePhoto(){
  const eqId=document.getElementById('photoLightbox').dataset.eqId;
  if(!eqId)return;
  if(!confirm('Remove this photo? This cannot be undone.'))return;
  delete photoStore[`eq_${eqId}`];
  localStorage.setItem('mets_photos',JSON.stringify(photoStore));
  logAction(`Photo removed from equipment ${eqId}`);
  closePhotoLightbox();
  if(currentStaff)showProfile(currentStaff);
}
function lightboxChangePhoto(){
  document.getElementById('lightboxFileInput').click();
}
function lightboxFileChanged(input){
  const eqId=document.getElementById('photoLightbox').dataset.eqId;
  if(!eqId||!input.files[0])return;
  const reader=new FileReader();
  reader.onload=e=>{
    photoStore[`eq_${eqId}`]=e.target.result;
    localStorage.setItem('mets_photos',JSON.stringify(photoStore));
    logAction(`Photo changed for equipment ${eqId}`);
    document.getElementById('photoLightboxImg').src=e.target.result;
    input.value='';
    if(currentStaff)showProfile(currentStaff);
  };
  reader.readAsDataURL(input.files[0]);
}
// legacy – keep for any old references
function viewPhoto(eqId){openPhotoLightbox(eqId);}


// ══════════════════════════════════════════════════════════
// EDIT PERSONAL INFO
// ══════════════════════════════════════════════════════════
function openEditPersonalModal(staffId){
  const staff=currentStaff;
  if(!staff)return;
  document.getElementById('editPersonalStaffId').value=staffId;
  document.getElementById('editPersonalStaffName').textContent='Editing: '+staff.name;
  document.getElementById('editPersonalName').value=staff.name||'';
  document.getElementById('editPersonalPos').value=staff.pos||'';
  document.getElementById('editPersonalAge').value=staff.age||'';
  document.getElementById('editPersonalAddress').value=staff.address||'';
  document.getElementById('editPersonalContact').value=staff.contact||'';
  document.getElementById('editPersonalYos').value=staff.yos||'';
  document.getElementById('editPersonalGender').value=staff.gender||'F';
  document.getElementById('editPersonalStatus').value=staff.status||'Active';
  document.getElementById('editPersonalModal').classList.add('open');
}
function savePersonalInfo(){
  const staff=currentStaff;
  if(!staff)return;
  const name=document.getElementById('editPersonalName').value.trim();
  const pos=document.getElementById('editPersonalPos').value.trim();
  const age=parseInt(document.getElementById('editPersonalAge').value)||staff.age;
  const address=document.getElementById('editPersonalAddress').value.trim();
  const contact=document.getElementById('editPersonalContact').value.trim();
  const yos=parseInt(document.getElementById('editPersonalYos').value)||staff.yos;
  const gender=document.getElementById('editPersonalGender').value;
  const status=document.getElementById('editPersonalStatus').value;
  if(!name){alert('Full name is required.');return;}
  // Generate new initials from updated name
  const parts=name.trim().split(' ').filter(Boolean);
  const initials=parts.length>=2?(parts[0][0]+parts[parts.length-1][0]).toUpperCase():name.substring(0,2).toUpperCase();
  staff.name=name;
  staff.pos=pos||staff.pos;
  staff.age=age;
  staff.address=address||staff.address;
  staff.contact=contact||staff.contact;
  staff.yos=yos;
  staff.gender=gender;
  staff.status=status;
  staff.initials=initials;
  document.getElementById('editPersonalModal').classList.remove('open');
  logAction(`Personal info updated for ${name}`);
  showProfile(staff);
}

function resetSystemFull(){
  if(!confirm('⚠️ RESET SYSTEM\n\nThis will permanently erase:\n• All account data & PIN\n• All photos\n• All pending sync records\n• All activity logs\n• All settings\n\nThe system will restart to first-run setup.\n\nAre you sure?'))return;
  if(!confirm('Final confirmation: wipe ALL data and reset to new account setup?'))return;
  localStorage.clear();
  location.reload();
}

// ══════════════════════════════════════════════════════════
// ASSET STATUS & LOCATION UPDATES
// ══════════════════════════════════════════════════════════
function findEquipmentInStaff(staffId,eqId){
  for(const list of Object.values(staffData)){
    if(!Array.isArray(list))continue;
    for(const s of list){
      if(s.id===staffId&&s.equipment){
        const eq=s.equipment.find(e=>e.id===eqId);
        if(eq)return{staff:s,eq};
      }
    }
  }
  return null;
}
function updateProfileStatusCounts(){
  if(!currentStaff)return;
  const eq=currentStaff.equipment||[];
  const c={Serviceable:0,Unserviceable:0,Damaged:0,Lost:0,Missing:0};
  eq.forEach(e=>{if(c[e.status]!==undefined)c[e.status]++;});
  const map={profileSvcCount:c.Serviceable,profileUnsvcCount:c.Unserviceable,
             profileDmgCount:c.Damaged,profileLostCount:c.Lost,profileMissCount:c.Missing};
  for(const[id,val]of Object.entries(map)){const el=document.getElementById(id);if(el)el.textContent=val;}
  const ct=document.getElementById('eqCountTag');if(ct)ct.textContent=eq.length+' items';
}

function updateEqStatus(staffId,eqId,newStatus){
  const found=findEquipmentInStaff(staffId,eqId);
  if(!found)return;
  const old=found.eq.status;
  found.eq.status=newStatus;
  logAction(`Asset ${eqId} status changed: ${old} → ${newStatus}`);pushAssetUpdate(eqId,newStatus);
  queueSync('status_update',{assetId:eqId,staffId,oldStatus:old,newStatus,timestamp:new Date().toISOString()});
  buildAlertsPanel();buildStatusChart();updateDashStats();
  updateProfileStatusCounts();
  showSyncToast(`✏️ Status updated: ${newStatus}`);
}
function updateEqRemarks(staffId,eqId,remarks){
  const found=findEquipmentInStaff(staffId,eqId);
  if(!found)return;
  found.eq.remarks=remarks;
  logAction(`Asset ${eqId} remarks updated`);
  showSyncToast(`📝 Remarks saved`);
}
function updateEqLocation(staffId,eqId,newLocation){
  const found=findEquipmentInStaff(staffId,eqId);
  if(!found)return;
  const old=found.eq.location||'Not Set';
  found.eq.location=newLocation;
  logAction(`Asset ${eqId} location changed: ${old} → ${newLocation}`);
  queueSync('location_update',{assetId:eqId,staffId,oldLocation:old,newLocation,timestamp:new Date().toISOString()});
  showSyncToast(`📍 Location updated: ${newLocation}`);
}

// ══════════════════════════════════════════════════════════
// EQUIPMENT MASTER
// ══════════════════════════════════════════════════════════
function showEquipmentMaster(){
  navStack=[{label:'Dashboard',fn:goHome},{label:'All Equipment',fn:showEquipmentMaster}];
  setBreadcrumb([{label:'Dashboard',fn:'goHome()'},{label:'All Equipment'}]);
  renderEquipmentMaster();showView('equipment');
  logAction('Viewed Equipment Master List');
}
function filterEquipment(status,btn){
  currentEqFilter=status;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderEquipmentMaster();
}
function renderEquipmentMaster(){
  const allEq=getAllEquipment();
  const filtered=currentEqFilter==='all'?allEq:allEq.filter(e=>e.status===currentEqFilter);
  const usable=allEq.filter(e=>e.status==='Serviceable').length;
  const unusable=allEq.filter(e=>e.status==='Unserviceable').length;
  const repair=allEq.filter(e=>e.status==='Damaged').length;
  const lost=allEq.filter(e=>e.status==='Lost').length;
  const missing=allEq.filter(e=>e.status==='Missing').length;
  document.getElementById('eq-master-content').innerHTML=`
    <div class="stats-row" style="margin-bottom:16px;grid-template-columns:repeat(5,1fr)">
      <div class="stat-card"><div class="stat-icon">📦</div><div class="stat-num">${allEq.length}</div><div class="stat-label">Total Assets</div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-num">${usable}</div><div class="stat-label">Serviceable</div></div>
      <div class="stat-card"><div class="stat-icon">❌</div><div class="stat-num">${unusable}</div><div class="stat-label">Unserviceable</div></div>
      <div class="stat-card"><div class="stat-icon">🔧</div><div class="stat-num">${repair}</div><div class="stat-label">Damaged</div></div>
      <div class="stat-card"><div class="stat-icon">🔴</div><div class="stat-num" style="color:var(--red)">${lost+missing}</div><div class="stat-label">Lost / Missing</div></div>
    </div>
    <div class="equip-table-wrap">
      <table class="equip-table">
        <thead><tr><th>Item ID</th><th>Equipment</th><th>Brand/Model</th><th>Serial No.</th><th>Assigned To</th><th>Acquired</th><th>Amount (₱)</th><th>Category</th><th>📍 Location</th><th>Status</th><th>Remarks</th><th>📷</th><th>QR</th><th>Transfer</th><th>Repairs</th><th>Borrow</th><th>Actions</th></tr></thead>
        <tbody>${filtered.map(eq=>{
          const eqPhoto=photoStore[`eq_${eq.id}`];
          const cat=getCategory(eq);
          return`<tr>
            <td><strong>${eq.id}</strong></td><td>${eq.name}</td><td>${eq.brand}</td>
            <td><code style="font-size:0.68rem;color:var(--text-mid)">${eq.serial}</code></td>
            <td>${eq.owner}</td>
            <td style="font-size:0.72rem">${eq.acquiredDate||'N/A'}</td>
            <td style="font-size:0.72rem">${formatAmt(eq.amount)}</td>
            <td><span class="tag" style="background:${cat==='PPE'?'rgba(13,27,62,0.08)':'var(--orange-light)'};color:${cat==='PPE'?'var(--navy)':'var(--orange)'};font-size:0.62rem;padding:2px 7px;border-radius:10px;font-weight:600">${cat}</span></td>
            <td><span style="font-size:0.75rem;color:var(--text-mid)">${eq.location||'—'}</span></td>
            <td><span class="eq-status ${getStatusClass(eq.status)}">${getStatusIcon(eq.status)} ${eq.status}</span></td>
            <td><span style="font-size:0.72rem;color:var(--text-mid)">${eq.remarks||'—'}</span></td>
            <td>${eqPhoto?`<img class="photo-thumb" src="${eqPhoto}" onclick="viewPhoto('${eq.id}')" title="View photo">`:'<span style="color:var(--text-light);font-size:0.68rem">—</span>'}</td>
            <td><button class="qr-btn" onclick="openQRModal('${eq.id}','${eq.name.replace(/'/g,'&#39;')}','${eq.owner.replace(/'/g,'&#39;')}','${eq.serial}')">📱 QR</button></td>
            <td><button class="chain-btn" onclick="openChainModal('${eq.id}','${eq.name.replace(/'/g,'&#39;')}','${eq.owner.replace(/'/g,'&#39;')}')">🔄 Transfer</button></td>
            <td><button class="repair-btn" onclick="openRepairModal('${eq.id}','${eq.name.replace(/'/g,'&#39;')}')">🔧 Repairs</button></td>
            <td><button class="borrow-btn" onclick="openBorrowModal('${eq.id}','${eq.name.replace(/'/g,'&#39;')}','${eq.owner.replace(/'/g,'&#39;')}')">📤 Borrow</button></td>
            <td><div class="eq-actions">
              <button class="action-btn delete" onclick="deleteEquipmentByEqId('${eq.id}','${eq.dept}')">🗑</button>
            </div></td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>`;
}

// ══════════════════════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════════════════════
const ASSET_TYPE_RULES=[
  {re:/\b(chair|stool|bench)\b/,label:'Chair',term:'chair'},
  {re:/\b(table|desk|counter)\b/,label:'Table / Desk',term:'table'},
  {re:/\b(cabinet|locker|shelv(?:e|es|ing)|rack)\b/,label:'Cabinet / Shelving',term:'cabinet'},
  {re:/\b(laptop|notebook)\b/,label:'Laptop',term:'laptop'},
  {re:/\b(desktop|system unit|personal computer|computer|pc)\b/,label:'Desktop',term:'desktop'},
  {re:/\b(printer|plotter)\b/,label:'Printer',term:'printer'},
  {re:/\b(scanner)\b/,label:'Scanner',term:'scanner'},
  {re:/\b(photocopier|copier|xerox)\b/,label:'Photocopier',term:'photocopier'},
  {re:/\b(projector)\b/,label:'Projector',term:'projector'},
  {re:/\b(monitor)\b/,label:'Monitor',term:'monitor'},
  {re:/\b(keyboard)\b/,label:'Keyboard',term:'keyboard'},
  {re:/\b(mouse)\b/,label:'Mouse',term:'mouse'},
  {re:/\b(ups|uninterruptible power supply)\b/,label:'UPS',term:'ups'},
  {re:/\b(router|switch|modem|access point|network)\b/,label:'Network Equipment',term:'network'},
  {re:/\b(telephone|phone|cellphone|mobile)\b/,label:'Telephone',term:'telephone'},
  {re:/\b(radio|two-way)\b/,label:'Radio',term:'radio'},
  {re:/\b(calculator)\b/,label:'Calculator',term:'calculator'},
  {re:/\b(typewriter)\b/,label:'Typewriter',term:'typewriter'},
  {re:/\b(refrigerator|fridge|freezer)\b/,label:'Refrigerator',term:'refrigerator'},
  {re:/\b(television|tv)\b/,label:'Television',term:'television'},
  {re:/\b(cctv|camera|webcam)\b/,label:'Camera / CCTV',term:'camera'},
  {re:/\b(fire extinguisher)\b/,label:'Fire Extinguisher',term:'fire extinguisher'},
  {re:/\b(generator|genset)\b/,label:'Generator Set',term:'generator'},
  {re:/\b(motorcycle|vehicle|truck|van|car|ambulance)\b/,label:'Vehicle',term:'vehicle'},
  {re:/\b(water dispenser|dispenser)\b/,label:'Water Dispenser',term:'water dispenser'},
  {re:/\b(pa system|sound system|amplifier|speaker)\b/,label:'PA / Sound System',term:'sound system'},
  {re:/\b(air\s*con(?:ditioner|ditioning)?)\b/,label:'Air Conditioner',term:'air conditioner'},
  {re:/\b(electric fan|fan)\b/,label:'Electric Fan',term:'fan'}
];
const ASSET_TYPE_PLURALS={
  'Laptop':'Laptops','Desktop':'Desktops','Printer':'Printers','Scanner':'Scanners',
  'Photocopier':'Photocopiers','Chair':'Chairs','Table / Desk':'Tables / Desks',
  'Cabinet / Shelving':'Cabinets / Shelving','Air Conditioner':'Air Conditioners',
  'Electric Fan':'Electric Fans','Projector':'Projectors','Monitor':'Monitors',
  'Keyboard':'Keyboards','Mouse':'Mice','UPS':'UPS units',
  'Network Equipment':'Network Equipment','Telephone':'Telephones','Radio':'Radios',
  'Calculator':'Calculators','Typewriter':'Typewriters','Refrigerator':'Refrigerators',
  'Television':'Televisions','Camera / CCTV':'Cameras / CCTV',
  'Fire Extinguisher':'Fire Extinguishers','Generator Set':'Generator Sets',
  'Vehicle':'Vehicles','Water Dispenser':'Water Dispensers',
  'PA / Sound System':'PA / Sound Systems'
};
function assetTypeInfo(eq){
  const raw=String((eq&&eq.name)||'').trim();
  const name=raw.toLowerCase();
  for(const rule of ASSET_TYPE_RULES){
    if(rule.re.test(name))return {label:rule.label,term:rule.term};
  }
  if(!raw)return {label:'Unspecified',term:''};
  return {label:raw.replace(/\s+/g,' ').replace(/\b[a-z]/g,c=>c.toUpperCase()),term:raw};
}
function pluralAssetType(label,count){
  if(count===1)return label;
  return ASSET_TYPE_PLURALS[label]||(/[^s]$/i.test(label)?label+'s':label);
}
function assetTypeSummary(assets){
  const byType=new Map();
  (assets||[]).forEach(eq=>{
    const info=assetTypeInfo(eq);
    const row=byType.get(info.label)||{label:info.label,term:info.term,count:0};
    row.count+=1;
    byType.set(info.label,row);
  });
  return Array.from(byType.values()).sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label));
}
function searchResultHeadline(results,query,equipmentMatches){
  const eqCount=equipmentMatches.length,total=results.length;
  if(!total&&!eqCount)return `No results for "${query}"`;
  if(!eqCount)return `${total} result${total===1?'':'s'} for "${query}" · no matching assets`;
  const types=assetTypeSummary(equipmentMatches);
  if(types.length===1){
    const text=`${eqCount} ${pluralAssetType(types[0].label,eqCount)} found for "${query}"`;
    return text+(total!==eqCount?` · ${total} total results`:'');
  }
  const parts=types.slice(0,3).map(t=>`${t.count} ${pluralAssetType(t.label,t.count)}`);
  const extra=types.length>3?` + ${types.length-3} more type${types.length-3===1?'':'s'}`:'';
  return `${eqCount} asset${eqCount===1?'':'s'} found for "${query}"${parts.length?` · ${parts.join(', ')}${extra}`:''}${total!==eqCount?` · ${total} total results`:''}`;
}
function renderSearchAssetSummary(assets){
  const el=document.getElementById('searchAssetSummary');
  if(!el)return;
  if(!assets.length){
    el.style.display='none';
    el.innerHTML='';
    return;
  }
  el.style.display='';
  const rows=assetTypeSummary(assets);
  el.innerHTML=`<div class="asset-summary-head">
      <div class="asset-summary-title">📦 Matching Assets by Type</div>
      <div class="asset-summary-total">${assets.length} matching asset${assets.length===1?'':'s'}</div>
    </div>
    <div class="asset-type-grid">${rows.map(row=>`
      <button type="button" class="asset-type-card" data-term="${dashEsc(row.term)}" title="Show ${dashEsc(pluralAssetType(row.label,row.count))}">
        <span class="at-count">${row.count}</span>
        <span class="at-label">${dashEsc(pluralAssetType(row.label,row.count))}</span>
      </button>`).join('')}</div>`;
  el.querySelectorAll('.asset-type-card[data-term]').forEach(card=>{
    card.addEventListener('click',()=>{
      const term=card.dataset.term;
      if(!term)return;
      const input=document.getElementById('searchInput');
      if(input)input.value=term;
      handleSearch(term);
    });
  });
}
function handleSearch(val){
  document.getElementById('searchClearBtn').style.display=val?'inline':'none';
  if(!val.trim()){clearSearch(false);return;}
  performSearch(val.trim());
}
function clearSearch(resetInput=true){
  if(resetInput){document.getElementById('searchInput').value='';document.getElementById('searchClearBtn').style.display='none';}
  goHome();
}
function performSearch(query){
  const q=query.toLowerCase(),results=[],equipmentMatches=[];
  for(const[deptId,list]of Object.entries(staffData)){
    if(!Array.isArray(list))continue;
    for(const s of list){
      const staffName=String(s.name||''),staffPos=String(s.pos||'');
      if(staffName.toLowerCase().includes(q)||staffPos.toLowerCase().includes(q))
        results.push({type:'staff',icon:'👤',name:staffName,meta:`${staffPos} · ${deptId.replace(/_/g,' ')}`,action:()=>{showStaff(deptId);setTimeout(()=>showProfile(s),150);}});
      for(const eq of (s.equipment||[])){
        const eqName=String(eq.name||''),eqBrand=String(eq.brand||''),eqSerial=String(eq.serial||''),eqId=String(eq.id||'');
        const typeInfo=assetTypeInfo(eq);
        if(eqName.toLowerCase().includes(q)||eqBrand.toLowerCase().includes(q)||eqSerial.toLowerCase().includes(q)||eqId.toLowerCase().includes(q)||typeInfo.label.toLowerCase().includes(q)||typeInfo.term.toLowerCase().includes(q)){
          equipmentMatches.push(eq);
          results.push({type:'equipment',icon:'🖥️',name:eqName||'Unnamed asset',meta:`${eqId} · ${eqBrand} · S/N ${eqSerial} · ${staffName}`,badge:eq.status,action:()=>{showStaff(deptId);setTimeout(()=>showProfile(s),150);}});
        }
      }
    }
  }
  // Build a reverse-lookup from officeId -> group label
  const officeGroupLabel={};
  for(const[gid,grp]of Object.entries(navGroupMap)){
    for(const oid of grp.officeIds) officeGroupLabel[oid]=grp.label;
  }
  for(const[oid,od]of Object.entries(officeData)){
    const grpLabel=officeGroupLabel[oid]||'LGU Office';
    if(String(od.name||'').toLowerCase().includes(q))results.push({type:'dept',icon:od.icon||'🏢',name:od.name,meta:`${grpLabel} · ${od.depts.length} dept${od.depts.length!==1?'s':''}`,action:()=>showOfficeDept(oid)});
    for(const d of od.depts)if(String(d.name||'').toLowerCase().includes(q)||String(d.desc||'').toLowerCase().includes(q))
      results.push({type:'dept',icon:d.icon||'📁',name:d.name,meta:`${od.name} · ${d.desc}`,action:()=>showStaff(d.id)});
  }
  renderSearchResults(results,query,equipmentMatches);
  showView('search');
  setBreadcrumb([{label:'Dashboard',fn:'goHome()'},{label:`Search: "${query}"`}]);
  logAction(`Searched: "${query}" — ${results.length} results`);
}
function highlight(text,q){return text.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi'),'<mark>$1</mark>');}
function renderSearchResults(results,query,equipmentMatches){
  const matches=equipmentMatches||results.filter(r=>r.type==='equipment');
  renderSearchAssetSummary(matches);
  document.getElementById('searchResultsCount').textContent=results.length?searchResultHeadline(results,query,matches):'';
  const list=document.getElementById('searchResultsList');
  if(!results.length){list.innerHTML=`<div class="search-no-results"><div class="sn-icon">🔍</div><p>No results for "<strong>${dashEsc(query)}</strong>"</p><p style="font-size:0.75rem;margin-top:6px;color:var(--text-light)">Try staff name, equipment, serial number, or office.</p></div>`;return;}
  list.innerHTML=results.map((r,i)=>`<div class="search-result-item" onclick="window._srAct[${i}]()">
    <span class="sr-icon">${r.icon}</span>
    <div class="sr-info"><div class="sr-name">${highlight(r.name,query)}</div><div class="sr-meta">${highlight(r.meta,query)}</div></div>
    ${r.badge?`<span class="eq-status ${r.badge==='Serviceable'?'eq-usable':r.badge==='Unserviceable'?'eq-unusable':'eq-repair'}" style="font-size:0.65rem">${r.badge}</span>`:''}
    <span class="sr-type sr-${r.type}">${r.type}</span>
  </div>`).join('');
  window._srAct=results.map(r=>r.action);
}

// ══════════════════════════════════════════════════════════
// QR CODE
// ══════════════════════════════════════════════════════════
// ── QR HELPERS ──────────────────────────────────────────────
// Generates QR onto a hidden canvas at fixed 300×300, returns a PNG data-URL
function generateQRDataURL(text,size){
  size=size||300;
  if(typeof QRCode==='undefined')return null;
  const tmp=document.createElement('div');
  tmp.style.cssText='position:absolute;left:-9999px;top:-9999px;width:'+size+'px';
  document.body.appendChild(tmp);
  try{
    new QRCode(tmp,{text:text,width:size,height:size,colorDark:'#0d1b3e',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.Q});
  }catch(e){document.body.removeChild(tmp);return null;}
  const c=tmp.querySelector('canvas');
  const url=c?c.toDataURL('image/png'):null;
  document.body.removeChild(tmp);
  return url;
}

function katFindAsset(assetId){
  const id=String(assetId||'').trim();
  if(!id)return {eq:null,staff:null};
  for(const list of Object.values(staffData)){
    if(!Array.isArray(list))continue;
    for(const s of list){
      const eq=(s.equipment||[]).find(e=>String(e.id)===id);
      if(eq)return {eq,staff:s};
    }
  }
  return {eq:null,staff:null};
}

function openQRModal(eqId,eqName,ownerName,serial,staffId){
  // Reset download state while the new QR is generated.
  currentQRData={eqId,eqName,dataURL:null};
  const dlBtn=document.getElementById('qrDownloadBtn');
  if(dlBtn){dlBtn.disabled=true;dlBtn.style.opacity='.55';dlBtn.style.cursor='not-allowed';dlBtn.textContent='Generating QR…';}
  // Populate header
  document.getElementById('qrEqId').textContent=eqId;
  document.getElementById('qrEqName').textContent=`${eqName} · ${ownerName}`;
  const loc=getLocationString();
  document.getElementById('qrGeoInfo').textContent=loc?`📍 Geolocation: ${loc}`:'📍 Geolocation not enabled — click location indicator to enable';

  // Map thumbnail
  const mapWrap=document.getElementById('qrGeoMapWrap');
  const mapThumb=document.getElementById('qrGeoMapThumb');
  if(loc&&currentLocation&&mapWrap&&mapThumb){
    mapWrap.style.display='block';
    mapThumb.innerHTML=`<iframe src="https://maps.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}&z=15&output=embed" allowfullscreen loading="lazy"></iframe>`;
  }else if(mapWrap){mapWrap.style.display='none';}

  // Find equipment record
  let eq=null,staff=null;
  for(const list of Object.values(staffData)){
    if(!Array.isArray(list))continue;
    for(const s of list){
      const found=s.equipment&&s.equipment.find(e=>e.id===eqId);
      if(found){eq=found;staff=s;break;}
    }
    if(eq)break;
  }

  // Populate detail rows
  if(eq){
    const amt=eq.amount?parseFloat(String(eq.amount).replace(/[₱,]/g,'')):'';
    const cat=amt&&amt>=50000?'PPE (₱50,000 & above)':'Semi-Expendable (below ₱50,000)';
    document.getElementById('qrDetailId').textContent=eq.id;
    document.getElementById('qrDetailName').textContent=eq.name;
    document.getElementById('qrDetailBrand').textContent=eq.brand||'—';
    document.getElementById('qrDetailSerial').textContent=eq.serial||'—';
    document.getElementById('qrDetailOwner').textContent=staff?staff.name:'—';
    document.getElementById('qrDetailAssignedLoc').textContent=eq.location||'Not Set';
    document.getElementById('qrDetailScannedLoc').textContent=eq.lastScannedLocation||'Not yet scanned';
    document.getElementById('qrDetailCalibration').textContent=new Date().toLocaleString('en-PH',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});
    document.getElementById('qrDetailAcquired').textContent=eq.acquiredDate||'N/A';
    document.getElementById('qrDetailAmount').textContent=formatAmt(eq.amount);
    document.getElementById('qrDetailCategory').textContent=eq.amount?cat:'—';
    document.getElementById('qrDetailStatus').textContent=getStatusIcon(eq.status)+' '+eq.status;
    document.getElementById('qrDetailRemarks').textContent=eq.remarks||'—';
    // Auto-update lastScanDate for audit monitoring
    eq.lastScanDate=new Date().toISOString();
    updateGSORecordsBadge();
  }

  // Build QR payload. Keep it compact: the tag carries the asset identity,
  // and the app resolves the rest from its own records when scanned.
  const payload=JSON.stringify({
    id:eqId,name:eqName,serial,owner:ownerName,
    brand:eq?eq.brand:'',status:eq?eq.status:'',
    location:eq&&eq.location?eq.location:'Not Set',
    acquiredDate:eq&&eq.acquiredDate?eq.acquiredDate:'N/A',
    amount:eq&&eq.amount?eq.amount:'',
    lgu:'LGU Katipunan'
  });

  // Generate QR off-screen at 420×420 (Q error correction) for reliable scans.
  const wrap=document.getElementById('qr-canvas-wrap');
  wrap.innerHTML='<div style="color:var(--text-light);font-size:0.75rem;padding:20px">Generating QR…</div>';

  setTimeout(()=>{
    const dataURL=generateQRDataURL(payload,420);
    const dlBtn=document.getElementById('qrDownloadBtn');
    if(dataURL){
      const img=document.createElement('img');
      img.src=dataURL;
      img.className='qr-display';
      img.alt='Asset QR Code';
      wrap.innerHTML='';
      wrap.appendChild(img);
      currentQRData={eqId,eqName,dataURL};
      if(dlBtn){dlBtn.disabled=false;dlBtn.style.opacity='1';dlBtn.style.cursor='pointer';dlBtn.textContent='⬇ Download QR';}
    }else{
      wrap.innerHTML=`<div style="padding:20px;color:var(--red);font-size:0.75rem">QR generation failed. Asset ID: ${eqId}</div>`;
      currentQRData={eqId,eqName,dataURL:null};
      if(dlBtn){dlBtn.disabled=true;dlBtn.style.opacity='.55';dlBtn.style.cursor='not-allowed';dlBtn.textContent='QR unavailable';}
    }
  },50);

  // Show modal
  document.getElementById('qrModal').classList.add('open');
  logAction(`Generated QR for equipment ${eqId}`);
}

function closeQRModal(){document.getElementById('qrModal').classList.remove('open');}

function saveQRBlob(blob, fileName, eqId) {
  if (!blob) { alert('Could not create the QR image. Please try again.'); return; }
  const file = new File([blob], fileName, { type: 'image/png' });
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && window.innerWidth < 900);
  let canShare = false;
  try {
    canShare = isMobile && !!(navigator.canShare && navigator.canShare({ files: [file] }));
  } catch (e) {
    canShare = false;
  }
  if (canShare) {
    navigator.share({
      files: [file],
      title: 'Asset QR Code — ' + eqId,
      text: 'LGU Katipunan asset tag'
    }).then(function () {
      logAction('Shared QR for ' + eqId);
    }).catch(function (err) {
      if (err && err.name === 'AbortError') return;
      downloadQRBlob(blob, fileName, eqId);
    });
    return;
  }
  downloadQRBlob(blob, fileName, eqId);
}

function downloadQRBlob(blob, fileName, eqId) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  logAction('Downloaded QR for ' + eqId);
}

function downloadQR(){
  const eqId=currentQRData?.eqId||'equipment';
  const eqName=currentQRData?.eqName||'';
  const qrDataURL=currentQRData?.dataURL;
  if(!qrDataURL){alert('QR not ready yet. Please wait a moment and try again.');return;}

  // Build a nice printable tag: banner + QR + label
  const S=420, pad=18, bannerH=54, labelH=76;
  const W=S+pad*2, H=bannerH+pad+S+pad+labelH;
  const c=document.createElement('canvas');
  c.width=W; c.height=H;
  const ctx=c.getContext('2d');

  // White bg
  ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,W,H);

  // Top navy banner
  ctx.fillStyle='#0d1b3e'; ctx.fillRect(0,0,W,bannerH);
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#c9a84c'; ctx.font='bold 14px Arial,sans-serif';
  ctx.fillText('GOVERNMENT PROPERTY',W/2,bannerH*0.35);
  ctx.font='11px Arial,sans-serif'; ctx.fillStyle='#e8c96d';
  ctx.fillText('DO NOT REMOVE THIS TAG',W/2,bannerH*0.72);

  // Draw QR image
  const qrImg=new Image();
  qrImg.onload=()=>{
    ctx.drawImage(qrImg,pad,bannerH+pad,S,S);

    // Label area
    const ly=bannerH+pad+S+pad;
    ctx.fillStyle='#f2f2f2'; ctx.fillRect(0,ly,W,labelH);
    // thin gold line separator
    ctx.fillStyle='#c9a84c'; ctx.fillRect(0,ly,W,2);
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='#0d1b3e'; ctx.font='bold 16px Arial,sans-serif';
    ctx.fillText(eqId,W/2,ly+20);
    ctx.font='11px Arial,sans-serif'; ctx.fillStyle='#333333';
    const nm=eqName.length>40?eqName.substring(0,40)+'…':eqName;
    ctx.fillText(nm,W/2,ly+42);
    ctx.font='9px Arial,sans-serif'; ctx.fillStyle='#888888';
    ctx.fillText('LGU Katipunan Asset Management System',W/2,ly+62);

    const safeId=String(eqId).replace(/[^\w.-]+/g,'_');
    const fileName='QR_'+safeId+'.png';
    if(c.toBlob){
      c.toBlob(function(blob){ saveQRBlob(blob, fileName, eqId); }, 'image/png');
    }else{
      // Very old browsers: direct data-URL download.
      const a=document.createElement('a');
      a.href=c.toDataURL('image/png');
      a.download=fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      logAction('Downloaded QR for '+eqId);
    }
  };
  qrImg.onerror=function(){
    alert('Could not load the QR image. Please close and generate it again.');
  };
  qrImg.src=qrDataURL;
}
document.getElementById('qrModal').addEventListener('click',function(e){if(e.target===this)closeQRModal();});

// ══════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════
function showSettings(){
  setBreadcrumb([{label:'Dashboard',fn:'goHome()'},{label:'Settings'}]);
  showView('settings');
  const cs=document.getElementById('settingsConnStatus');
  const ps=document.getElementById('settingsPendingSync');
  if(cs)cs.innerHTML=isOnline?'<span style="color:var(--green)">● Online</span>':'<span style="color:var(--orange)">● Offline</span>';
  if(ps)ps.textContent=`${pendingSync.length} record(s)`;
  logAction('Opened Settings');
}

// ══════════════════════════════════════════════════════════
// ACTIVITY LOG
// ══════════════════════════════════════════════════════════
function logAction(msg){
  const user=(typeof currentGSOUser!=='undefined'&&currentGSOUser&&currentGSOUser.name)||document.getElementById('oicNameInput')?.value||'GSO Admin';
  let geo=null;try{if(typeof currentLocation!=='undefined'&&currentLocation&&currentLocation.lat!=null)geo=currentLocation.lat.toFixed(5)+', '+currentLocation.lng.toFixed(5);}catch(e){}
  const entry={msg,time:new Date().toLocaleString('en-PH'),user,geo};
  activityLog.unshift(entry);
  if(activityLog.length>500)activityLog=activityLog.slice(0,500);
  localStorage.setItem('mets_log',JSON.stringify(activityLog));
}
function showActivityLog(){
  const c=document.getElementById('activityLogContent');
  if(!activityLog.length){c.innerHTML='<div class="empty-state"><div class="es-icon">📋</div><p>No activity recorded yet</p></div>';return;}
  c.innerHTML=`<div style="margin-bottom:12px;font-size:0.72rem;color:var(--text-light)">Showing ${activityLog.length} activity entries — User · Action · Date · Time</div>`+
  activityLog.map(e=>`<div class="log-item">
    <div class="log-dot"></div>
    <div class="log-text"><strong style="color:var(--gold-dim)">${e.user||'GSO Admin'}</strong> — ${e.msg}</div>
    <div class="log-time">${e.time}${e.geo?`<br><span style="font-size:0.65rem">📍 ${e.geo}</span>`:''}</div>
  </div>`).join('');
  setBreadcrumb([{label:'Dashboard',fn:'goHome()'},{label:'Activity Log'}]);
  showView('activitylog');
}
function clearActivityLog(){alert('The Activity Log is a permanent audit record and cannot be cleared.');}

// ══════════════════════════════════════════════════════════
// ADDITIONAL BACKUP — Google Drive and Hard Drive only
// ══════════════════════════════════════════════════════════
function bkBuild(){
  const allEq=getAllEquipment();
  return {
    timestamp:new Date().toISOString(),
    system:'QR Code-Based Asset Management System with Procurement Forecasting for the Local Government Unit of Katipunan, Zamboanga del Norte',
    totalAssets:allEq.length,
    serviceable:allEq.filter(e=>e.status==='Serviceable').length,
    unserviceable:allEq.filter(e=>e.status!=='Serviceable').length,
    assets:allEq,
    format:2,
    store:(typeof bkStore==='function'?bkStore():{}),
    activityLog:activityLog.slice(0,100)
  };
}
function bkFileName(){return `LGU_Assets_Backup_${new Date().toISOString().slice(0,10)}.json`;}
function bkCsvCell(value){
  const text=String(value==null?'':value);
  return '"'+text.replace(/"/g,'""')+'"';
}
function bkAssetCsv(){
  const rows=[['Asset ID','Equipment','Brand / Model','Serial No.','Condition','Category','Department / Office','Accountable Person','Position','Location','Acquisition Date','Acquisition Cost','Remarks','Last Scanned']];
  getAllEquipment().forEach(eq=>{
    let position='';
    try{
      const person=(staffData[eq.dept]||[]).find(p=>p.name===eq.owner);
      if(person)position=person.pos||person.position||'';
    }catch(e){}
    rows.push([
      eq.id,eq.name,eq.brand,eq.serial,eq.status,getCategory(eq),
      (typeof dashDeptName==='function'?dashDeptName(eq.dept):eq.dept)||eq.dept,
      eq.owner,position,eq.location,eq.acquiredDate||eq.acquisitionDate||'',
      eq.amount,eq.remarks,eq.lastScanDate||eq.lastScannedLocation||''
    ]);
  });
  return '\ufeff'+rows.map(row=>row.map(bkCsvCell).join(',')).join('\r\n');
}
function bkMark(kind){
  try{localStorage.setItem('mets_last_backup_'+kind,new Date().toISOString());}catch(e){}
  bkShowLast();
}
function bkShowLast(){
  [['drive','bkLastDrive'],['disk','bkLastDisk']].forEach(([k,id])=>{
    const el=document.getElementById(id);if(!el)return;
    let t=null;try{t=localStorage.getItem('mets_last_backup_'+k);}catch(e){}
    el.textContent='Last backup: '+(t?new Date(t).toLocaleString('en-PH'):'Never');
  });
}
setTimeout(bkShowLast,500);

// Hard drive: lets the user pick the drive/folder when the browser supports it, otherwise downloads the file.
async function bkSaveToDisk(){
  const json=JSON.stringify(bkBuild(),null,2), name=bkFileName();
  if(window.showSaveFilePicker){
    try{
      const h=await window.showSaveFilePicker({suggestedName:name,types:[{description:'Backup file (JSON)',accept:{'application/json':['.json']}}]});
      const w=await h.createWritable();await w.write(json);await w.close();
      return name;
    }catch(e){if(e&&e.name==='AbortError')return null;}   // cancelled; other errors fall back to download
  }
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  a.download=name;a.click();
  return name;
}
async function backupToHardDrive(){
  const name=await bkSaveToDisk();
  if(!name)return;
  bkMark('disk');logAction('Backup saved to hard drive: '+name);
  if(window.katRecordBackup)katRecordBackup(name,'hard-drive');
  showSyncToast('✅ Backup saved to hard drive: '+name);
}
// Google Drive: uploads when a Google access token is available (window.GDRIVE_ACCESS_TOKEN).
async function backupToGoogleDrive(){
  const token=window.GDRIVE_ACCESS_TOKEN;
  if(!token){
    showSyncToast('⚠️ Google Drive is not signed in for uploads. Use Backup to Hard Drive for now.');
    logAction('Google Drive backup not sent: no access token');
    return;
  }
  if(!isOnline){showSyncToast('📴 Offline — connect to the internet to back up to Google Drive');return;}
  showSyncToast('☁️ Uploading backup to Google Drive...');
  try{
    const name=bkFileName();
    const meta={name:name,mimeType:'application/json'};
    const body=new FormData();
    body.append('metadata',new Blob([JSON.stringify(meta)],{type:'application/json'}));
    body.append('file',new Blob([JSON.stringify(bkBuild(),null,2)],{type:'application/json'}));
    const res=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{method:'POST',headers:{Authorization:'Bearer '+token},body:body});
    if(!res.ok)throw new Error('Google Drive responded HTTP '+res.status);
    // Readable companion: a native Google Sheet with the asset + accountable list.
    let sheetName='';
    try{
      sheetName='LGU_Assets_List_'+new Date().toISOString().slice(0,10);
      const sheetMeta={name:sheetName,mimeType:'application/vnd.google-apps.spreadsheet'};
      const sheetBody=new FormData();
      sheetBody.append('metadata',new Blob([JSON.stringify(sheetMeta)],{type:'application/json'}));
      sheetBody.append('file',new Blob([bkAssetCsv()],{type:'text/csv'}));
      const sheetRes=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{method:'POST',headers:{Authorization:'Bearer '+token},body:sheetBody});
      if(!sheetRes.ok)throw new Error('asset list responded HTTP '+sheetRes.status);
      logAction('Readable asset list uploaded to Google Drive: '+sheetName);
    }catch(e){
      sheetName='';
      logAction('Readable asset list upload failed: '+(e.message||e));
    }
    bkMark('drive');logAction('Backup uploaded to Google Drive: '+name);
    if(window.katRecordBackup)katRecordBackup(name,'google-drive');
    showSyncToast(sheetName?'✅ Backup + readable asset list uploaded to Google Drive':'✅ Backup uploaded to Google Drive: '+name);
  }catch(e){
    logAction('Google Drive backup failed: '+(e.message||e));
    showSyncToast('⚠️ Google Drive backup failed — try Backup to Hard Drive');
  }
}

// ══════════════════════════════════════════════════════════
// PRINT REPORTS
// ══════════════════════════════════════════════════════════
function getReportHeader(title,subtitle){
  const oic=document.getElementById('oicNameInput')?.value||'___________________';
  const oicPos=document.getElementById('oicPosInput')?.value||'GSO Officer-In-Charge';
  const sysName=document.getElementById('systemNameInput')?.value||'QR Code-Based Asset Management System with Procurement Forecasting for the Local Government Unit of Katipunan, Zamboanga del Norte';
  const now=new Date().toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'});
  return`<div style="text-align:center;border-bottom:2px solid #0d1b3e;padding-bottom:14px;margin-bottom:20px;font-family:serif">
    <div style="font-size:2rem;margin-bottom:4px">🏛️</div>
    <div style="font-size:1.2rem;font-weight:700;color:#0d1b3e">${sysName}</div>
    <div style="font-size:0.85rem;font-weight:700;color:#0d1b3e;margin-top:4px">GENERAL SERVICES OFFICE</div>
    <div style="font-size:0.75rem;color:#718096;margin-top:2px;letter-spacing:0.06em;text-transform:uppercase">${title}</div>
    ${subtitle?`<div style="font-size:0.72rem;color:#718096">${subtitle}</div>`:''}
    <div style="font-size:0.7rem;color:#718096;margin-top:4px">Date Printed: ${now}</div>
  </div>`;
}
function getSignatureLine(){
  const oic=document.getElementById('oicNameInput')?.value||'___________________';
  const oicPos=document.getElementById('oicPosInput')?.value||'GSO Officer-In-Charge';
  return`<div style="margin-top:48px;display:flex;justify-content:space-between;padding:0 40px;font-family:serif;font-size:0.8rem">
    <div style="text-align:center"><div style="border-top:1px solid #0d1b3e;width:200px;margin:0 auto;padding-top:4px"><strong>${oic}</strong><br>${oic===oicPos?'':oicPos}</div></div>
    <div style="text-align:center"><div style="border-top:1px solid #0d1b3e;width:200px;margin:0 auto;padding-top:4px"><strong>Noted By:</strong><br>Municipal Mayor</div></div>
  </div>`;
}


function reportPreviewToolbar(){
  return `<div class="no-print" style="position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#f8f5ee;border:1px solid #d4c9a8;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-family:'Source Sans 3',sans-serif;box-shadow:0 2px 8px rgba(13,27,62,.08)">
    <div style="font-weight:700;color:#0d1b3e;font-size:0.85rem">📄 Report Preview</div>
    <div style="font-size:0.72rem;color:#4a5568;flex:1;min-width:180px">Review the list below, then print when ready.</div>
    <button onclick="window.print()" style="border:none;border-radius:6px;padding:8px 14px;background:#0d1b3e;color:#e8c96d;font-family:inherit;font-size:0.74rem;font-weight:700;cursor:pointer">🖨 Print Report</button>
    <button onclick="window.close()" style="border:1px solid #d4c9a8;border-radius:6px;padding:8px 14px;background:#fff;color:#4a5568;font-family:inherit;font-size:0.74rem;font-weight:600;cursor:pointer">✕ Close</button>
  </div>`;
}

function printOverallReport(){
  const allEq=getAllEquipment();
  const usable=allEq.filter(e=>e.status==='Serviceable').length;
  const repair=allEq.filter(e=>e.status==='Damaged').length;
  const unusable=allEq.filter(e=>e.status==='Unserviceable').length;
  const lost=allEq.filter(e=>e.status==='Lost').length;
  const missing=allEq.filter(e=>e.status==='Missing').length;
  const rows=allEq.map(eq=>`<tr>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.73rem">${eq.id}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.73rem">${eq.name}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.73rem">${eq.brand}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.73rem">${eq.serial}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.73rem">${eq.acquiredDate||'N/A'}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.73rem">${formatAmt(eq.amount)}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.73rem">${getCategory(eq)}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.73rem">${eq.owner}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.73rem;font-weight:700;color:${eq.status==='Serviceable'?'#2d7d46':eq.status==='Damaged'?'#b7791f':'#c0392b'}">${eq.status}</td>
  </tr>`).join('');
  const w=window.open('','_blank');
  if(!w){alert('Allow pop-ups for this site to generate reports.');return;}
  w.document.write(`<!DOCTYPE html><html><head><title>Overall Equipment Report</title>
  <style>body{font-family:serif;color:#1a1a2e;padding:40px;max-width:1100px;margin:0 auto}table{width:100%;border-collapse:collapse}th{background:#0d1b3e;color:#c9a84c;padding:8px 10px;font-size:0.7rem;text-align:left}@media print{@page{margin:0.75in}.no-print{display:none!important}}</style>
  </head><body>
  ${reportPreviewToolbar()}
  ${getReportHeader('MUNICIPAL EQUIPMENT MASTER LIST','Overall Inventory Report — All Offices')}
  <div style="display:flex;gap:20px;margin-bottom:20px;font-family:serif;flex-wrap:wrap">
    <div style="text-align:center;border:1px solid #0d1b3e;border-radius:6px;padding:8px 14px"><div style="font-size:1.4rem;font-weight:700;color:#0d1b3e">${allEq.length}</div><div style="font-size:0.7rem">Total</div></div>
    <div style="text-align:center;border:1px solid #2d7d46;border-radius:6px;padding:8px 14px"><div style="font-size:1.4rem;font-weight:700;color:#2d7d46">${usable}</div><div style="font-size:0.7rem">✅ Serviceable</div></div>
    <div style="text-align:center;border:1px solid #b7791f;border-radius:6px;padding:8px 14px"><div style="font-size:1.4rem;font-weight:700;color:#b7791f">${repair}</div><div style="font-size:0.7rem">🔧 Damaged</div></div>
    <div style="text-align:center;border:1px solid #c0392b;border-radius:6px;padding:8px 14px"><div style="font-size:1.4rem;font-weight:700;color:#c0392b">${unusable}</div><div style="font-size:0.7rem">❌ Unserviceable</div></div>
    <div style="text-align:center;border:1px solid #8b0000;border-radius:6px;padding:8px 14px"><div style="font-size:1.4rem;font-weight:700;color:#8b0000">${lost}</div><div style="font-size:0.7rem">🔴 Lost</div></div>
    <div style="text-align:center;border:1px solid #7a5c00;border-radius:6px;padding:8px 14px"><div style="font-size:1.4rem;font-weight:700;color:#7a5c00">${missing}</div><div style="font-size:0.7rem">🟡 Missing</div></div>
  </div>
  <table><thead><tr><th>Item ID</th><th>Equipment</th><th>Brand/Model</th><th>Serial No.</th><th>Date Acquired</th><th>Amount (₱)</th><th>Category</th><th>Assigned To</th><th>Status</th></tr></thead>
  <tbody>${rows}</tbody></table>
  ${getSignatureLine()}
  </body></html>`);
  w.document.close();
  logAction('Printed Overall Equipment Report');
}

// ══════════════════════════════════════════════════════════
// CSV EXPORT
// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
// RECYCLE BIN
// ══════════════════════════════════════════════════════════
let recycleBin=JSON.parse(localStorage.getItem('mets_recycle')||'[]');

function updateRecycleBinCount(){
  const el=document.getElementById('recycleBinCount');
  if(el)el.textContent=recycleBin.length;
}

function deleteEquipment(staffId,eqId){
  // Find equipment name for display
  let eqName='this equipment';
  for(const list of Object.values(staffData)){
    if(!Array.isArray(list))continue;
    for(const s of list){
      if(s.id===staffId&&s.equipment){
        const found=s.equipment.find(e=>e.id===eqId);
        if(found){eqName=found.name;break;}
      }
    }
  }
  // Show styled confirmation modal
  document.getElementById('delEqConfirmName').textContent=eqName;
  document.getElementById('delEqConfirmId').textContent=eqId;
  document.getElementById('delEqConfirmModal').dataset.staffId=staffId;
  document.getElementById('delEqConfirmModal').dataset.eqId=eqId;
  document.getElementById('delEqConfirmModal').classList.add('open');
}
function confirmDeleteEquipment(){
  const modal=document.getElementById('delEqConfirmModal');
  const staffId=modal.dataset.staffId;
  const eqId=modal.dataset.eqId;
  modal.classList.remove('open');
  for(const list of Object.values(staffData)){
    if(!Array.isArray(list))continue;
    for(const s of list){
      if(s.id===staffId&&s.equipment){
        const idx=s.equipment.findIndex(e=>e.id===eqId);
        if(idx>=0){
          const deleted=s.equipment.splice(idx,1)[0];
          deleted._deletedFrom=staffId;deleted._deletedAt=new Date().toISOString();deleted._ownerName=s.name;
          recycleBin.unshift(deleted);
          localStorage.setItem('mets_recycle',JSON.stringify(recycleBin));
          updateRecycleBinCount();
          logAction(`Deleted equipment ${eqId} (${deleted.name}) — moved to Recycle Bin`);
          showSyncToast(`🗑 ${deleted.name} moved to Recycle Bin`);
          buildAlertsPanel();buildStatusChart();updateDashStats();
          if(currentStaff&&currentStaff.id===staffId)showProfile(currentStaff);
          return;
        }
      }
    }
  }
}

function showRecycleBin(){
  setBreadcrumb([{label:'Dashboard',fn:'goHome()'},{label:'Recycle Bin'}]);
  renderRecycleBin();
  showView('recyclebin');
  logAction('Viewed Recycle Bin');
}

function renderRecycleBin(){
  const c=document.getElementById('recycleBinContent');
  if(!recycleBin.length){
    c.innerHTML='<div class="empty-state"><div class="es-icon">🗑️</div><p>Recycle Bin is empty</p></div>';return;
  }
  c.innerHTML=recycleBin.map((item,i)=>{
    if(item._binType==='office_section'){
      const staffCount=(item.staff||[]).length;
      return`<div class="bin-item">
        <div style="font-size:1.4rem">${item.icon||'🏢'}</div>
        <div class="bin-item-info">
          <div class="bin-item-name">${item.name} <span class="tag tag-blue">Office Section</span></div>
          <div class="bin-item-meta">From: ${item._sourceOfficeName||'—'} · ${staffCount} personnel · Deleted: ${new Date(item._deletedAt).toLocaleString('en-PH')}</div>
          <div class="bin-item-meta" style="margin-top:3px;color:var(--text-light);font-size:0.68rem">${item.desc||''}</div>
        </div>
        <div class="bin-item-actions">
          <button class="action-btn add" onclick="restoreFromBin(${i})">↩️ Restore</button>
          <button class="action-btn delete" onclick="permanentDelete(${i})">❌ Remove</button>
        </div>
      </div>`;
    }
    return`<div class="bin-item">
      <div style="font-size:1.4rem">${getStatusIcon(item.status)}</div>
      <div class="bin-item-info">
        <div class="bin-item-name">${item.name} <span class="tag tag-blue">${item.id}</span></div>
        <div class="bin-item-meta">${item.brand} · S/N: ${item.serial} · Owner: ${item._ownerName||'—'} · Deleted: ${new Date(item._deletedAt).toLocaleString('en-PH')}</div>
        <div class="bin-item-meta" style="margin-top:3px">
          <span class="eq-status ${getStatusClass(item.status)}">${item.status}</span>
          ${item.amount?` · ${formatAmt(item.amount)}`:''}
          ${item.acquiredDate?` · Acquired: ${item.acquiredDate}`:''}
        </div>
      </div>
      <div class="bin-item-actions">
        <button class="action-btn add" onclick="restoreFromBin(${i})">↩️ Restore</button>
        <button class="action-btn delete" onclick="permanentDelete(${i})">❌ Remove</button>
      </div>
    </div>`;
  }).join('');
}

function restoreFromBin(i){
  const item=recycleBin[i];

  // ── Restore office section ──
  if(item._binType==='office_section'){
    const sourceOffice=item._sourceOffice;
    const deptEntry={id:item.id,name:item.name,icon:item.icon||'🏢',desc:item.desc||'',color:item.color||'#1e3a6e',count:item.count||0};
    if(sourceOffice==='municipal'){
      // Restore to Admin Office
      if(!window.adminOfficeDepts.find(d=>d.id===item.id)){
        window.adminOfficeDepts.push(deptEntry);
      }
    } else {
      if(officeData[sourceOffice]){
        if(!officeData[sourceOffice].depts.find(d=>d.id===item.id)){
          officeData[sourceOffice].depts.push(deptEntry);
        }
      }
    }
    // Restore staff data
    staffData[item.id]=JSON.parse(JSON.stringify(item.staff||[]));
    recycleBin.splice(i,1);
    localStorage.setItem('mets_recycle',JSON.stringify(recycleBin));
    updateRecycleBinCount();
    buildAlertsPanel();buildStatusChart();updateDashStats();
    rebuildNavSidebar();
    logAction(`Restored office section: ${item.name} to ${item._sourceOfficeName||sourceOffice}`);
    showSyncToast(`↩️ Section "${item.name}" restored`);
    renderRecycleBin();
    return;
  }

  // ── Restore equipment ──
  const deptId=item._deletedFrom;
  const ownerName=item._ownerName;
  const eqId=item.id;
  const eqName=item.name;
  // Find the target staff — try owner name first, then first staff in dept
  let staff=null;
  if(deptId&&staffData[deptId]&&staffData[deptId].length>0){
    staff=staffData[deptId].find(s=>s.name===ownerName)||staffData[deptId][0];
  } else {
    // Search all depts for staff with matching name
    for(const list of Object.values(staffData)){
      if(!Array.isArray(list))continue;
      const found=list.find(s=>s.name===ownerName);
      if(found){staff=found;break;}
    }
    // If dept doesn't exist, create it and add item directly
    if(!staff&&deptId){
      staffData[deptId]=staffData[deptId]||[];
      // No staff to assign to — alert and skip
      alert(`Cannot restore: original owner "${ownerName}" not found. Please add staff first.`);
      return;
    }
  }
  if(staff){
    // Strip bin metadata before restoring
    const restored={...item};
    delete restored._deletedFrom;delete restored._deletedAt;delete restored._ownerName;
    staff.equipment=staff.equipment||[];
    staff.equipment.push(restored);
    recycleBin.splice(i,1);
    localStorage.setItem('mets_recycle',JSON.stringify(recycleBin));
    updateRecycleBinCount();
    logAction(`Restored equipment ${eqId} (${eqName}) to ${staff.name} from Recycle Bin`);
    showSyncToast(`↩️ ${eqName} restored to ${staff.name}`);
    buildAlertsPanel();buildStatusChart();updateDashStats();
    renderRecycleBin();
  } else {
    alert('Could not find a staff member to restore this equipment to. Please add the staff member first.');
  }
}

function editBinItemStatus(i){
  const item=recycleBin[i];
  const statuses=['Serviceable','Unserviceable','Damaged','Lost','Missing'];
  const cur=statuses.indexOf(item.status);
  const next=statuses[(cur+1)%statuses.length];
  recycleBin[i].status=next;
  localStorage.setItem('mets_recycle',JSON.stringify(recycleBin));
  logAction(`Updated bin item ${item.id} status to ${next}`);
  renderRecycleBin();
}

function permanentDelete(i){
  const item=recycleBin[i];
  if(!confirm(`Permanently delete "${item.name}"? This cannot be undone.`))return;
  recycleBin.splice(i,1);
  localStorage.setItem('mets_recycle',JSON.stringify(recycleBin));
  updateRecycleBinCount();
  logAction(`Permanently deleted ${item.id} from Recycle Bin`);
  renderRecycleBin();
}

function emptyRecycleBin(){
  if(!recycleBin.length){alert('Recycle Bin is already empty.');return;}
  if(!confirm(`Permanently delete all ${recycleBin.length} item(s)? This cannot be undone.`))return;
  recycleBin=[];
  localStorage.setItem('mets_recycle','[]');
  updateRecycleBinCount();
  logAction('Emptied Recycle Bin');
  renderRecycleBin();
}

// ══════════════════════════════════════════════════════════
// ADD / EDIT EQUIPMENT
// ══════════════════════════════════════════════════════════
let addEqTargetStaffId=null;

function openAddEquipmentModal(staffId){
  addEqTargetStaffId=staffId;
  let staffName='';
  for(const list of Object.values(staffData)){
    if(!Array.isArray(list))continue;
    const s=list.find(x=>x.id===staffId);
    if(s){staffName=s.name;break;}
  }
  document.getElementById('addEqStaffName').textContent=`Adding equipment for: ${staffName}`;
  ['addEqId','addEqName','addEqBrand','addEqSerial','addEqAcquired','addEqLife','addEqAmount','addEqCalibration','addEqExpiration','addEqRemarks'].forEach(id=>{document.getElementById(id).value='';})
  document.getElementById('addEqStatus').value='Serviceable';
  document.getElementById('addEqLocation').value='Not Set';
  // Reset category display
  const addCatH=document.getElementById('addEqCategory');
  const addCatD=document.getElementById('addEqCategoryDisplay');
  if(addCatH){addCatH.value='';}
  if(addCatD){addCatD.innerHTML='<span style="color:var(--text-light);font-style:italic">— Enter amount to auto-set —</span>';}
  document.getElementById('addEquipmentModal').classList.add('open');
}

function saveAddEquipment(){
  const id=document.getElementById('addEqId').value.trim();
  const name=document.getElementById('addEqName').value.trim();
  if(!id||!name){alert('Item ID and Equipment Name are required.');return;}
  const newEq={
    id,name,
    description:(document.getElementById('addEqDesc')||{}).value||'',
    regLat:(typeof currentLocation!=='undefined'&&currentLocation)?currentLocation.lat:null,
    regLng:(typeof currentLocation!=='undefined'&&currentLocation)?currentLocation.lng:null,
    brand:document.getElementById('addEqBrand').value.trim()||'—',
    serial:document.getElementById('addEqSerial').value.trim()||'N/A',
    status:document.getElementById('addEqStatus').value,
    location:document.getElementById('addEqLocation').value,
    category:(()=>{
      const amt=parseFloat(document.getElementById('addEqAmount').value)||0;
      return amt>=50000?'PPE':'Semi-Expendable';
    })(),
    acquiredDate:document.getElementById('addEqAcquired').value||'',
    usefulLife:parseFloat(document.getElementById('addEqLife').value)||'',
    amount:document.getElementById('addEqAmount').value.trim()||'',
    calibrationDate:document.getElementById('addEqCalibration').value||'',
    expirationDate:document.getElementById('addEqExpiration').value||'',
    remarks:document.getElementById('addEqRemarks').value.trim()||''
  };
  for(const list of Object.values(staffData)){
    if(!Array.isArray(list))continue;
    const s=list.find(x=>x.id===addEqTargetStaffId);
    if(s){s.equipment=s.equipment||[];s.equipment.push(newEq);break;}
  }
  document.getElementById('addEquipmentModal').classList.remove('open');
  logAction(`Added equipment ${id} (${name})`);
  showSyncToast(`✅ Equipment ${name} added`);
  buildAlertsPanel();buildStatusChart();updateDashStats();
  if(currentStaff&&currentStaff.id===addEqTargetStaffId)showProfile(currentStaff);
}

function openEditEquipmentModal(staffId,eqId){
  let eq=null;
  for(const list of Object.values(staffData)){
    if(!Array.isArray(list))continue;
    for(const s of list){
      if(s.id===staffId){const found=s.equipment&&s.equipment.find(e=>e.id===eqId);if(found){eq=found;break;}}
    }
    if(eq)break;
  }
  if(!eq)return;
  document.getElementById('editEqStaffId').value=staffId;
  document.getElementById('editEqOrigId').value=eqId;
  document.getElementById('editEqId').value=eq.id;
  document.getElementById('editEqName').value=eq.name;
  document.getElementById('editEqBrand').value=eq.brand;
  document.getElementById('editEqSerial').value=eq.serial;
  document.getElementById('editEqStatus').value=eq.status;
  document.getElementById('editEqCategory').value=eq.category||'Semi-Expendable';
  document.getElementById('editEqLocation').value=eq.location||'Not Set';
  document.getElementById('editEqAcquired').value=eq.acquiredDate||'';
  document.getElementById('editEqLife').value=eq.usefulLife||'';
  const rawAmt=eq.amount?String(eq.amount).replace(/[₱,]/g,''):'';
  document.getElementById('editEqAmount').value=rawAmt;
  // Populate category display
  autoSetCategory('editEqAmount','editEqCategory','editEqCategoryDisplay');
  // If category was manually set and amount is empty, show saved category
  if(!rawAmt && eq.category){
    const dispEl=document.getElementById('editEqCategoryDisplay');
    const hidEl=document.getElementById('editEqCategory');
    if(dispEl&&hidEl){
      hidEl.value=eq.category;
      const isPPE=eq.category==='PPE';
      dispEl.innerHTML=`<span style="color:${isPPE?'var(--gold)':'var(--orange)'};font-weight:600;font-style:normal">${isPPE?'📋 PPE (Above ₱50,000)':'📦 Semi-Expendable (Below ₱50,000)'}</span>`;
    }
  }
  document.getElementById('editEqCalibration').value=eq.calibrationDate||'';
  document.getElementById('editEqExpiration').value=eq.expirationDate||'';
  document.getElementById('editEqRemarks').value=eq.remarks||'';
  // Show/save registered coordinates (used for scan-location comparison).
  const regLat=eq.regLat!=null?eq.regLat:(eq.latitude!=null?eq.latitude:'');
  const regLng=eq.regLng!=null?eq.regLng:(eq.longitude!=null?eq.longitude:'');
  const regDisp=document.getElementById('editEqRegDisplay');
  const regMsg=document.getElementById('editEqRegMsg');
  document.getElementById('editEqRegLat').value=coordOk(regLat)?Number(regLat):'';
  document.getElementById('editEqRegLng').value=coordOk(regLng)?Number(regLng):'';
  document.getElementById('editEqRegAcc').value=eq.regAcc!=null?eq.regAcc:'';
  document.getElementById('editEqRegAt').value=eq.regAt||'';
  if(coordOk(regLat)&&coordOk(regLng)){
    if(regDisp)regDisp.value=Number(regLat).toFixed(6)+', '+Number(regLng).toFixed(6);
    if(regMsg)regMsg.textContent='Registered coordinates saved for this asset.';
  }else{
    if(regDisp)regDisp.value='';
    if(regMsg)regMsg.textContent='Not available — use current location to set the asset’s registered coordinates.';
  }
  document.getElementById('editEquipmentModal').classList.add('open');
  // Re-trigger category display after modal paint
  setTimeout(()=>autoSetCategory('editEqAmount','editEqCategory','editEqCategoryDisplay'),30);
}

async function captureRegisteredLocation(){
  const msg=document.getElementById('editEqRegMsg');
  if(msg)msg.textContent='Locating…';
  const loc=await getScanLocation();
  if(!loc){
    if(msg)msg.textContent='Location unavailable. Allow location access and try again.';
    return;
  }
  if(loc.demo){
    if(msg)msg.textContent='Demo coordinates cannot be saved as registered coordinates.';
    return;
  }
  const lat=Number(loc.lat),lng=Number(loc.lng);
  if(!coordOk(lat)||!coordOk(lng)){
    if(msg)msg.textContent='Invalid location received. Try again.';
    return;
  }
  document.getElementById('editEqRegLat').value=lat;
  document.getElementById('editEqRegLng').value=lng;
  document.getElementById('editEqRegAcc').value=loc.acc!=null?loc.acc:'';
  document.getElementById('editEqRegAt').value=new Date().toISOString();
  const disp=document.getElementById('editEqRegDisplay');
  if(disp)disp.value=lat.toFixed(6)+', '+lng.toFixed(6);
  if(msg)msg.textContent='Captured: '+lat.toFixed(5)+', '+lng.toFixed(5)+' (±'+loc.acc+'m). Click Save Changes to store.';
}

function saveEditEquipment(){
  const staffId=document.getElementById('editEqStaffId').value;
  const origId=document.getElementById('editEqOrigId').value;
  for(const list of Object.values(staffData)){
    if(!Array.isArray(list))continue;
    for(const s of list){
      if(s.id===staffId&&s.equipment){
        const eq=s.equipment.find(e=>e.id===origId);
        if(eq){
          eq.id=document.getElementById('editEqId').value.trim()||origId;
          eq.name=document.getElementById('editEqName').value.trim()||eq.name;
          eq.brand=document.getElementById('editEqBrand').value.trim()||eq.brand;
          eq.serial=document.getElementById('editEqSerial').value.trim()||eq.serial;
          eq.status=document.getElementById('editEqStatus').value;
          eq.amount=document.getElementById('editEqAmount').value.trim();
          eq.category=(()=>{const amt=parseFloat(eq.amount)||0;return amt>=50000?'PPE':'Semi-Expendable';})();
          eq.location=document.getElementById('editEqLocation').value;
          eq.acquiredDate=document.getElementById('editEqAcquired').value||eq.acquiredDate||'';
          eq.usefulLife=parseFloat(document.getElementById('editEqLife').value)||'';
          eq.calibrationDate=document.getElementById('editEqCalibration').value||eq.calibrationDate||'';
          eq.expirationDate=document.getElementById('editEqExpiration').value||eq.expirationDate||'';
          eq.remarks=document.getElementById('editEqRemarks').value.trim();
          const regLatRaw=document.getElementById('editEqRegLat').value;
          const regLngRaw=document.getElementById('editEqRegLng').value;
          if(coordOk(regLatRaw)&&coordOk(regLngRaw)){
            eq.regLat=Number(regLatRaw);
            eq.regLng=Number(regLngRaw);
            const regAcc=document.getElementById('editEqRegAcc').value;
            if(regAcc!==''&&isFinite(Number(regAcc)))eq.regAcc=Number(regAcc);
            const regAt=document.getElementById('editEqRegAt').value;
            if(regAt)eq.regAt=regAt;
          }
          document.getElementById('editEquipmentModal').classList.remove('open');
          logAction(`Edited equipment ${origId} (${eq.name})`);
          showSyncToast(`✏️ ${eq.name} updated`);
          buildAlertsPanel();buildStatusChart();updateDashStats();
          if(currentStaff)showProfile(currentStaff);
          return;
        }
      }
    }
  }
}

// ══════════════════════════════════════════════════════════
// AMOUNT FORMATTING
// ══════════════════════════════════════════════════════════
function formatAmt(val){
  if(!val&&val!==0)return'—';
  const n=parseFloat(String(val).replace(/,/g,''));
  if(isNaN(n))return'—';
  return'₱'+n.toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
}

// ══════════════════════════════════════════════════════════
// AUTO CATEGORY BASED ON AMOUNT
// ══════════════════════════════════════════════════════════
function autoSetCategory(amountId,hiddenId,displayId){
  const amtEl=document.getElementById(amountId);
  const hidEl=document.getElementById(hiddenId);
  const dispEl=document.getElementById(displayId);
  if(!amtEl||!hidEl||!dispEl)return;
  const raw=String(amtEl.value||'').replace(/[₱,\s]/g,'').trim();
  if(!raw){
    hidEl.value='';
    dispEl.innerHTML='<span style="color:var(--text-light);font-style:italic">— Enter amount to auto-set —</span>';
    return;
  }
  const n=parseFloat(raw);
  if(isNaN(n)){
    hidEl.value='';
    dispEl.innerHTML='<span style="color:var(--text-light);font-style:italic">— Invalid amount —</span>';
    return;
  }
  if(n>=50000){
    hidEl.value='PPE';
    dispEl.innerHTML='<span style="color:var(--gold);font-weight:600;font-style:normal">📋 PPE (Above ₱50,000)</span>';
  } else {
    hidEl.value='Semi-Expendable';
    dispEl.innerHTML='<span style="color:var(--orange);font-weight:600;font-style:normal">📦 Semi-Expendable (Below ₱50,000)</span>';
  }
}

// ══════════════════════════════════════════════════════════
// ENHANCED REPORTS
// ══════════════════════════════════════════════════════════
function getCategory(eq){
  if(!eq.amount&&eq.amount!==0)return'Semi-Expendable';
  const n=parseFloat(String(eq.amount).replace(/[₱,]/g,''));
  if(isNaN(n)||n===0)return'Semi-Expendable';
  return n>=50000?'PPE':'Semi-Expendable';
}

function reportTableRows(eqList){
  return eqList.map(eq=>`<tr>
    <td style="padding:6px 8px;border-bottom:1px solid #eee">${eq.id}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee">${eq.name}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee">${eq.brand}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee">${eq.serial}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee">${eq.acquiredDate||'N/A'}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee">${formatAmt(eq.amount)}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee">${getCategory(eq)}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee">${eq.owner||'—'}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee">${eq.location||'—'}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:700;color:${eq.status==='Serviceable'?'#2d7d46':eq.status==='Damaged'?'#b7791f':'#c0392b'}">${eq.status}</td>
  </tr>`).join('');
}

function printReportServiceable(){
  const all=getAllEquipment().filter(e=>e.status==='Serviceable');

  // Summary cards — only total count
  const summary=`
    <div style="display:flex;gap:14px;margin-bottom:20px;flex-wrap:wrap">
      <div style="text-align:center;border:1px solid #0d1b3e;border-radius:6px;padding:8px 18px">
        <div style="font-size:1.4rem;font-weight:700;color:#0d1b3e">${all.length}</div>
        <div style="font-size:0.7rem">Total Serviceable</div>
      </div>
    </div>`;

  // Single unified table
  const tableContent=`
    <table><thead><tr><th>Item ID</th><th>Equipment</th><th>Brand/Model</th><th>Serial No.</th><th>Acquired</th><th>Amount (₱)</th><th>Category</th><th>Owner</th><th>Location</th><th>Status</th></tr></thead>
    <tbody>${reportTableRows(all)}</tbody></table>`;

  openReportWindow('SERVICEABLE ASSETS REPORT','All Serviceable Equipment', summary+tableContent);
  logAction('Printed Serviceable Assets Report');
}

// reportTableRows variant without the Category column (already split by section)
function reportTableRowsNoCategory(eqList){
  return eqList.map(eq=>`<tr>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.74rem">${eq.id}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.74rem">${eq.name}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.74rem">${eq.brand}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.74rem">${eq.serial}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.74rem">${eq.acquiredDate||'N/A'}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.74rem">${formatAmt(eq.amount)}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.74rem">${eq.owner||'—'}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.74rem">${eq.location||'—'}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:0.74rem;font-weight:700;color:#2d7d46">${eq.status}</td>
  </tr>`).join('');
}

function printReportUnserviceable(){
  const all=getAllEquipment().filter(e=>e.status!=='Serviceable');
  openReportWindow('UNSERVICEABLE ASSETS REPORT','Damaged / Unserviceable / Lost / Missing Equipment',`
    <table><thead><tr><th>Item ID</th><th>Equipment</th><th>Brand/Model</th><th>Serial No.</th><th>Acquired</th><th>Amount (₱)</th><th>Category</th><th>Owner</th><th>Location</th><th>Status</th></tr></thead><tbody>${reportTableRows(all)}</tbody></table>
  `);
  logAction('Printed Unserviceable Assets Report');
}

function openReportByOfficeModal(){
  const list=document.getElementById('rboOfficeList');
  list.innerHTML=Object.entries(officeData).map(([id,o])=>`
    <label style="display:flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--border);border-radius:7px;padding:8px 10px;cursor:pointer;font-size:0.78rem;color:var(--text-dark);transition:border-color 0.15s;" onmouseover="this.style.borderColor='var(--gold-dim)'" onmouseout="this.style.borderColor='var(--border)'">
      <input type="checkbox" value="${id}" checked style="accent-color:var(--gold);width:15px;height:15px;cursor:pointer">
      <span>${o.icon} ${o.name}</span>
    </label>`).join('');
  document.getElementById('reportByOfficeModal').classList.add('open');
}
function rboSelectAll(val){
  document.querySelectorAll('#rboOfficeList input[type=checkbox]').forEach(cb=>cb.checked=val);
}
function printSelectedOfficeReport(){
  const checked=[...document.querySelectorAll('#rboOfficeList input[type=checkbox]:checked')].map(cb=>cb.value);
  if(!checked.length){alert('Please select at least one office.');return;}
  document.getElementById('reportByOfficeModal').classList.remove('open');
  const allEq=getAllEquipment();
  let sections='';
  for(const oid of checked){
    const od=officeData[oid];if(!od)continue;
    const deptIds=od.depts.map(d=>d.id);
    const eqs=allEq.filter(e=>deptIds.includes(e.dept));
    if(!eqs.length){
      sections+=`<div style="page-break-inside:avoid;margin-bottom:20px">
        <h3 style="color:#0d1b3e;border-bottom:2px solid #c9a84c;padding-bottom:6px;margin-bottom:8px">${od.icon} ${od.name}</h3>
        <p style="font-size:0.78rem;color:#718096;font-style:italic">No equipment assigned to this office.</p>
      </div>`;
      continue;
    }
    const svc=eqs.filter(e=>e.status==='Serviceable');
    const unsvc=eqs.filter(e=>e.status!=='Serviceable');
    const ppe=eqs.filter(e=>getCategory(e)==='PPE');
    const semi=eqs.filter(e=>getCategory(e)==='Semi-Expendable');
    sections+=`<div style="page-break-inside:avoid;margin-bottom:32px">
      <h3 style="color:#0d1b3e;border-bottom:2px solid #c9a84c;padding-bottom:6px;margin-bottom:10px">${od.icon} ${od.name}</h3>
      <div style="display:flex;gap:20px;margin-bottom:10px;font-size:0.78rem">
        <span style="color:#2d7d46">✅ Serviceable: <strong>${svc.length}</strong></span>
        <span style="color:#c0392b">❌ Unserviceable/Other: <strong>${unsvc.length}</strong></span>
        <span>📦 Total: <strong>${eqs.length}</strong></span>
        <span>🏷️ PPE: <strong>${ppe.length}</strong></span>
        <span>📦 Semi-Exp: <strong>${semi.length}</strong></span>
      </div>
      <table><thead><tr><th>Item ID</th><th>Equipment</th><th>Brand/Model</th><th>Serial No.</th><th>Acquired</th><th>Amount (₱)</th><th>Category</th><th>Owner</th><th>Location</th><th>Status</th></tr></thead>
      <tbody>${reportTableRows(eqs)}</tbody></table>
    </div>`;
  }
  openReportWindow(
    'EQUIPMENT REPORT BY OFFICE',
    checked.length===Object.keys(officeData).length?'All Offices':checked.map(id=>officeData[id]?.name).filter(Boolean).join(', '),
    sections
  );
  logAction(`Printed Report by Office: ${checked.join(', ')}`);
}
function printReportByOfficePrompt(){openReportByOfficeModal();}


function printReportByOffice(officeId){
  const allEq=getAllEquipment();
  let sections='';
  const officesToPrint=officeId==='all'?Object.entries(officeData):[[officeId,officeData[officeId]]].filter(([,v])=>v);
  for(const[oid,od]of officesToPrint){
    const deptIds=od.depts.map(d=>d.id);
    const eqs=allEq.filter(e=>deptIds.includes(e.dept));
    if(!eqs.length)continue;
    const svc=eqs.filter(e=>e.status==='Serviceable');
    const unsvc=eqs.filter(e=>e.status!=='Serviceable');
    sections+=`<div style="page-break-inside:avoid;margin-bottom:28px">
      <h3 style="color:#0d1b3e;border-bottom:2px solid #c9a84c;padding-bottom:6px;margin-bottom:10px">${od.icon} ${od.name}</h3>
      <div style="display:flex;gap:20px;margin-bottom:10px;font-size:0.8rem">
        <span style="color:#2d7d46">✅ Serviceable: ${svc.length}</span>
        <span style="color:#c0392b">❌ Unserviceable/Other: ${unsvc.length}</span>
        <span>Total: ${eqs.length}</span>
      </div>
      <table><thead><tr><th>Item ID</th><th>Equipment</th><th>Brand/Model</th><th>Serial No.</th><th>Acquired</th><th>Amount (₱)</th><th>Category</th><th>Owner</th><th>Location</th><th>Status</th></tr></thead>
      <tbody>${reportTableRows(eqs)}</tbody></table></div>`;
  }
  openReportWindow('EQUIPMENT REPORT BY OFFICE',officeId==='all'?'All Offices':officeData[officeId]?.name||officeId,sections);
  logAction(`Printed Report by Office: ${officeId}`);
}

function printPPEReport(){
  const all=getAllEquipment().filter(e=>getCategory(e)==='PPE');
  openReportWindow('PROPERTY, PLANT & EQUIPMENT (PPE) REPORT','Items Valued ₱50,000 & Above',`
    <table><thead><tr><th>Item ID</th><th>Equipment</th><th>Brand/Model</th><th>Serial No.</th><th>Acquired</th><th>Amount (₱)</th><th>Category</th><th>Owner</th><th>Location</th><th>Status</th></tr></thead><tbody>${reportTableRows(all)}</tbody></table>
    <div style="margin-top:14px;font-size:0.8rem">Total PPE Items: <strong>${all.length}</strong></div>
  `);
  logAction('Printed PPE Report');
}

function printSemiExpendableReport(){
  const all=getAllEquipment().filter(e=>getCategory(e)==='Semi-Expendable');
  openReportWindow('SEMI-EXPENDABLE REPORT','Items Valued Below ₱50,000',`
    <table><thead><tr><th>Item ID</th><th>Equipment</th><th>Brand/Model</th><th>Serial No.</th><th>Acquired</th><th>Amount (₱)</th><th>Category</th><th>Owner</th><th>Location</th><th>Status</th></tr></thead><tbody>${reportTableRows(all)}</tbody></table>
    <div style="margin-top:14px;font-size:0.8rem">Total Semi-Expendable Items: <strong>${all.length}</strong></div>
  `);
  logAction('Printed Semi-Expendable Report');
}

function openReportWindow(title,subtitle,bodyContent){
  const allEq=getAllEquipment();
  const svc=allEq.filter(e=>e.status==='Serviceable').length;
  const unsvc=allEq.filter(e=>e.status!=='Serviceable').length;
  const oic=document.getElementById('oicNameInput')?.value||'GSO Officer-In-Charge';
  const oicPos=document.getElementById('oicPosInput')?.value||'GSO Officer-In-Charge';
  const sysName=document.getElementById('systemNameInput')?.value||'QR Code-Based Asset Management System with Procurement Forecasting for the Local Government Unit of Katipunan, Zamboanga del Norte';
  const now=new Date().toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'});
  const w=window.open('','_blank');
  if(!w){alert('Allow pop-ups for this site to generate reports.');return;}
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
  <style>
    body{font-family:serif;color:#1a1a2e;padding:40px;max-width:1000px;margin:0 auto}
    table{width:100%;border-collapse:collapse;margin-bottom:8px}
    th{background:#0d1b3e;color:#c9a84c;padding:7px 9px;font-size:0.72rem;text-align:left}
    td{padding:6px 8px;border-bottom:1px solid #eee;font-size:0.75rem}
    @media print{@page{margin:0.75in}.no-print{display:none!important}}
  </style></head><body>
  ${reportPreviewToolbar()}
  <div style="text-align:center;border-bottom:2px solid #0d1b3e;padding-bottom:14px;margin-bottom:20px">
    <div style="font-size:2rem;margin-bottom:4px">🏛️</div>
    <div style="font-size:1.1rem;font-weight:700;color:#0d1b3e">${sysName}</div>
    <div style="font-size:0.85rem;font-weight:700;color:#0d1b3e;margin-top:4px">GENERAL SERVICES OFFICE</div>
    <div style="font-size:0.82rem;font-weight:700;color:#0d1b3e;margin-top:6px">${title}</div>
    <div style="font-size:0.72rem;color:#718096;margin-top:2px">${subtitle}</div>
    <div style="font-size:0.7rem;color:#718096;margin-top:4px">Date Printed: ${now}</div>
  </div>
  ${bodyContent}
  <div style="margin-top:48px;display:flex;justify-content:space-between;padding:0 40px;font-family:serif;font-size:0.8rem">
    <div style="text-align:center"><div style="border-top:1px solid #0d1b3e;width:200px;margin:0 auto;padding-top:4px"><strong>${oic}</strong>${oic!==oicPos?'<br>'+oicPos:''}</div></div>
    <div style="text-align:center"><div style="border-top:1px solid #0d1b3e;width:200px;margin:0 auto;padding-top:4px"><strong>Noted By:</strong><br>Municipal Mayor</div></div>
  </div>
  </body></html>`);
  w.document.close();
}

// ══════════════════════════════════════════════════════════
// OFFICE/SECTION MANAGEMENT (Add, Edit, Delete)
// ══════════════════════════════════════════════════════════
function openAddOfficeModal(source){
  document.getElementById('addOfficeId').value=source||currentOfficeId||'';
  document.getElementById('addOfficeName').value='';
  document.getElementById('addOfficeDesc').value='';
  document.getElementById('addOfficeIcon').value='🏢';
  document.getElementById('addOfficeModal').classList.add('open');
}
function saveAddOffice(){
  const name=document.getElementById('addOfficeName').value.trim();
  if(!name){alert('Section name is required.');return;}
  const id='sec_'+Date.now();
  const icon=document.getElementById('addOfficeIcon').value.trim()||'🏢';
  const desc=document.getElementById('addOfficeDesc').value.trim()||'Section';
  const source=document.getElementById('addOfficeId').value;
  document.getElementById('addOfficeModal').classList.remove('open');
  if(source==='municipal'){
    const newDept={id,name,desc,icon,color:'#1e3a6e',count:0};
    window.adminOfficeDepts.push(newDept);
    staffData[id]=[];
    logAction(`Added section: ${name} to Admin Office`);
    showSyncToast(`✅ ${name} added`);
    renderMunicipalView();
    return;
  }
  const officeId=source||currentOfficeId;
  if(!officeId||!officeData[officeId]){alert('No office selected.');return;}
  const newDept={id,name,desc,icon,color:'#1e3a6e',count:0};
  officeData[officeId].depts.push(newDept);
  staffData[id]=[];
  logAction(`Added section: ${name} to ${officeData[officeId].name}`);
  showSyncToast(`✅ ${name} added`);
  showOfficeDept(officeId);
}
function openEditOfficeModal(officeId,deptId){
  const office=officeData[officeId];if(!office)return;
  const dept=office.depts.find(d=>d.id===deptId);if(!dept)return;
  document.getElementById('editOfficeOfficeId').value=officeId;
  document.getElementById('editOfficeDeptId').value=deptId;
  document.getElementById('editOfficeName').value=dept.name;
  document.getElementById('editOfficeDesc').value=dept.desc||'';
  document.getElementById('editOfficeIcon').value=dept.icon||'🏢';
  document.getElementById('editOfficeModal').classList.add('open');
}
function saveEditOffice(){
  const officeId=document.getElementById('editOfficeOfficeId').value;
  const deptId=document.getElementById('editOfficeDeptId').value;
  document.getElementById('editOfficeModal').classList.remove('open');
  if(officeId==='municipal'){
    const dept=window.adminOfficeDepts.find(d=>d.id===deptId);if(!dept)return;
    dept.name=document.getElementById('editOfficeName').value.trim()||dept.name;
    dept.desc=document.getElementById('editOfficeDesc').value.trim()||dept.desc;
    dept.icon=document.getElementById('editOfficeIcon').value.trim()||dept.icon;
    logAction(`Edited admin section: ${dept.name}`);
    showSyncToast(`✏️ ${dept.name} updated`);
    renderMunicipalView();
    return;
  }
  const office=officeData[officeId];if(!office)return;
  const dept=office.depts.find(d=>d.id===deptId);if(!dept)return;
  dept.name=document.getElementById('editOfficeName').value.trim()||dept.name;
  dept.desc=document.getElementById('editOfficeDesc').value.trim()||dept.desc;
  dept.icon=document.getElementById('editOfficeIcon').value.trim()||dept.icon;
  logAction(`Edited section: ${dept.name}`);
  showSyncToast(`✏️ ${dept.name} updated`);
  showOfficeDept(officeId);
}
function openEditAdminDeptModal(deptId){
  const dept=window.adminOfficeDepts.find(d=>d.id===deptId);if(!dept)return;
  document.getElementById('editOfficeOfficeId').value='municipal';
  document.getElementById('editOfficeDeptId').value=deptId;
  document.getElementById('editOfficeName').value=dept.name;
  document.getElementById('editOfficeDesc').value=dept.desc||'';
  document.getElementById('editOfficeIcon').value=dept.icon||'🏢';
  document.getElementById('editOfficeModal').classList.add('open');
}
function deleteAdminDept(deptId){
  const dept=window.adminOfficeDepts.find(d=>d.id===deptId);if(!dept)return;
  const staffCount=(staffData[deptId]||[]).length;
  if(!confirm(`Move section "${dept.name}" to Recycle Bin?${staffCount>0?` (${staffCount} personnel records will be saved and can be restored)`:''}`))return;
  // Store in recycle bin
  const binEntry={
    _binType:'office_section',
    _deletedAt:new Date().toISOString(),
    _sourceOffice:'municipal',
    _sourceOfficeName:'Admin Office',
    id:deptId,
    name:dept.name,
    icon:dept.icon||'🏢',
    desc:dept.desc||'',
    color:dept.color||'#1e3a6e',
    count:dept.count||0,
    staff:JSON.parse(JSON.stringify(staffData[deptId]||[]))
  };
  recycleBin.unshift(binEntry);
  localStorage.setItem('mets_recycle',JSON.stringify(recycleBin));
  updateRecycleBinCount();
  window.adminOfficeDepts=window.adminOfficeDepts.filter(d=>d.id!==deptId);
  delete staffData[deptId];
  logAction(`Moved admin section to Recycle Bin: ${dept.name}`);
  showSyncToast(`🗑 ${dept.name} moved to Recycle Bin`);
  renderMunicipalView();
}
function deleteOfficeSection(officeId,deptId){
  const office=officeData[officeId];if(!office)return;
  const dept=office.depts.find(d=>d.id===deptId);if(!dept)return;
  const staffCount=(staffData[deptId]||[]).length;
  if(!confirm(`Move section "${dept.name}" to Recycle Bin?${staffCount>0?` (${staffCount} personnel records will be saved and can be restored)`:''}`))return;
  // Store in recycle bin
  const binEntry={
    _binType:'office_section',
    _deletedAt:new Date().toISOString(),
    _sourceOffice:officeId,
    _sourceOfficeName:office.name,
    id:deptId,
    name:dept.name,
    icon:dept.icon||'🏢',
    desc:dept.desc||'',
    color:dept.color||'#1e3a6e',
    count:dept.count||0,
    staff:JSON.parse(JSON.stringify(staffData[deptId]||[]))
  };
  recycleBin.unshift(binEntry);
  localStorage.setItem('mets_recycle',JSON.stringify(recycleBin));
  updateRecycleBinCount();
  office.depts=office.depts.filter(d=>d.id!==deptId);
  delete staffData[deptId];
  logAction(`Moved section to Recycle Bin: ${dept.name} from ${office.name}`);
  showSyncToast(`🗑 ${dept.name} moved to Recycle Bin`);
  showOfficeDept(officeId);
}

// ══════════════════════════════════════════════════════════
// PERSONNEL MANAGEMENT (Add, Edit, Delete)
// ══════════════════════════════════════════════════════════
function openAddPersonnelModal(){
  ['addPersName','addPersPos','addPersAge','addPersAddress','addPersContact','addPersYos'].forEach(id=>{document.getElementById(id).value='';});
  document.getElementById('addPersStatus').value='Active';
  document.getElementById('addPersGender').value='M';
  document.getElementById('addPersModal').classList.add('open');
}
function saveAddPersonnel(){
  const name=document.getElementById('addPersName').value.trim();
  const pos=document.getElementById('addPersPos').value.trim();
  if(!name||!pos){alert('Name and Position are required.');return;}
  const deptId=currentDeptId;
  if(!deptId){alert('No department selected.');return;}
  const id='staff_'+Date.now();
  const initials=name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  const colors=['#1e3a6e','#2d7d46','#c0392b','#b7791f','#553c9a','#0d6e6e','#6b4c11'];
  const color=colors[Math.floor(Math.random()*colors.length)];
  const newStaff={
    id,name,pos,initials,color,
    age:parseInt(document.getElementById('addPersAge').value)||30,
    address:document.getElementById('addPersAddress').value.trim()||'Katipunan, ZDN',
    contact:document.getElementById('addPersContact').value.trim()||'—',
    gender:document.getElementById('addPersGender').value,
    status:document.getElementById('addPersStatus').value,
    yos:parseInt(document.getElementById('addPersYos').value)||0,
    equipment:[]
  };
  staffData[deptId]=staffData[deptId]||[];
  staffData[deptId].push(newStaff);
  document.getElementById('addPersModal').classList.remove('open');
  logAction(`Added personnel: ${name} to ${deptId}`);
  showSyncToast(`✅ ${name} added`);
  buildAlertsPanel();buildStatusChart();updateDashStats();
  showStaff(deptId);
}
function openEditPersonnelModal(deptId,staffId){
  const staff=(staffData[deptId]||[]).find(s=>s.id===staffId);if(!staff)return;
  document.getElementById('editPersDeptId').value=deptId;
  document.getElementById('editPersStaffId').value=staffId;
  document.getElementById('editPersName').value=staff.name;
  document.getElementById('editPersPos').value=staff.pos;
  document.getElementById('editPersAge').value=staff.age||'';
  document.getElementById('editPersAddress').value=staff.address||'';
  document.getElementById('editPersContact').value=staff.contact||'';
  document.getElementById('editPersYos').value=staff.yos||0;
  document.getElementById('editPersGender').value=staff.gender||'M';
  document.getElementById('editPersStatus').value=staff.status||'Active';
  document.getElementById('editPersModal').classList.add('open');
}
function saveEditPersonnel(){
  const deptId=document.getElementById('editPersDeptId').value;
  const staffId=document.getElementById('editPersStaffId').value;
  const staff=(staffData[deptId]||[]).find(s=>s.id===staffId);if(!staff)return;
  staff.name=document.getElementById('editPersName').value.trim()||staff.name;
  staff.pos=document.getElementById('editPersPos').value.trim()||staff.pos;
  staff.age=parseInt(document.getElementById('editPersAge').value)||staff.age;
  staff.address=document.getElementById('editPersAddress').value.trim()||staff.address;
  staff.contact=document.getElementById('editPersContact').value.trim()||staff.contact;
  staff.yos=parseInt(document.getElementById('editPersYos').value)||staff.yos;
  staff.gender=document.getElementById('editPersGender').value;
  staff.status=document.getElementById('editPersStatus').value;
  staff.initials=staff.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  document.getElementById('editPersModal').classList.remove('open');
  logAction(`Edited personnel: ${staff.name}`);
  showSyncToast(`✏️ ${staff.name} updated`);
  showStaff(deptId);
}
function deletePersonnel(deptId,staffId){
  const list=staffData[deptId]||[];
  const staff=list.find(s=>s.id===staffId);if(!staff)return;
  const eqCount=(staff.equipment||[]).length;
  if(!confirm(`Delete "${staff.name}"?${eqCount>0?` Their ${eqCount} equipment item(s) will be moved to Recycle Bin.`:''}`))return;
  // Move equipment to recycle bin first
  if(staff.equipment&&staff.equipment.length>0){
    staff.equipment.forEach(eq=>{
      const deleted={...eq,_deletedFrom:deptId,_deletedAt:new Date().toISOString(),_ownerName:staff.name};
      recycleBin.unshift(deleted);
    });
    localStorage.setItem('mets_recycle',JSON.stringify(recycleBin));
    updateRecycleBinCount();
  }
  staffData[deptId]=list.filter(s=>s.id!==staffId);
  logAction(`Deleted personnel: ${staff.name} from ${deptId}`);
  showSyncToast(`🗑 ${staff.name} deleted`);
  buildAlertsPanel();buildStatusChart();updateDashStats();
  showStaff(deptId);
}

function deleteEquipmentByEqId(eqId,deptId){
  if(!confirm('Move this equipment to Recycle Bin?'))return;
  const list=staffData[deptId];if(!list)return;
  for(const s of list){
    if(!s.equipment)continue;
    const idx=s.equipment.findIndex(e=>e.id===eqId);
    if(idx>=0){
      const deleted=s.equipment.splice(idx,1)[0];
      deleted._deletedFrom=deptId;deleted._deletedAt=new Date().toISOString();deleted._ownerName=s.name;
      recycleBin.unshift(deleted);
      localStorage.setItem('mets_recycle',JSON.stringify(recycleBin));
      updateRecycleBinCount();
      logAction(`Deleted equipment ${eqId} from master list`);
      showSyncToast(`🗑 ${deleted.name} moved to Recycle Bin`);
      buildAlertsPanel();buildStatusChart();updateDashStats();
      renderEquipmentMaster();
      return;
    }
  }
}

// ══════════════════════════════════════════════════════════
// ACCOUNTABILITY CHAIN / TRANSFER HISTORY
// ══════════════════════════════════════════════════════════
let transferStore={};
function getTransfers(eqId){
  const raw=localStorage.getItem('mets_transfers');
  if(!raw)return[];
  const all=JSON.parse(raw);
  return(all[eqId]||[]);
}
function saveTransfers(eqId,arr){
  const raw=localStorage.getItem('mets_transfers');
  const all=raw?JSON.parse(raw):{};
  all[eqId]=arr;
  localStorage.setItem('mets_transfers',JSON.stringify(all));
}
function openChainModal(eqId,eqName,ownerName){
  const records=getTransfers(eqId);
  const html=`
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
    <div><div class="modal-title" style="margin-bottom:2px">🔄 Asset Transfer</div>
    <div class="modal-sub" style="margin-bottom:0">${eqId} · ${eqName} · Current: ${ownerName}</div></div>
  </div>
  <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:14px">
    <div style="font-size:0.78rem;font-weight:700;color:var(--text-dark);margin-bottom:10px">📝 Add Transfer Record</div>
    <div class="modal-form-grid" style="grid-template-columns:1fr 1fr;">
      <div class="modal-form-row"><label>From Custodian</label><input id="trFrom" placeholder="Previous custodian"></div>
      <div class="modal-form-row"><label>To Custodian</label><input id="trTo" placeholder="New custodian"></div>
      <div class="modal-form-row"><label>From Office</label><input id="trFromOffice" placeholder="Previous office"></div>
      <div class="modal-form-row"><label>To Office</label><input id="trToOffice" placeholder="New office"></div>
      <div class="modal-form-row"><label>Transfer Date</label><input type="date" id="trDate"></div>
      <div class="modal-form-row"><label>Approving Officer</label><input id="trOfficer" placeholder="Name & position"></div>
      <div class="modal-form-row" style="grid-column:1/-1"><label>Reason</label><input id="trReason" placeholder="Reason for transfer"></div>
      <div class="modal-form-row" style="grid-column:1/-1"><label>Remarks</label><input id="trRemarks" placeholder="Optional remarks"></div>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:8px">
      <button class="action-btn add" onclick="saveTransferRecord('${eqId}','${eqName.replace(/'/g,"&#39;")}','${ownerName.replace(/'/g,"&#39;")}')" style="padding:6px 16px">✅ Add Transfer Record</button>
    </div>
  </div>
  <div style="font-size:0.78rem;font-weight:700;color:var(--text-dark);margin-bottom:10px">📋 Transfer History (${records.length} records)</div>
  <div id="chainTimeline">${renderChainTimeline(records)}</div>`;
  showBigModal('chainModal',html);
}
function renderChainTimeline(records){
  if(!records.length)return`<div class="empty-state"><div class="es-icon">🔄</div><p>No transfer records yet</p></div>`;
  return`<div class="chain-timeline">${records.slice().reverse().map(r=>`
  <div class="chain-entry gso-card" style="margin-left:8px">
    <div class="chain-entry-head">
      <span class="gso-chip gso-chip-navy">${r.date||'—'}</span>
      <span style="font-size:0.72rem;font-weight:700;color:var(--text-dark)">${r.from||'—'} → ${r.to||'—'}</span>
    </div>
    <div class="gso-detail-grid">
      <div class="gso-detail-row"><div class="gso-detail-label">From Office</div><div class="gso-detail-val">${r.fromOffice||'—'}</div></div>
      <div class="gso-detail-row"><div class="gso-detail-label">To Office</div><div class="gso-detail-val">${r.toOffice||'—'}</div></div>
      <div class="gso-detail-row"><div class="gso-detail-label">Reason</div><div class="gso-detail-val">${r.reason||'—'}</div></div>
      <div class="gso-detail-row"><div class="gso-detail-label">Approving Officer</div><div class="gso-detail-val">${r.officer||'—'}</div></div>
      ${r.remarks?`<div class="gso-detail-row" style="grid-column:1/-1"><div class="gso-detail-label">Remarks</div><div class="gso-detail-val">${r.remarks}</div></div>`:''}
    </div>
  </div>`).join('')}</div>`;
}
function saveTransferRecord(eqId,eqName,ownerName){
  const from=document.getElementById('trFrom').value.trim();
  const to=document.getElementById('trTo').value.trim();
  const date=document.getElementById('trDate').value;
  const fromOffice=document.getElementById('trFromOffice').value.trim();
  const toOffice=document.getElementById('trToOffice').value.trim();
  const reason=document.getElementById('trReason').value.trim();
  const officer=document.getElementById('trOfficer').value.trim();
  const remarks=document.getElementById('trRemarks').value.trim();
  if(!from||!to||!date){alert('From Custodian, To Custodian, and Transfer Date are required.');return;}
  const records=getTransfers(eqId);
  records.push({from,to,date,fromOffice,toOffice,reason,officer,remarks,recordedAt:new Date().toISOString()});
  saveTransfers(eqId,records);
  logAction(`Transfer recorded for ${eqId}: ${from} → ${to}`);
  showSyncToast(`🔄 Transfer recorded: ${from} → ${to}`);
  document.getElementById('chainTimeline').innerHTML=renderChainTimeline(records);
  ['trFrom','trTo','trFromOffice','trToOffice','trReason','trOfficer','trRemarks'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('trDate').value='';
  updateGSORecordsBadge();
}

// ══════════════════════════════════════════════════════════
// MAINTENANCE / REPAIR LOG
// ══════════════════════════════════════════════════════════
function getRepairs(eqId){
  const raw=localStorage.getItem('mets_repairs');
  if(!raw)return[];
  const all=JSON.parse(raw);
  return(all[eqId]||[]);
}
function saveRepairs(eqId,arr){
  const raw=localStorage.getItem('mets_repairs');
  const all=raw?JSON.parse(raw):{};
  all[eqId]=arr;
  localStorage.setItem('mets_repairs',JSON.stringify(all));
}
function openRepairModal(eqId,eqName){
  const records=getRepairs(eqId);
  const totalCost=records.reduce((s,r)=>s+(parseFloat(r.cost)||0),0);
  const html=`
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
    <div><div class="modal-title" style="margin-bottom:2px">🔧 Maintenance and Repair</div>
    <div class="modal-sub" style="margin-bottom:0">${eqId} · ${eqName}</div></div>
    <div style="margin-left:auto;display:flex;align-items:center;gap:8px">
      <span class="repair-total-chip">Total Repairs: ₱${totalCost.toLocaleString('en-PH',{minimumFractionDigits:2})}</span>
    </div>
  </div>
  <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:14px">
    <div style="font-size:0.78rem;font-weight:700;color:var(--text-dark);margin-bottom:10px">➕ Log Repair / Maintenance</div>
    <div class="modal-form-grid" style="grid-template-columns:1fr 1fr;">
      <div class="modal-form-row"><label>Repair Type</label>
        <select id="repType" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text-dark);font-size:0.78rem;font-family:'Source Sans 3',sans-serif">
          <option>Preventive Maintenance</option><option>Corrective Repair</option><option>Parts Replacement</option><option>Calibration</option><option>Cleaning & Inspection</option><option>Major Overhaul</option><option>Other</option>
        </select>
      </div>
      <div class="modal-form-row"><label>Repair Date</label><input type="date" id="repDate"></div>
      <div class="modal-form-row"><label>Cost (₱)</label><input type="number" min="0" step="0.01" id="repCost" placeholder="0.00"></div>
      <div class="modal-form-row"><label>Resulting Status</label>
        <select id="repStatus" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text-dark);font-size:0.78rem;font-family:'Source Sans 3',sans-serif">
          <option>Serviceable</option><option>Unserviceable</option><option>Damaged</option><option>For Further Repair</option>
        </select>
      </div>
      <div class="modal-form-row"><label>Technician / Shop</label><input id="repTech" placeholder="Name or shop"></div>
      <div class="modal-form-row"><label>Coordinator</label><input id="repCoord" placeholder="GSO coordinator"></div>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:8px">
      <button class="action-btn add" onclick="saveRepairRecord('${eqId}','${eqName.replace(/'/g,"&#39;")}')" style="padding:6px 16px">✅ Save Repair Record</button>
    </div>
  </div>
  <div style="font-size:0.78rem;font-weight:700;color:var(--text-dark);margin-bottom:10px">📋 Repair History (${records.length} records)</div>
  <div id="repairTimeline">${renderRepairTimeline(records)}</div>`;
  showBigModal('repairModal',html);
}
function renderRepairTimeline(records){
  if(!records.length)return`<div class="empty-state"><div class="es-icon">🔧</div><p>No repair records yet</p></div>`;
  return records.slice().reverse().map(r=>`
  <div class="gso-card">
    <div class="gso-card-header">
      <div>
        <div class="gso-card-title">${r.type||'Repair'}</div>
        <div class="gso-card-meta">${r.date||'—'} · ${r.tech||'—'}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700;font-size:0.85rem;color:var(--orange)">₱${(parseFloat(r.cost)||0).toLocaleString('en-PH',{minimumFractionDigits:2})}</div>
        <span class="gso-chip ${r.status==='Serviceable'?'gso-chip-green':'gso-chip-orange'}">${r.status||'—'}</span>
      </div>
    </div>
    <div class="gso-detail-grid">
      <div class="gso-detail-row"><div class="gso-detail-label">Coordinator</div><div class="gso-detail-val">${r.coord||'—'}</div></div>
    </div>
  </div>`).join('');
}
function saveRepairRecord(eqId,eqName){
  const type=document.getElementById('repType').value;
  const date=document.getElementById('repDate').value;
  const cost=document.getElementById('repCost').value;
  const status=document.getElementById('repStatus').value;
  const tech=document.getElementById('repTech').value.trim();
  const coord=document.getElementById('repCoord').value.trim();
  if(!date){alert('Repair Date is required.');return;}
  const records=getRepairs(eqId);
  records.push({type,date,cost,status,tech,coord,recordedAt:new Date().toISOString()});
  saveRepairs(eqId,records);
  logAction(`Repair logged for ${eqId}: ${type} on ${date}`);
  showSyncToast(`🔧 Repair record saved`);
  const totalCost=records.reduce((s,r)=>s+(parseFloat(r.cost)||0),0);
  const tc=document.querySelector('.repair-total-chip');if(tc)tc.textContent=`Total Repairs: ₱${totalCost.toLocaleString('en-PH',{minimumFractionDigits:2})}`;
  document.getElementById('repairTimeline').innerHTML=renderRepairTimeline(records);
  ['repCost','repTech','repCoord'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('repDate').value='';
  updateGSORecordsBadge();
}

// ══════════════════════════════════════════════════════════
// BORROW / ISSUANCE SLIP
// ══════════════════════════════════════════════════════════
function getBorrows(eqId){
  const raw=localStorage.getItem('mets_borrows');
  if(!raw)return[];
  const all=JSON.parse(raw);
  return(all[eqId]||[]);
}
function saveBorrows(eqId,arr){
  const raw=localStorage.getItem('mets_borrows');
  const all=raw?JSON.parse(raw):{};
  all[eqId]=arr;
  localStorage.setItem('mets_borrows',JSON.stringify(all));
}
function nextSlipNumber(){
  const n=(parseInt(localStorage.getItem('mets_slip_counter')||'0'))+1;
  localStorage.setItem('mets_slip_counter',n);
  return'BIS-'+String(n).padStart(5,'0');
}
function getBorrowStatus(b){
  if(b.returnedDate)return'Returned';
  const exp=new Date(b.expectedReturn);
  if(exp<new Date())return'Overdue';
  return'Borrowed';
}
function openBorrowModal(eqId,eqName,ownerName){
  const records=getBorrows(eqId);
  const html=`
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
    <div><div class="modal-title" style="margin-bottom:2px">📤 Borrow / Issuance Slip</div>
    <div class="modal-sub" style="margin-bottom:0">${eqId} · ${eqName} · Accountable: ${ownerName}</div></div>
  </div>
  <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:14px">
    <div style="font-size:0.78rem;font-weight:700;color:var(--text-dark);margin-bottom:10px">📝 Issue New Borrow Slip</div>
    <div class="modal-form-grid" style="grid-template-columns:1fr 1fr;">
      <div class="modal-form-row"><label>Borrower Name</label><input id="bwBorrower" placeholder="Full name of borrower"></div>
      <div class="modal-form-row"><label>Borrower Office</label><input id="bwOffice" placeholder="Office/department"></div>
      <div class="modal-form-row"><label>Purpose</label><input id="bwPurpose" placeholder="Purpose of borrowing"></div>
      <div class="modal-form-row"><label>Issuing Officer</label><input id="bwOfficer" placeholder="GSO issuing officer"></div>
      <div class="modal-form-row"><label>Date Out</label><input type="date" id="bwDateOut"></div>
      <div class="modal-form-row"><label>Expected Return</label><input type="date" id="bwExpReturn"></div>
      <div class="modal-form-row"><label>Item Condition Out</label>
        <select id="bwCondition" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text-dark);font-size:0.78rem;font-family:'Source Sans 3',sans-serif">
          <option>Good</option><option>Fair</option><option>Poor</option>
        </select>
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:8px">
      <button class="action-btn add" onclick="saveBorrowRecord('${eqId}','${eqName.replace(/'/g,"&#39;")}','${ownerName.replace(/'/g,"&#39;")}')" style="padding:6px 16px">📤 Issue Slip</button>
    </div>
  </div>
  <div style="font-size:0.78rem;font-weight:700;color:var(--text-dark);margin-bottom:10px">📋 Borrow Records (${records.length})</div>
  <div id="borrowTimeline">${renderBorrowTimeline(eqId,records)}</div>`;
  showBigModal('borrowModal',html);
}
function renderBorrowTimeline(eqId,records){
  if(!records.length)return`<div class="empty-state"><div class="es-icon">📤</div><p>No borrow records yet</p></div>`;
  return records.slice().reverse().map((r,revIdx)=>{
    const origIdx=records.length-1-revIdx;
    const status=getBorrowStatus(r);
    const statusClass=status==='Returned'?'borrow-status-returned':status==='Overdue'?'borrow-status-overdue':'borrow-status-borrowed';
    const statusChip=status==='Returned'?'🟢 Returned':status==='Overdue'?'🔴 Overdue':'🟠 Borrowed';
    const chipClass=status==='Returned'?'gso-chip-green':status==='Overdue'?'gso-chip-red':'gso-chip-orange';
    return`<div class="gso-card ${statusClass}" style="margin-bottom:10px">
    <div class="gso-card-header">
      <div>
        <span class="slip-number">${r.slip}</span>
        <span style="margin-left:6px;font-weight:700;font-size:0.82rem;color:var(--text-dark)">${r.borrower||'—'}</span>
        <div class="gso-card-meta">${r.office||'—'} · ${r.dateOut||'—'}</div>
      </div>
      <span class="gso-chip ${chipClass}">${statusChip}</span>
    </div>
    <div class="gso-detail-grid">
      <div class="gso-detail-row"><div class="gso-detail-label">Purpose</div><div class="gso-detail-val">${r.purpose||'—'}</div></div>
      <div class="gso-detail-row"><div class="gso-detail-label">Expected Return</div><div class="gso-detail-val">${r.expectedReturn||'—'}</div></div>
      <div class="gso-detail-row"><div class="gso-detail-label">Issuing Officer</div><div class="gso-detail-val">${r.officer||'—'}</div></div>
      <div class="gso-detail-row"><div class="gso-detail-label">Condition Out</div><div class="gso-detail-val">${r.condition||'—'}</div></div>
      ${r.returnedDate?`<div class="gso-detail-row"><div class="gso-detail-label">Return Date</div><div class="gso-detail-val">${r.returnedDate}</div></div>`:''}
      ${r.returnCondition?`<div class="gso-detail-row"><div class="gso-detail-label">Return Condition</div><div class="gso-detail-val">${r.returnCondition}</div></div>`:''}
    </div>
    ${status!=='Returned'?`<div style="margin-top:8px"><button class="mark-returned-btn" onclick="markBorrowReturned('${eqId}',${origIdx})">✅ Mark Returned</button></div>`:''}
  </div>`;
  }).join('');
}
function saveBorrowRecord(eqId,eqName,ownerName){
  const borrower=document.getElementById('bwBorrower').value.trim();
  const office=document.getElementById('bwOffice').value.trim();
  const purpose=document.getElementById('bwPurpose').value.trim();
  const officer=document.getElementById('bwOfficer').value.trim();
  const dateOut=document.getElementById('bwDateOut').value;
  const expectedReturn=document.getElementById('bwExpReturn').value;
  const condition=document.getElementById('bwCondition').value;
  if(!borrower||!dateOut){alert('Borrower name and Date Out are required.');return;}
  const records=getBorrows(eqId);
  const slip=nextSlipNumber();
  records.push({slip,borrower,office,purpose,officer,dateOut,expectedReturn,condition,eqId,eqName,ownerName,recordedAt:new Date().toISOString()});
  saveBorrows(eqId,records);
  logAction(`Borrow slip ${slip} issued for ${eqId} to ${borrower}`);
  showSyncToast(`📤 Slip ${slip} issued to ${borrower}`);
  document.getElementById('borrowTimeline').innerHTML=renderBorrowTimeline(eqId,records);
  const h=document.querySelector('[onclick*="borrowTimeline"]');
  if(h)h.parentElement.querySelector('div')?.querySelector('div:last-child')?.firstElementChild?.textContent && 0;
  ['bwBorrower','bwOffice','bwPurpose','bwOfficer'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  ['bwDateOut','bwExpReturn'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  updateGSORecordsBadge();
}
function markBorrowReturned(eqId,idx){
  const records=getBorrows(eqId);
  if(!records[idx])return;
  const cond=prompt('Item condition upon return (Good/Fair/Poor):','Good');
  if(cond===null)return;
  records[idx].returnedDate=new Date().toLocaleDateString('en-PH');
  records[idx].returnCondition=cond||'Good';
  saveBorrows(eqId,records);
  logAction(`Borrow slip ${records[idx].slip} marked returned for ${eqId}`);
  showSyncToast(`✅ Item returned — Slip ${records[idx].slip}`);
  document.getElementById('borrowTimeline').innerHTML=renderBorrowTimeline(eqId,records);
  updateGSORecordsBadge();
}

// ══════════════════════════════════════════════════════════
// SHARED BIG MODAL
// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
// SCAN LOCATION HISTORY (latitude / longitude recorded at each scan)
// ══════════════════════════════════════════════════════════
function scanCellHTML(eq){
  const hist=eq.scanHistory||[];
  if(!eq.lastScannedTime&&!hist.length)return '<span style="font-size:0.7rem;color:var(--text-light);white-space:nowrap">Not yet scanned</span>';
  const when=new Date(eq.lastScannedTime||hist[0].time).toLocaleString('en-PH',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const has=eq.lastScanLat!=null&&eq.lastScanLng!=null;
  const coords=has?`${Number(eq.lastScanLat).toFixed(5)}, ${Number(eq.lastScanLng).toFixed(5)}${eq.lastScanDemo?' · demo':''}`:'Location not captured';
  return `<div style="font-size:0.68rem;white-space:nowrap">${pfEsc(when)}</div>
    <div class="pf-sub" style="white-space:nowrap;margin-bottom:3px">${pfEsc(coords)}</div>
    <button class="eq-col-btn scan" onclick="openScanHistoryModal('${pfEsc(eq.id)}')">📍 History</button>`;
}
function openScanHistoryModal(eqId){
  let eq=null,owner='—';
  for(const list of Object.values(staffData)){
    if(!Array.isArray(list))continue;
    for(const st of list){
      const f=st.equipment&&st.equipment.find(e=>e.id===eqId);
      if(f){eq=f;owner=st.name;break;}
    }
    if(eq)break;
  }
  const hist=(eq&&eq.scanHistory)||[];
  const SRC={qr_scan:'Main scanner',qr_mobile_scan:'Mobile scanner'};
  const rows=hist.map((h,i)=>{
    const has=h.lat!=null&&h.lng!=null;
    return `<tr>
      <td>${hist.length-i}</td>
      <td style="white-space:nowrap">${pfEsc(new Date(h.time).toLocaleString('en-PH',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}))}</td>
      <td>${has?Number(h.lat).toFixed(6):'<span class="pf-sub">—</span>'}${h.demo?' <span class="gso-chip gso-chip-navy">demo</span>':''}</td>
      <td>${has?Number(h.lng).toFixed(6):'<span class="pf-sub">—</span>'}</td>
      <td>${has&&h.acc!=null?'±'+h.acc+' m':'<span class="pf-sub">—</span>'}</td>
      <td>${pfEsc(SRC[h.source]||h.source||'—')}</td>
      <td>${has?`<a href="https://www.google.com/maps?q=${h.lat},${h.lng}" target="_blank" rel="noopener" style="color:var(--gold)">View on map ↗</a>`:'<span class="pf-sub">Location not captured</span>'}</td>
    </tr>`;
  }).join('');
  const html=`
    <div class="modal-title" style="margin-bottom:2px">📍 Scan Location History</div>
    <div class="modal-sub">${pfEsc(eqId)} · ${pfEsc(eq?eq.name:'')} · ${pfEsc(owner)}</div>
    ${hist.length?`<div style="overflow-x:auto"><table class="pf-table" style="min-width:0"><thead><tr><th>#</th><th>Date &amp; time</th><th>Latitude</th><th>Longitude</th><th>Accuracy</th><th>Scanned with</th><th>Map</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="pf-sub" style="margin-top:8px">Shows the last ${hist.length} scan(s). Coordinates come from the scanning device's geolocation and are saved each time the QR code is scanned.</div>`
    :`<div class="empty-state" style="padding:24px"><div class="es-icon">📍</div><p>No scans recorded yet. The latitude and longitude are saved each time this asset's QR code is scanned.</p></div>`}`;
  showBigModal('scanHistModal',html);
}

function showBigModal(id,html){
  let el=document.getElementById(id);
  if(!el){
    el=document.createElement('div');
    el.id=id;
    el.className='modal-overlay';
    el.innerHTML=`<div class="modal-box" style="max-width:700px;width:95%;max-height:90vh;overflow-y:auto;text-align:left;">
      <button class="modal-close" onclick="document.getElementById('${id}').classList.remove('open')">✕</button>
      <div id="${id}-content"></div>
    </div>`;
    el.addEventListener('click',function(e){if(e.target===this)this.classList.remove('open');});
    document.body.appendChild(el);
  }
  document.getElementById(id+'-content').innerHTML=html;
  el.classList.add('open');
}

// ══════════════════════════════════════════════════════════
// ANNUAL AUDIT & AUTO-ALERT MONITORING
// ══════════════════════════════════════════════════════════
let auditInactivityDays=90;
function getAuditAlerts(){
  const allEq=getAllEquipment();
  const now=new Date();
  const yearStart=new Date(now.getFullYear(),0,1);
  const alerts={neverScanned:[],notThisYear:[]};
  for(const eq of allEq){
    if(!eq.lastScanDate){
      alerts.neverScanned.push(eq);
    } else {
      const last=new Date(eq.lastScanDate);
      if(last<yearStart) alerts.notThisYear.push(eq);
    }
  }
  return alerts;
}
function updateGSORecordsBadge(){
  try{renderDashRecords();}catch(e){}
  const alerts=getAuditAlerts();
  const alertCount=alerts.neverScanned.length+alerts.notThisYear.length;
  const allBorrows=getAllBorrows();
  const overdue=allBorrows.filter(b=>getBorrowStatus(b)==='Overdue').length;
  const total=alertCount+overdue;
  const badge=document.getElementById('gsoRecordsBadge');
  if(badge){badge.textContent=total;badge.style.display=total>0?'':'none';}
  // update tab badges if visible
  const ab=document.getElementById('gsoBadgeAlerts');if(ab)ab.textContent=alertCount;
  const bb=document.getElementById('gsoBadgeBorrows');if(bb)bb.textContent=allBorrows.length;
  const rb=document.getElementById('gsoBadgeRepairs');if(rb)rb.textContent=getAllRepairCount();
  const tb=document.getElementById('gsoBadgeTransfers');if(tb)tb.textContent=getAllTransferCount();
}
function getAllBorrows(){
  const raw=localStorage.getItem('mets_borrows');
  if(!raw)return[];
  const all=JSON.parse(raw);
  return Object.entries(all).flatMap(([eqId,arr])=>arr.map(b=>({...b,eqId})));
}
function getAllRepairCount(){
  const raw=localStorage.getItem('mets_repairs');
  if(!raw)return 0;
  const all=JSON.parse(raw);
  return Object.values(all).reduce((s,arr)=>s+arr.length,0);
}
function getAllTransferCount(){
  const raw=localStorage.getItem('mets_transfers');
  if(!raw)return 0;
  const all=JSON.parse(raw);
  return Object.values(all).reduce((s,arr)=>s+arr.length,0);
}

function showGSORecords(){
  setBreadcrumb([{label:'Dashboard',fn:'goHome()'},{label:'GSO Records'}]);
  const yr=document.getElementById('gsoCurrentYear');
  if(yr)yr.textContent=new Date().getFullYear();
  updateGSORecordsBadge();
  switchGSOTab('alerts',document.getElementById('gsoTab-alerts'));
  showView('gsorecords');
  logAction('Opened GSO Records Module');
}
let currentGSOTab='alerts';
function switchGSOTab(tab,btn){
  currentGSOTab=tab;
  document.querySelectorAll('.gso-tab').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  renderGSOTab(tab);
}
function renderGSOTab(tab){
  const c=document.getElementById('gsoTabContent');
  if(!c)return;
  if(tab==='alerts') renderAuditAlertsTab(c);
  else if(tab==='transfers') renderTransfersTab(c);
  else if(tab==='repairs') renderRepairsTab(c);
  else if(tab==='borrows') renderBorrowsTab(c);
}
function renderAuditAlertsTab(c){
  const alerts=getAuditAlerts();
  const now=new Date();
  const inactiveThreshold=new Date(now-auditInactivityDays*24*3600*1000);
  const nv=alerts.neverScanned;
  const ny=alerts.notThisYear;
  c.innerHTML=`
  <div class="audit-config-bar">
    <label>Inactivity Alert Threshold:</label>
    <select onchange="auditInactivityDays=parseInt(this.value);renderGSOTab('alerts')" style="">
      <option value="30" ${auditInactivityDays===30?'selected':''}>30 Days</option>
      <option value="60" ${auditInactivityDays===60?'selected':''}>60 Days</option>
      <option value="90" ${auditInactivityDays===90?'selected':''}>90 Days</option>
    </select>
    <span style="font-size:0.72rem;color:var(--text-light);margin-left:auto">Scan Window: November 1 – December 31 · Semi-annual: June</span>
  </div>
  <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
    <div class="gso-card" style="flex:1;min-width:180px;border-left:3px solid var(--red);padding:14px">
      <div style="font-size:1.4rem;font-weight:700;color:var(--red)">${nv.length}</div>
      <div style="font-size:0.72rem;font-weight:600;color:var(--text-dark)">🔴 Never Scanned</div>
      <div style="font-size:0.65rem;color:var(--text-light)">No QR scan record at all</div>
    </div>
    <div class="gso-card" style="flex:1;min-width:180px;border-left:3px solid var(--orange);padding:14px">
      <div style="font-size:1.4rem;font-weight:700;color:var(--orange)">${ny.length}</div>
      <div style="font-size:0.72rem;font-weight:600;color:var(--text-dark)">🟠 Not Scanned This Year</div>
      <div style="font-size:0.65rem;color:var(--text-light)">Last scan before Jan 1, ${now.getFullYear()}</div>
    </div>
    <div class="gso-card" style="flex:1;min-width:180px;border-left:3px solid #2b5ca8;padding:14px">
      <div style="font-size:1.4rem;font-weight:700;color:#2b5ca8">${nv.length+ny.length}</div>
      <div style="font-size:0.72rem;font-weight:600;color:var(--text-dark)">⚠️ Total Unscanned</div>
      <div style="font-size:0.65rem;color:var(--text-light)">Requires COA verification</div>
    </div>
  </div>
  ${nv.length?`<div style="font-size:0.78rem;font-weight:700;color:var(--red);margin-bottom:8px">🔴 Never Scanned (${nv.length})</div>
  ${nv.map(eq=>`<div class="gso-card audit-alert-never">
    <div class="gso-card-header"><div class="gso-card-title">${eq.id} — ${eq.name}</div><span class="gso-chip gso-chip-red">Never Scanned</span></div>
    <div class="gso-detail-grid">
      <div class="gso-detail-row"><div class="gso-detail-label">Owner</div><div class="gso-detail-val">${eq.owner||'—'}</div></div>
      <div class="gso-detail-row"><div class="gso-detail-label">Brand</div><div class="gso-detail-val">${eq.brand||'—'}</div></div>
      <div class="gso-detail-row"><div class="gso-detail-label">Status</div><div class="gso-detail-val">${eq.status||'—'}</div></div>
      <div class="gso-detail-row"><div class="gso-detail-label">Location</div><div class="gso-detail-val">${eq.location||'Not Set'}</div></div>
    </div>
  </div>`).join('')}`:''}
  ${ny.length?`<div style="font-size:0.78rem;font-weight:700;color:var(--orange);margin-bottom:8px;margin-top:14px">🟠 Not Scanned This Year (${ny.length})</div>
  ${ny.map(eq=>{const last=new Date(eq.lastScanDate);return`<div class="gso-card audit-alert-year">
    <div class="gso-card-header"><div class="gso-card-title">${eq.id} — ${eq.name}</div><span class="gso-chip gso-chip-orange">Not This Year</span></div>
    <div class="gso-detail-grid">
      <div class="gso-detail-row"><div class="gso-detail-label">Owner</div><div class="gso-detail-val">${eq.owner||'—'}</div></div>
      <div class="gso-detail-row"><div class="gso-detail-label">Last Scanned</div><div class="gso-detail-val">${last.toLocaleDateString('en-PH')}</div></div>
      <div class="gso-detail-row"><div class="gso-detail-label">Status</div><div class="gso-detail-val">${eq.status||'—'}</div></div>
      <div class="gso-detail-row"><div class="gso-detail-label">Location</div><div class="gso-detail-val">${eq.location||'Not Set'}</div></div>
    </div>
  </div>`;}).join('')}`:''}
  ${nv.length===0&&ny.length===0?`<div class="empty-state"><div class="es-icon">✅</div><p>All equipment scanned — No COA alerts!</p></div>`:''}`;
}
function renderTransfersTab(c){
  const raw=localStorage.getItem('mets_transfers');
  const all=raw?JSON.parse(raw):{};
  const entries=Object.entries(all).flatMap(([eqId,arr])=>arr.map(r=>({...r,eqId})));
  entries.sort((a,b)=>new Date(b.recordedAt)-new Date(a.recordedAt));
  if(!entries.length){c.innerHTML=`<div class="empty-state"><div class="es-icon">🔄</div><p>No transfer records yet</p></div>`;return;}
  c.innerHTML=`<div style="font-size:0.72rem;color:var(--text-light);margin-bottom:12px">${entries.length} transfer record(s)</div>`+
  entries.map(r=>`<div class="gso-card">
    <div class="gso-card-header">
      <div><div class="gso-card-title">🔄 ${r.from||'—'} → ${r.to||'—'}</div>
      <div class="gso-card-meta">${r.eqId} · ${r.date||'—'}</div></div>
      <span class="gso-chip gso-chip-navy">${r.fromOffice||'—'} → ${r.toOffice||'—'}</span>
    </div>
    <div class="gso-detail-grid">
      <div class="gso-detail-row"><div class="gso-detail-label">Reason</div><div class="gso-detail-val">${r.reason||'—'}</div></div>
      <div class="gso-detail-row"><div class="gso-detail-label">Approving Officer</div><div class="gso-detail-val">${r.officer||'—'}</div></div>
      ${r.remarks?`<div class="gso-detail-row" style="grid-column:1/-1"><div class="gso-detail-label">Remarks</div><div class="gso-detail-val">${r.remarks}</div></div>`:''}
    </div>
  </div>`).join('');
}
function renderRepairsTab(c){
  const raw=localStorage.getItem('mets_repairs');
  const all=raw?JSON.parse(raw):{};
  const entries=Object.entries(all).flatMap(([eqId,arr])=>arr.map(r=>({...r,eqId})));
  entries.sort((a,b)=>new Date(b.recordedAt)-new Date(a.recordedAt));
  const grandTotal=entries.reduce((s,r)=>s+(parseFloat(r.cost)||0),0);
  if(!entries.length){c.innerHTML=`<div class="empty-state"><div class="es-icon">🔧</div><p>No repair records yet</p></div>`;return;}
  c.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
    <div style="font-size:0.72rem;color:var(--text-light)">${entries.length} repair record(s)</div>
    <span class="repair-total-chip">Grand Total: ₱${grandTotal.toLocaleString('en-PH',{minimumFractionDigits:2})}</span>
  </div>`+
  entries.map(r=>`<div class="gso-card">
    <div class="gso-card-header">
      <div><div class="gso-card-title">🔧 ${r.type||'Repair'} — ${r.eqId}</div>
      <div class="gso-card-meta">${r.date||'—'} · ${r.tech||'—'}</div></div>
      <div style="text-align:right"><div style="font-weight:700;color:var(--orange)">₱${(parseFloat(r.cost)||0).toLocaleString('en-PH',{minimumFractionDigits:2})}</div>
      <span class="gso-chip ${r.status==='Serviceable'?'gso-chip-green':'gso-chip-orange'}">${r.status||'—'}</span></div>
    </div>
    <div class="gso-detail-grid">
      <div class="gso-detail-row"><div class="gso-detail-label">Coordinator</div><div class="gso-detail-val">${r.coord||'—'}</div></div>
    </div>
  </div>`).join('');
}
function renderBorrowsTab(c){
  const allBorrows=getAllBorrows();
  allBorrows.sort((a,b)=>new Date(b.recordedAt)-new Date(a.recordedAt));
  const overdue=allBorrows.filter(b=>getBorrowStatus(b)==='Overdue').length;
  if(!allBorrows.length){c.innerHTML=`<div class="empty-state"><div class="es-icon">📤</div><p>No borrow/issuance records yet</p></div>`;return;}
  c.innerHTML=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <div style="font-size:0.72rem;color:var(--text-light)">${allBorrows.length} total slip(s)</div>
    ${overdue?`<span class="gso-chip gso-chip-red">⚠️ ${overdue} Overdue</span>`:'<span class="gso-chip gso-chip-green">✅ No Overdue</span>'}
  </div>`+
  allBorrows.map(b=>{
    const status=getBorrowStatus(b);
    const statusClass=status==='Returned'?'borrow-status-returned':status==='Overdue'?'borrow-status-overdue':'borrow-status-borrowed';
    const chipClass=status==='Returned'?'gso-chip-green':status==='Overdue'?'gso-chip-red':'gso-chip-orange';
    const statusIcon=status==='Returned'?'🟢':status==='Overdue'?'🔴':'🟠';
    return`<div class="gso-card ${statusClass}">
    <div class="gso-card-header">
      <div><span class="slip-number">${b.slip||'—'}</span>
      <span style="margin-left:6px;font-weight:700;font-size:0.82rem;color:var(--text-dark)">${b.borrower||'—'}</span>
      <div class="gso-card-meta">${b.eqId} · ${b.office||'—'} · Out: ${b.dateOut||'—'}</div></div>
      <span class="gso-chip ${chipClass}">${statusIcon} ${status}</span>
    </div>
    <div class="gso-detail-grid">
      <div class="gso-detail-row"><div class="gso-detail-label">Purpose</div><div class="gso-detail-val">${b.purpose||'—'}</div></div>
      <div class="gso-detail-row"><div class="gso-detail-label">Expected Return</div><div class="gso-detail-val">${b.expectedReturn||'—'}</div></div>
      ${b.returnedDate?`<div class="gso-detail-row"><div class="gso-detail-label">Returned</div><div class="gso-detail-val">${b.returnedDate} (${b.returnCondition||'—'})</div></div>`:''}
    </div>
  </div>`;}).join('');
}

// Initialize badge on load
(()=>{setTimeout(updateGSORecordsBadge,1000);})();


let _officePickerPendingNav = false;

function showMobileScanner() {
  if (!selectedOffice) {
    // Show office picker modal first
    _officePickerPendingNav = true;
    const modal = document.getElementById('officePickerModal');
    if (modal) { modal.style.display = 'flex'; }
  } else {
    _doOpenMobileScanner();
  }
}

function _doOpenMobileScanner() {
  showView('mobilescanner');
  stopMobileQRScan();
  resetMobileScanUI();
  const area = document.getElementById('scannerAreaBox');
  if (area) area.classList.add('ready');
  const hint = document.getElementById('scanHintText');
  if (hint) hint.textContent = 'Starting camera…';
  updateStatusTime();
  if(typeof initGeolocation==='function') initGeolocation();
  goTo('step-scan');
  autoStartMobileScanner(150);
}

// Close the mobile scanner and return to the previous screen (or dashboard).
function closeMobileScanner() {
  stopMobileQRScan();
  resetMobileScanUI();
  try {
    if (typeof goBack === 'function' && Array.isArray(navStack) && navStack.length > 1) {
      goBack();
      return;
    }
  } catch (e) {}
  goHome();
}

let _officePickerChosen = null;

function officePickerSelect(el, name) {
  _officePickerChosen = name;
  document.querySelectorAll('.opm-opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');
  const btn = document.getElementById('officePickerConfirmBtn');
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
}

function confirmOfficePicker() {
  if (!_officePickerChosen) return;
  const chosenOffice = _officePickerChosen;
  const pendingNav = _officePickerPendingNav;
  // Close modal first (synchronous)
  closeOfficePicker();
  // Activate scanner view (synchronous — no timeout)
  if (pendingNav) _doOpenMobileScanner();
  // Sync office into the in-scanner dropdown (DOM already present after showView)
  const matchingOpt = [...document.querySelectorAll('#officeDD .office-opt')]
    .find(o => o.textContent.trim().includes(chosenOffice));
  if (matchingOpt) {
    pickOffice(matchingOpt, chosenOffice);
  } else {
    selectedOffice = chosenOffice;
    const txt = document.getElementById('officeSelectText');
    if (txt) { txt.textContent = chosenOffice; txt.classList.remove('ph'); }
    document.querySelectorAll('#officeDD .office-opt').forEach(o => o.classList.remove('sel'));
    setText('detectedOffice', chosenOffice);
    setText('detectedGeo', currentGeo);
    const scanDetected = document.getElementById('scanDetected');
    if (scanDetected) scanDetected.style.display = 'block';
    const btn = document.getElementById('viewAssetBtn');
    if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
  }
}

function closeOfficePicker() {
  const modal = document.getElementById('officePickerModal');
  if (modal) modal.style.display = 'none';
  _officePickerPendingNav = false;
}

/* ─── MOBILE QR SCANNER SCRIPT ─── */

/* ══════════════════════════════════════════════════════════
   QR ASSET SCANNER v6 — LGU Katipunan GSO Mobile
   ──────────────────────────────────────────────────────────
   Key changes from v5:
   • 3-dot (⋮) always visible on Asset Details — matches screenshot
   • 3-dot opens Scan History, gated to GSO login
   • Login overlay slides in when non-GSO tries a gated action
   • Update Status button also requires GSO login
   • navigator.geolocation replaces static GPS label
   • QR scan shows asset publicly (no login), updates need auth
   ══════════════════════════════════════════════════════════ */


/* ── GSO CREDENTIALS (demo) ── */
const GSO_CREDS = [
  {un:'gso.oic',      pw:'gso2024!',   name:'GSO-OIC',            role:'GSO-OIC',                perm:'oic'},
  {un:'gso.officer1', pw:'officer01',  name:'R. Maglasang',       role:'Inspectorate Personnel', perm:'inspector'},
  {un:'gso.officer2', pw:'officer02',  name:'M. Salazar',         role:'Inspectorate Personnel', perm:'inspector'},
  {un:'gso.staff',    pw:'gsostaff26!',name:'GSO Office Personnel',role:'GSO Office Personnel',  perm:'gsostaff'},
  {un:'office.head',  pw:'head2026!',  name:'Municipal Office Head',role:'Municipal Office Head',perm:'officehead',office:'mayors'}
];

/* ── ASSET DATA ── */
const ALL_ASSETS = [
  {id:'KAT-2024-0087',name:'Laptop Computer',  brand:'Dell Latitude 5540',   status:'Serviceable',   location:'Accounting Office',  serial:'DLAT54-2024-00123', owner:'L. Lapinig',    amount:68500,  acq:'Mar 15, 2024', scanned:true,  updated:true},
  {id:'KAT-2024-0088',name:'Desktop Computer', brand:'HP ProDesk 400',       status:'Serviceable',   location:'Budget Office',      serial:'HP400-2024-00045',  owner:'R. Batoto',     amount:55000,  acq:'Mar 15, 2024', scanned:true,  updated:true},
  {id:'KAT-2024-0091',name:'Printer',          brand:'Epson L6490',          status:'Damaged',       location:"Mayor's Office",     serial:'EPS-6490-00219',    owner:'A. Villanueva', amount:28500,  acq:'Jun 3, 2024',  scanned:true,  updated:false},
  {id:'KAT-2024-0095',name:'Air Conditioner',  brand:'Carrier 1.5HP',        status:'Serviceable',   location:"Treasurer's Office", serial:'CAR-15-2024-0031',  owner:'C. Ramos',      amount:38000,  acq:'Jul 10, 2024', scanned:true,  updated:false},
  {id:'KAT-2024-0099',name:'Projector',        brand:'Epson EB-X51',         status:'Serviceable',   location:'MPDC Office',        serial:'EPX51-2024-0010',   owner:'B. Flores',     amount:34000,  acq:'Aug 1, 2024',  scanned:true,  updated:true},
  {id:'KAT-2024-0102',name:'Filing Cabinet',   brand:'Steel 4-Drawer',       status:'Serviceable',   location:'HR Office',          serial:'FC4D-2024-0055',    owner:'N. Cruz',       amount:12000,  acq:'Sep 1, 2024',  scanned:true,  updated:false},
  {id:'KAT-2024-0107',name:'CCTV System',      brand:'Hikvision 8-ch',       status:'Unserviceable', location:'GSO',                serial:'HIK-8CH-2024-001',  owner:'GSO',           amount:75000,  acq:'Oct 5, 2024',  scanned:true,  updated:true},
  {id:'KAT-2024-0110',name:'Laptop Computer',  brand:'Acer Aspire 5',        status:'Serviceable',   location:'Civil Registrar',    serial:'ACR-A5-2024-022',   owner:'P. Domingo',    amount:35000,  acq:'Oct 15, 2024', scanned:false, updated:false},
  {id:'KAT-2024-0113',name:'Photocopier',      brand:'Konica Minolta 215i',  status:'Serviceable',   location:'Budget Office',      serial:'KM-215-2024-007',   owner:'F. Sabino',     amount:88000,  acq:'Nov 1, 2024',  scanned:false, updated:false},
  {id:'KAT-2024-0118',name:'Refrigerator',     brand:'Sharp 8cu.ft',         status:'Serviceable',   location:'RHU',                serial:'SHP-8CF-2024-003',  owner:'Dr. Manalo',    amount:22000,  acq:'Nov 10, 2024', scanned:false, updated:false},
  {id:'KAT-2024-0121',name:'Motorcycle',       brand:'Honda XRM 125',        status:'Serviceable',   location:'LDRRMO',             serial:'HXR125-2024-009',   owner:'E. Salgado',    amount:90000,  acq:'Dec 1, 2024',  scanned:false, updated:false},
  {id:'KAT-2024-0126',name:'Generator Set',    brand:'Denyo 10KVA',          status:'Damaged',       location:'Engineering Office', serial:'DNY-10K-2024-001',  owner:'Engr. Santos',  amount:185000, acq:'Dec 15, 2024', scanned:false, updated:false},
  {id:'KAT-2024-0130',name:'PA System',        brand:'Toa 60W',              status:'Missing',       location:"Mayor's Office",     serial:'TOA60-2024-004',    owner:'A. Villanueva', amount:18500,  acq:'Jan 5, 2025',  scanned:false, updated:false},
  {id:'KAT-2024-0134',name:'UPS',              brand:'APC 1500VA',           status:'Serviceable',   location:'Accounting Office',  serial:'APC15-2025-011',    owner:'L. Lapinig',    amount:9500,   acq:'Jan 20, 2025', scanned:false, updated:false},
  {id:'KAT-2024-0137',name:'Water Dispenser',  brand:'Standard 2-tap',       status:'Serviceable',   location:'MSWDO Office',       serial:'STD2T-2025-019',    owner:'T. Aquino',     amount:6500,   acq:'Feb 3, 2025',  scanned:false, updated:false},
];

const DEMO_AUDIT_EVENTS = [
  {dot:'g',icon:'ti-scan',              act:'QR Scanned — KAT-2024-0087 verified',          who:'GSO-OIC',         when:'May 14, 2026 · 9:41 AM', coords:'8.5216°N, 123.3053°E',office:'Accounting Office',bad:false},
  {dot:'g',icon:'ti-scan',              act:'QR Scanned — KAT-2024-0107 verified',          who:'R. Maglasang',    when:'May 13, 2026 · 3:20 PM', coords:'8.5210°N, 123.3055°E',office:'GSO',bad:false},
  {dot:'a',icon:'ti-refresh',           act:'Status updated: Damaged → Serviceable (0088)', who:'GSO-OIC',         when:'May 13, 2026 · 2:15 PM', coords:'8.5216°N, 123.3053°E',office:'Budget Office',bad:false},
  {dot:'r',icon:'ti-alert-triangle',    act:'Location mismatch — KAT-2024-0130 not found',  who:'M. Salazar',      when:'May 12, 2026 · 10:05 AM',coords:'8.5198°N, 123.3071°E',office:"Mayor's Office",bad:true},
  {dot:'g',icon:'ti-scan',              act:'QR Scanned — KAT-2024-0095 verified',          who:'R. Maglasang',    when:'May 12, 2026 · 9:00 AM', coords:'8.5214°N, 123.3051°E',office:"Treasurer's Office",bad:false},
  {dot:'b',icon:'ti-arrows-transfer-down',act:'Asset transferred — Budget → Accounting',   who:'Admin Officer',   when:'Jan 7, 2026 · 8:30 AM',  coords:'8.5216°N, 123.3053°E',office:'Municipal Hall',bad:false},
  {dot:'a',icon:'ti-tool',              act:'Maintenance logged — CCTV KAT-2024-0107',      who:'GSO-OIC',         when:'Dec 15, 2025 · 11:00 AM',coords:'8.5210°N, 123.3055°E',office:'GSO',bad:false},
  {dot:'g',icon:'ti-file-check',        act:'Annual inventory sync — 47 assets confirmed',  who:'GSO-OIC',         when:'Oct 1, 2025 · 8:00 AM',  coords:'8.5216°N, 123.3053°E',office:'GSO',bad:false},
];

/* ── APP STATE ── */
let scannedAsset = {
  id:'KAT-2024-0087', name:'Laptop Computer', serial:'DLAT54-2024-00123',
  owner:'L. Lapinig', brand:'Dell Latitude 5540', status:'Serviceable',
  location:'Accounting Office', acquiredDate:'Mar 15, 2024', amount:'68500',
  lgu:'LGU Katipunan', timestamp:new Date().toISOString(),
  scannedAt:new Date().toLocaleString('en-PH')
};
let selectedOffice  = null;
let currentGeo      = 'Location not captured';
let _scanLoc        = null;
let isGSOLoggedIn   = false;
let currentGSOUser  = null;
let loginTarget     = null;  // where to go after successful login

/* ── GEOLOCATION API ── */
function initGeolocation() {
  const dot   = document.getElementById('geoDot');
  const label = document.getElementById('geoLabel');
  const coords= document.getElementById('gpsCoords');

  if (!navigator.geolocation) {
    dot.className='geo-dot error';
    label.textContent='Geolocation unavailable';
    coords.textContent='Not captured';
    currentGeo='Location not captured';
    return;
  }
  dot.className='geo-dot locating';
  label.textContent='Locating…';

  navigator.geolocation.getCurrentPosition(
    pos => {
      const loc={lat:pos.coords.latitude,lng:pos.coords.longitude,acc:Math.round(pos.coords.accuracy),at:new Date().toISOString()};
      currentLocation = loc;
      currentGeo = fmtLoc(loc);
      dot.className = 'geo-dot';
      label.textContent = 'Geolocation Active';
      coords.textContent = currentGeo;
      setText('detectedGeo', currentGeo);
      setText('auditGps', currentGeo);
      ms_showToast('📍 Location acquired');
    },
    () => {
      // Permission denied or unavailable — nothing is invented
      dot.className = 'geo-dot error';
      label.textContent = 'Location not available';
      coords.textContent = 'Not captured';
      currentGeo = 'Location not captured';
    },
    {enableHighAccuracy:true, timeout:8000, maximumAge:60000}
  );
}

/* ── 3-DOT MENU ── */
function toggleDotsDD(e) {
  e.stopPropagation();
  document.getElementById('dotsDD').classList.toggle('open');
}

// Called when user taps an item in the 3-dot menu
function gsoAction(type) {
  document.getElementById('dotsDD').classList.remove('open');
  if (!isGSOLoggedIn) {
    loginTarget = {type:'history', tab:type};
    openLogin();
  } else {
    openHistory(type);
  }
}

/* ── LOGIN ── */
function requireLogin(target) {
  if (isGSOLoggedIn) {
    goTo(target);
  } else {
    loginTarget = {type:'nav', target};
    openLogin();
  }
}

function openLogin() {
  // If already logged in, show session chip
  const sess = document.getElementById('loginSession');
  const form = document.getElementById('loginError');
  if (isGSOLoggedIn && currentGSOUser) {
    setText('sessionUser', currentGSOUser.name);
    sess.classList.add('show');
    // Auto-proceed after brief delay
    setTimeout(() => {
      closeLogin();
      proceedAfterLogin();
    }, 800);
    return;
  }
  if (sess) sess.classList.remove('show');
  if (form) form.classList.remove('show');
  document.getElementById('loginOverlay').classList.add('open');
  setTimeout(() => document.getElementById('loginUsername')?.focus(), 300);
}

function closeLogin() {
  document.getElementById('loginOverlay').classList.remove('open');
  document.getElementById('loginError')?.classList.remove('show');
  if (document.getElementById('loginPassword'))
    document.getElementById('loginPassword').value = '';
}

function doLogin() {
  const un  = document.getElementById('loginUsername')?.value.trim();
  const pw  = document.getElementById('loginPassword')?.value;
  const err = document.getElementById('loginError');
  const match = GSO_CREDS.find(c => c.un === un && c.pw === pw);
  if (match) {
    isGSOLoggedIn = true;
    currentGSOUser = match;
    try { localStorage.setItem('mets_admin_name', match.name); } catch(e){}
    err?.classList.remove('show');
    closeLogin();
    updateDDLoginState();
    ms_showToast('✅ Logged in as ' + match.name);
    proceedAfterLogin();
  } else {
    err?.classList.add('show');
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginPassword').focus();
  }
}

function proceedAfterLogin() {
  if (!loginTarget) return;
  if (loginTarget.type === 'nav') {
    goTo(loginTarget.target);
  } else if (loginTarget.type === 'history') {
    openHistory(loginTarget.tab);
  }
  loginTarget = null;
}

function updateDDLoginState() {
  const lockNote = document.getElementById('ddLockNote');
  const userChip = document.getElementById('ddUserChip');
  if (isGSOLoggedIn && currentGSOUser) {
    if (lockNote) lockNote.style.display = 'none';
    if (userChip) { userChip.style.display='flex'; setText('ddUserName', currentGSOUser.name); }
  } else {
    if (lockNote) lockNote.style.display = 'flex';
    if (userChip) userChip.style.display = 'none';
  }
}

/* ── HISTORY PANEL ── */
function openHistory(tab) {
  renderHistoryData();
  // 'history' is a legacy arg from gsoAction; normalize to 'scanned'
  const validTabs = ['scanned','pending','audit'];
  switchHTab(validTabs.includes(tab) ? tab : 'scanned');
  setText('histTitle', 'Scan History');
  document.getElementById('histOverlay').classList.add('open');
}
function closeHistory() {
  document.getElementById('histOverlay').classList.remove('open');
}
function switchHTab(tab) {
  document.querySelectorAll('.htab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.hcontent').forEach(c=>c.classList.remove('active'));
  document.getElementById('htab-'+tab)?.classList.add('active');
  document.getElementById('hcontent-'+tab)?.classList.add('active');
}

function renderHistoryData() {
  // Audit tab
  let events = DEMO_AUDIT_EVENTS;
  try {
    const log = JSON.parse(localStorage.getItem('mets_log')||'[]');
    if (log.length) {
      const extra = log.slice(0,8).map(e=>({
        dot:'b',icon:'ti-history',act:e.msg,who:e.user||'GSO Admin',
        when:e.time||'—',coords:currentGeo,office:selectedOffice||'—',bad:false
      }));
      events = [...extra, ...DEMO_AUDIT_EVENTS.slice(0,4)];
    }
  } catch(e){}
  const updates   = events.filter(e=>e.icon==='ti-refresh'||e.icon==='ti-tool').length;
  const mismatches= events.filter(e=>e.bad).length;
  setText('hstat-total', events.length);
  setText('hstat-updates', updates);
  setText('hstat-mismatches', mismatches);
  document.getElementById('fullAuditList').innerHTML = events.map(ev=>`
    <div class="audit-item">
      <div class="adot ${ev.dot}"><i class="ti ${ev.icon}"></i></div>
      <div class="ac">
        <div class="act">${esc(ev.act)}</div>
        <div class="who">${esc(ev.who)}</div>
        <div class="when">${esc(ev.when)}</div>
        <div class="loc-chip ${ev.bad?'loc-chip-bad':''}">
          <i class="ti ${ev.bad?'ti-map-pin-off':'ti-map-pin'}"></i>
          ${esc(ev.coords)} · ${esc(ev.office)}
        </div>
      </div>
    </div>`).join('');

  // Scanned tab
  const done = ALL_ASSETS.filter(a=>a.scanned);
  const pct  = Math.round((done.filter(a=>a.updated).length/ALL_ASSETS.length)*100);
  setText('hstat-done',    done.length);
  setText('hstat-updated', done.filter(a=>a.updated).length);
  setText('hstat-pct',     pct+'%');
  document.getElementById('scannedList').innerHTML = done.map(a=>`
    <div class="hitem">
      <div class="hdot done"><i class="ti ti-circle-check"></i></div>
      <div style="flex:1;min-width:0">
        <div class="hname">${esc(a.name)}</div>
        <div class="hid">${esc(a.id)}</div>
        <div class="hmeta">${esc(a.location)} · ${esc(a.owner)}<br>${esc(a.brand)}</div>
      </div>
      <span class="hbadge ${a.updated?'upd':'done'}">${a.updated?'Updated':'Scanned'}</span>
    </div>`).join('');

  // Pending tab
  const pend = ALL_ASSETS.filter(a=>!a.scanned);
  setText('pendingBadge', pend.length);
  document.getElementById('pendingList').innerHTML = pend.map(a=>{
    const isMiss = a.status==='Missing';
    const isDmg  = a.status==='Damaged';
    const cls    = isMiss?'miss':isDmg?'pend':'pend';
    const bcls   = isMiss?'miss':'pend';
    return `
    <div class="hitem">
      <div class="hdot ${cls}"><i class="ti ti-clock"></i></div>
      <div style="flex:1;min-width:0">
        <div class="hname">${esc(a.name)}</div>
        <div class="hid">${esc(a.id)}</div>
        <div class="hmeta">${esc(a.location)} · ${esc(a.owner)}</div>
      </div>
      <span class="hbadge ${bcls}">${esc(a.status)}</span>
    </div>`;
  }).join('');
}

/* ── STEP NAVIGATION ── */
const stepToPill = {
  'step-scan':'pill-scan','step-result':'pill-result',
  'step-update':'pill-update','step-success':'pill-success'
};
const stepToTab = {
  'step-scan':'navtab-scan','step-result':'navtab-result',
};
function goTo(id) {
  if (id !== 'step-scan' && typeof stopMobileQRScan === 'function') stopMobileQRScan();
  document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  document.querySelectorAll('.nav-pill').forEach(p=>p.classList.remove('active'));
  document.getElementById(stepToPill[id])?.classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  const tid = stepToTab[id];
  if (tid) document.getElementById(tid)?.classList.add('active');
  // Close overlays
  document.getElementById('histOverlay')?.classList.remove('open');
  if (id==='step-result')  populateResult();
  if (id==='step-update')  populateUpdate();
}

/* ── POPULATE RESULT ── */
function populateResult() {
  const a = scannedAsset;
  setText('res-id', a.id); setText('res-detail-id', a.id);
  setText('res-name-brand', (a.name||'—')+' — '+(a.brand||'—'));
  setText('res-serial', a.serial||'—'); setText('res-brand', a.brand||'—');
  setText('res-acquired', a.acquiredDate||'—');
  setText('res-amount', fmtAmt(a.amount));
  setText('res-location', a.location||'—');
  setText('res-scanned-at', a.scannedAt||'—');
  setText('res-owner', a.owner||'—');
  setText('res-lgu', a.lgu||'LGU Katipunan');
  const badge = document.getElementById('res-status-badge');
  if (badge) {
    badge.className = 'sbadge '+sClass(a.status);
    badge.innerHTML = `<i class="ti ${sIcon(a.status)}" style="font-size:9px"></i> <span id="res-status-text">${a.status}</span>`;
  }
  const cat = getCat(a.amount);
  const catEl = document.getElementById('res-category');
  if (catEl && cat) {
    const p = cat==='PPE';
    catEl.innerHTML = `<span style="background:rgba(13,27,62,.5);border:.5px solid rgba(201,168,76,.3);border-radius:6px;padding:1px 7px;font-size:10px;color:${p?'var(--gold)':'var(--amber-text)'};">${cat}</span> ${p?'₱50,000 &amp; above':'below ₱50,000'}`;
  }
  updateDDLoginState();
  setText('pendingBadge', ALL_ASSETS.filter(a=>!a.scanned).length);
  try{renderScanMonitoring(MOBILE_SCAN_SPEC,a.id,window._lastScanLoc||_scanLoc,(typeof katFindAsset==='function'?katFindAsset(a.id).eq:null));}catch(e){}
}

/* ── POPULATE AUDIT ── */
function populateAudit() {
  setText('auditTrailId', scannedAsset.id);
  setText('auditNowTime', new Date().toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'}));
  setText('auditScanCoords', currentGeo);
  setText('auditScanOffice', selectedOffice||scannedAsset.location||'Unknown');
  try {
    const log = JSON.parse(localStorage.getItem('mets_log')||'[]');
    const rel = log.filter(e=>e.msg&&e.msg.includes(scannedAsset.id)).slice(0,10);
    if (rel.length) {
      const extra = rel.map(e=>`
        <div class="audit-item">
          <div class="adot b"><i class="ti ti-history"></i></div>
          <div class="ac">
            <div class="act">${esc(e.msg)}</div>
            <div class="who">${esc(e.user||'GSO Admin')}</div>
            <div class="when">${esc(e.time||'—')}</div>
          </div>
        </div>`).join('');
      const first = document.getElementById('auditTrailContent')?.querySelector('.audit-item');
      if (first) first.insertAdjacentHTML('afterend', extra);
    }
  } catch(e){}
}

/* ── POPULATE UPDATE ── */
function populateUpdate() {
  const a = scannedAsset;
  setText('update-asset-name', (a.name||'—')+' — '+(a.brand||'—'));
  setText('update-asset-id', (a.id||'—')+' · Serial: '+(a.serial||'—'));
  setText('assignedOfficeName', a.location||'—');
  const sc = selectedOffice||a.location||'—';
  const gd = {name:sc,coords:currentGeo};
  setText('scannedGpsName', gd.name);
  setText('scannedGpsCoords', gd.coords);
  const mm = document.getElementById('locMismatchBar');
  const mb = document.getElementById('locMatchBar');
  const mt = document.getElementById('locMismatchMsg');
  if (sc===a.location) { mb&&(mb.style.display='flex'); mm&&(mm.style.display='none'); }
  else {
    mb&&(mb.style.display='none'); mm&&(mm.style.display='flex');
    mt&&(mt.textContent=`⚠ Location mismatch — asset scanned at ${sc} but assigned to ${a.location}. Possible unauthorized transfer.`);
  }
  const admin = currentGSOUser?.name||localStorage.getItem('mets_admin_name')||'GSO-OIC';
  setText('auditScannedBy', admin); setText('logScannedBy', admin);
  setText('auditAccountable', a.owner||'—'); setText('logAccountable', a.owner||'—');
  setText('auditDateTime', new Date().toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'}));
  setText('auditGps', currentGeo);
  setText('loggedInUser', admin);
  const sel=document.getElementById('statusSelect');
  if (sel) {
    sel.value = a.status||'Serviceable';
    const sv=document.getElementById('auditStatusVal');
    if (sv){sv.textContent=sel.value;sv.style.color=sColor(sel.value);}
  }
}

/* ── SAVE UPDATE ── */
function saveUpdate() {
  const newStatus = document.getElementById('statusSelect')?.value||'Serviceable';
  const remarks   = document.getElementById('remarksInput')?.value.trim()||'';
  const admin     = currentGSOUser?.name||localStorage.getItem('mets_admin_name')||'GSO-OIC';
  const now       = new Date();
  const nowStr    = now.toLocaleString('en-PH');
  const assetId   = scannedAsset.id;
  const oldStatus = scannedAsset.status;
  const isMismatch= document.getElementById('locMismatchBar')?.style.display!=='none';
  const scanned   = selectedOffice||scannedAsset.location||'—';

  try {
    const log = JSON.parse(localStorage.getItem('mets_log')||'[]');
    log.unshift({
      msg:`[QR Mobile] Asset ${assetId} updated: ${oldStatus} → ${newStatus}`+
          (remarks?` · ${remarks}`:'')+
          ` · Scanned at: ${scanned} (${currentGeo})`+
          (isMismatch?` ⚠ MISMATCH — assigned to ${scannedAsset.location}`:''),
      time:nowStr, user:admin
    });
    log.unshift({msg:`QR scanned via Mobile: Asset ${assetId} — ${newStatus}`,time:nowStr,user:admin});
    if (log.length>500) log.splice(500);
    localStorage.setItem('mets_log', JSON.stringify(log));
  } catch(e){}
  try {
    const pend = JSON.parse(localStorage.getItem('mets_pending_sync')||'[]');
    pend.push({action:'status_update',data:{assetId,oldStatus,newStatus,remarks,source:'qr_mobile_scan',scannedOffice:scanned,geoCoords:currentGeo,scannedLat:_scanLoc?_scanLoc.lat:null,scannedLng:_scanLoc?_scanLoc.lng:null,scannedAccuracy:_scanLoc?_scanLoc.acc:null,scannedDemo:!!(_scanLoc&&_scanLoc.demo),timestamp:now.toISOString()},timestamp:now.toISOString(),id:Date.now()});
    localStorage.setItem('mets_pending_sync', JSON.stringify(pend));
  } catch(e){}

  scannedAsset.status = newStatus;
  const coords = currentGeo;
  setText('succ-id', assetId);
  const ss=document.getElementById('succ-status');
  if (ss){ss.textContent=newStatus;ss.style.color=sColor(newStatus);}
  setText('succ-by', admin+' · GSO');
  setText('succ-time', nowStr);
  setText('successAssigned', scannedAsset.location||'—');
  setText('successScanned', scanned);
  setText('successGps', coords);
  const lc=document.getElementById('successLocCheck');
  if (lc){
    lc.innerHTML=isMismatch?
      `<i class="ti ti-alert-triangle" style="font-size:11px"></i> Mismatch`:
      `<i class="ti ti-check" style="font-size:11px"></i> Matched`;
    lc.style.color=isMismatch?'var(--red-text)':'var(--green-text)';
  }
  const si=document.getElementById('successIcon'), st=document.getElementById('successTitle');
  if (isMismatch){
    si&&(si.style.background='var(--red-bg)');
    si?.querySelector('i')&&(si.querySelector('i').style.color='var(--red-text)');
    st&&(st.style.color='var(--red-text)');
  } else {
    si&&(si.style.background='var(--green-bg)');
    si?.querySelector('i')&&(si.querySelector('i').style.color='var(--green-text)');
    st&&(st.style.color='#fff');
  }
  ms_showToast('✅ Update saved to mets_log');
  goTo('step-success');
}

/* ── OFFICE SELECTOR ── */
function toggleOfficeDD() {
  document.getElementById('officeDD')?.classList.toggle('open');
  document.getElementById('officeSelectBtn')?.classList.toggle('open');
}
function pickOffice(el, name) {
  selectedOffice = name;
  const txt = document.getElementById('officeSelectText');
  txt.textContent = name; txt.classList.remove('ph');
  document.querySelectorAll('.office-opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  document.getElementById('officeDD')?.classList.remove('open');
  document.getElementById('officeSelectBtn')?.classList.remove('open');
  setText('detectedOffice', name);
  setText('detectedGeo', currentGeo);
  setText('scannedGpsName', name);
  setText('scannedGpsCoords', currentGeo);
  resetMobileScanUI();
}
function viewAsset() {
  if (!scannedAsset || !scannedAsset.id) return;
  stopMobileQRScan();
  goTo('step-result');
}

/* ── RESET ── */
function resetForNextScan() {
  stopMobileQRScan();
  scannedAsset={id:'',name:'',serial:'—',owner:'—',brand:'—',status:'Serviceable',location:'',acquiredDate:'—',amount:'',lgu:'LGU Katipunan',timestamp:new Date().toISOString(),scannedAt:new Date().toLocaleString('en-PH')};
  resetMobileScanUI();
  const area = document.getElementById('scannerAreaBox');
  if (area) area.classList.add('ready');
  goTo('step-scan');
  autoStartMobileScanner(150);
}

/* ── CAMERA SCAN (real QR, inline viewfinder) ── */
let msInlineScanner = null;
let msInlineScanBusy = false;
let msFrameSyncTimer = null;
let msAutoStartTimer = null;

/* Align the gold animation frame with the QR library's white scan box so the
   gold border and scan line always sit inside the white brackets. */
function clearMobileScanFrameSync() {
  if (msFrameSyncTimer) { clearTimeout(msFrameSyncTimer); msFrameSyncTimer = null; }
  const frame = document.getElementById('scanFrame');
  if (frame) {
    frame.style.left = '';
    frame.style.top = '';
    frame.style.width = '';
    frame.style.height = '';
    frame.style.transform = '';
  }
}

function syncMobileScanFrameToQrBox() {
  const box = document.getElementById('scannerAreaBox');
  const reader = document.getElementById('msInlineReader');
  const frame = document.getElementById('scanFrame');
  if (!box || !reader || !frame || !box.classList.contains('live')) return false;
  const shaded = reader.querySelector('#qr-shaded-region');
  if (!shaded) return false;
  const sr = shaded.getBoundingClientRect();
  const boxRect = box.getBoundingClientRect();
  const style = getComputedStyle(shaded);
  const bl = parseFloat(style.borderLeftWidth) || 0;
  const br = parseFloat(style.borderRightWidth) || 0;
  const bt = parseFloat(style.borderTopWidth) || 0;
  const bb = parseFloat(style.borderBottomWidth) || 0;
  const innerW = sr.width - bl - br;
  const innerH = sr.height - bt - bb;
  if (innerW < 40 || innerH < 40) return false;
  const inset = 6;
  const width = Math.max(40, innerW - inset * 2);
  const height = Math.max(40, innerH - inset * 2);
  frame.style.left = (sr.left - boxRect.left + bl + inset) + 'px';
  frame.style.top = (sr.top - boxRect.top + bt + inset) + 'px';
  frame.style.width = width + 'px';
  frame.style.height = height + 'px';
  frame.style.transform = 'none';
  return true;
}

function scheduleMobileScanFrameSync() {
  if (msFrameSyncTimer) { clearTimeout(msFrameSyncTimer); msFrameSyncTimer = null; }
  const run = (attempt) => {
    if (syncMobileScanFrameToQrBox()) { msFrameSyncTimer = null; return; }
    if (attempt < 20 && msInlineScanner) {
      msFrameSyncTimer = setTimeout(() => run(attempt + 1), 100);
    } else {
      msFrameSyncTimer = null;
    }
  };
  run(0);
}

window.addEventListener('resize', () => { if (msInlineScanner) scheduleMobileScanFrameSync(); });
window.addEventListener('orientationchange', () => { if (msInlineScanner) scheduleMobileScanFrameSync(); });

function resetMobileScanUI() {
  const banner = document.getElementById('scanDetected');
  if (banner) banner.style.display = 'none';
  const btn = document.getElementById('viewAssetBtn');
  if (btn) { btn.style.opacity = '.4'; btn.style.pointerEvents = 'none'; }
  const hint = document.getElementById('scanHintText');
  if (hint) { hint.textContent = 'Point camera at asset QR code tag'; hint.style.display = ''; }
  const box = document.getElementById('scannerAreaBox');
  if (box) { box.classList.remove('detected'); box.classList.remove('unavailable'); }
  const geo = document.getElementById('detectedGeo');
  if (geo) geo.textContent = '—';
}

function showMobileScannerUnavailable(){
  const box = document.getElementById('scannerAreaBox');
  if (box) { box.classList.remove('live'); box.classList.add('unavailable'); }
  const hint = document.getElementById('scanHintText');
  if (hint) { hint.textContent = ''; hint.style.display = 'none'; }
}

function autoStartMobileScanner(delay){
  if (msAutoStartTimer) { clearTimeout(msAutoStartTimer); msAutoStartTimer = null; }
  msAutoStartTimer = setTimeout(() => {
    msAutoStartTimer = null;
    if (!document.getElementById('view-mobilescanner')?.classList.contains('active')) return;
    if (!document.getElementById('step-scan')?.classList.contains('active')) return;
    const banner = document.getElementById('scanDetected');
    if (banner && banner.style.display === 'block') return;
    const hint = document.getElementById('scanHintText');
    if (hint) hint.textContent = 'Starting camera…';
    startMobileQRScan();
  }, delay == null ? 150 : delay);
}

function stopMobileQRScan() {
  if (msInlineScanner) {
    try { msInlineScanner.stop().catch(() => {}); } catch (e) {}
    msInlineScanner = null;
  }
  msInlineScanBusy = false;
  if (msAutoStartTimer) { clearTimeout(msAutoStartTimer); msAutoStartTimer = null; }
  if (typeof clearMobileScanFrameSync === 'function') clearMobileScanFrameSync();
  const box = document.getElementById('scannerAreaBox');
  if (box) box.classList.remove('live');
  const reader = document.getElementById('msInlineReader');
  if (reader) {
    setTimeout(() => { if (!msInlineScanner) reader.innerHTML = ''; }, 250);
  }
}

async function startMobileQRScan(deviceId) {
  if (typeof Html5Qrcode === 'undefined') {
    showMobileScannerUnavailable();
    ms_showToast('📷 Scanner unavailable');
    return null;
  }
  if (!window.isSecureContext) {
    showMobileScannerUnavailable();
    ms_showToast('📷 Scanner unavailable');
    return null;
  }
  if (msInlineScanner) return msInlineScanner;
  const box = document.getElementById('scannerAreaBox');
  const reader = document.getElementById('msInlineReader');
  if (!box || !reader) return null;
  resetMobileScanUI();
  box.classList.add('live', 'ready');
  const hint = document.getElementById('scanHintText');
  if (hint) hint.textContent = 'Requesting camera…';
  await loadCameraSelectors();
  msInlineScanBusy = false;
  let lastError = null;
  for (const cfg of qrCameraCandidates('')) {
    if (!document.getElementById('view-mobilescanner')?.classList.contains('active')) return null;
    reader.innerHTML = '';
    const scanner = createQrScanner('msInlineReader');
    msInlineScanner = scanner;
    try {
      await scanner.start(
        cfg,
        { fps: 30, qrbox: (w, h) => { const s = Math.max(130, Math.floor(Math.min(w, h) * 0.65)); return { width: s, height: s }; }, aspectRatio: 1.0, disableFlip: false },
        (text) => {
          if (msInlineScanBusy) return;
          msInlineScanBusy = true;
          stopMobileQRScan();
          onQRDecoded(text);
        },
        () => {}
      );
      if (!document.getElementById('view-mobilescanner')?.classList.contains('active')) {
        try { await scanner.stop(); } catch (e) {}
        if (msInlineScanner === scanner) msInlineScanner = null;
        return null;
      }
      if (hint) hint.textContent = 'Point the camera at the asset QR tag';
      scheduleMobileScanFrameSync();
      return scanner;
    } catch (err) {
      lastError = err;
      if (msInlineScanner === scanner) msInlineScanner = null;
      try { await scanner.stop(); } catch (e) {}
      try { scanner.clear(); } catch (e) {}
    }
  }
  stopMobileQRScan();
  showMobileScannerUnavailable();
  ms_showToast('📷 Scanner unavailable');
  logAction('Camera scan unavailable: ' + (lastError && lastError.message ? lastError.message : lastError));
  return null;
}

/* ── QR DECODE ── */
async function onQRDecoded(rawText) {
  stopMobileQRScan();
  try {
    ms_showToast('📍 Capturing location…');
    _scanLoc = await getScanLocation();   // geolocation captured at the moment of the scan
    currentGeo = fmtLoc(_scanLoc);
    setText('gpsCoords', currentGeo); setText('detectedGeo', currentGeo);
    setText('auditGps', currentGeo); setText('scannedGpsCoords', currentGeo);
    let data;
    try{data=JSON.parse(rawText);}
    catch{data={id:String(rawText||'').trim()};}
    if(!data.id&&data.assetId)data.id=data.assetId;
    const found=katFindAsset(data.id);
    const eq=found.eq;
    scannedAsset={
      id:data.id||(eq?eq.id:rawText),
      name:(eq&&eq.name)||data.name||'Unknown Asset',
      serial:(eq&&eq.serial)||data.serial||'—',
      owner:(found.staff&&found.staff.name)||data.owner||'—',
      brand:(eq&&eq.brand)||data.brand||'—',
      status:(eq&&eq.status)||data.status||'Serviceable',
      location:(eq&&eq.location)||data.location||'—',
      acquiredDate:(eq&&eq.acquiredDate)||data.acquiredDate||'—',
      amount:(eq&&eq.amount)||data.amount||'',
      lgu:data.lgu||'LGU Katipunan',
      timestamp:data.timestamp||new Date().toISOString(),
      scannedAt:data.scannedAt||new Date().toLocaleString('en-PH')
    };
    // Log the scan publicly — no login required to view
    try {
      const log=JSON.parse(localStorage.getItem('mets_log')||'[]');
      const who=currentGSOUser?.name||'External Scan';
      log.unshift({msg:`QR scanned: Asset ${scannedAsset.id} — ${scannedAsset.status} · ${currentGeo}`,time:new Date().toLocaleString('en-PH'),user:who});
      if (log.length>500) log.splice(500);
      localStorage.setItem('mets_log',JSON.stringify(log));
    } catch(e){}
    recordAssetScan(scannedAsset.id,_scanLoc,'qr_mobile_scan');
    window._lastScanLoc=_scanLoc;
    window._lastScanAt=new Date().toISOString();
    if(eq)queueAssetScan(scannedAsset.id,_scanLoc,'qr_mobile_scan',eq);
    try{queueSync('qr_scan',{assetId:scannedAsset.id,scannedAt:new Date().toISOString(),scannedLat:_scanLoc?_scanLoc.lat:null,scannedLng:_scanLoc?_scanLoc.lng:null,scannedAccuracy:_scanLoc?_scanLoc.acc:null,scannedDemo:!!(_scanLoc&&_scanLoc.demo),scannedLocation:currentGeo});}catch(e){}
    // Show the confirmation banner and wait for "View Asset Details".
    goTo('step-scan');
    const detected = selectedOffice || scannedAsset.location || 'GSO';
    setText('detectedOffice', detected);
    setText('detectedGeo', currentGeo || 'Location not captured');
    const banner = document.getElementById('scanDetected');
    if (banner) banner.style.display = 'block';
    const btn = document.getElementById('viewAssetBtn');
    if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
    const box = document.getElementById('scannerAreaBox');
    if (box) { box.classList.remove('live'); box.classList.add('detected'); }
    const hint = document.getElementById('scanHintText');
    if (hint) hint.textContent = 'QR detected — tap View Asset Details';
    // Prepare the location match/mismatch indicator for the result screen.
    const assigned = scannedAsset.location || '—';
    const scannedAt = selectedOffice || assigned;
    const mb = document.getElementById('locMatchBar');
    const mm = document.getElementById('locMismatchBar');
    const mt = document.getElementById('locMismatchMsg');
    if (scannedAt === assigned) {
      if (mb) mb.style.display = 'flex';
      if (mm) mm.style.display = 'none';
    } else {
      if (mb) mb.style.display = 'none';
      if (mm) mm.style.display = 'flex';
      if (mt) mt.textContent = `⚠ Location mismatch — asset scanned at ${scannedAt} but assigned to ${assigned}. Possible unauthorized transfer.`;
    }
    ms_showToast(_scanLoc ? ( _scanLoc.demo ? '🧪 Asset detected — demo coordinates used' : '✅ Asset detected: ' + scannedAsset.id + ' · location saved') : '⚠ QR decoded — location not captured');
  } catch(e){ms_showToast('⚠ Invalid QR code format');}
}

/* ── PHOTO ── */
const DEMO_PHOTO='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100"><rect width="300" height="100" fill="%230e1a38"/><circle cx="150" cy="38" r="18" fill="%231e3568"/><rect x="110" y="62" width="80" height="6" rx="3" fill="%231e3568"/><text x="150" y="95" text-anchor="middle" font-size="9" fill="%23c9a84c" font-family="sans-serif">Asset Photo · LGU Katipunan</text></svg>';
function simulatePhoto(){
  document.getElementById('photoPreviewImg').src=DEMO_PHOTO;
  document.getElementById('photoPreviewWrap').classList.add('show');
  document.getElementById('photoCaptureBtn').style.display='none';
  const h=document.getElementById('photoHint');
  h.textContent='✓ Photo attached to this update'; h.style.color='var(--green-text)';
}
function retakePhoto(){
  document.getElementById('photoPreviewWrap').classList.remove('show');
  document.getElementById('photoCaptureBtn').style.display='flex';
  const h=document.getElementById('photoHint');
  h.textContent='Photo will be attached to this update log'; h.style.color='';
}

/* ── STATUS HELPERS ── */
function sClass(v){return v==='Serviceable'?'s-svc':v==='Damaged'?'s-dmg':v==='Unserviceable'?'s-uns':v==='Lost'?'s-lst':'s-mis'}
function sColor(v){return v==='Serviceable'?'var(--green-text)':v==='Damaged'?'var(--amber-text)':v==='Unserviceable'?'var(--red-text)':v==='Lost'?'#ff7070':'#ffe566'}
function sIcon(v){return v==='Serviceable'?'ti-check':v==='Damaged'?'ti-tool':v==='Unserviceable'?'ti-x':v==='Lost'?'ti-circle-off':'ti-question-mark'}
function getCat(a){const n=parseFloat(String(a||'').replace(/[₱,]/g,''));return isNaN(n)||n===0?null:n>=50000?'PPE':'Semi-Expendable'}
function fmtAmt(v){if(!v&&v!==0)return'—';const n=parseFloat(String(v).replace(/,/g,''));return isNaN(n)?'—':'₱'+n.toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2})}

/* ── UTILITIES ── */
function setText(id,val){const el=document.getElementById(id);if(el)el.textContent=val}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function updateStatusTime(){const el=document.getElementById('statusTime');if(el)el.textContent=new Date().toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'})}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded',()=>{
  // Status select sync
  document.getElementById('statusSelect')?.addEventListener('change',function(){
    const sv=document.getElementById('auditStatusVal');
    if(sv){sv.textContent=this.value;sv.style.color=sColor(this.value);}
  });
  // Enter key on login
  document.getElementById('loginPassword')?.addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()});
  document.getElementById('loginUsername')?.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('loginPassword')?.focus()});

  // Close dropdowns on outside click
  document.addEventListener('click',e=>{
    if(!document.getElementById('dotsWrap')?.contains(e.target))
      document.getElementById('dotsDD')?.classList.remove('open');
    const ow=document.getElementById('officeSelectBtn')?.closest('.office-select-wrap');
    if(ow&&!ow.contains(e.target)){
      document.getElementById('officeDD')?.classList.remove('open');
      document.getElementById('officeSelectBtn')?.classList.remove('open');
    }
  });

  updateStatusTime();
  setInterval(updateStatusTime,60000);
  initGeolocation();

  // Restore session
  const stored=localStorage.getItem('mets_admin_name');
  if(stored){const m=GSO_CREDS.find(c=>c.name===stored);if(m){isGSOLoggedIn=true;currentGSOUser=m;updateDDLoginState();setText('loggedInUser',m.name);}}

  // Badge init
  setText('pendingBadge', ALL_ASSETS.filter(a=>!a.scanned).length);
});


// ══════════════════════════════════════════════════════════
// PRINT MODAL SECTION
// ══════════════════════════════════════════════════════════
/* Update ms_showToast to use correct element */
function ms_showToast(msg){
  const t=document.getElementById('ms_mobileToast');
  if(!t)return;
  t.textContent=msg;
  t.style.opacity='1';
  clearTimeout(t._timer);
  t._timer=setTimeout(()=>{t.style.opacity='0';},2800);
}

/* ─── END MOBILE QR SCANNER SCRIPT ─── */

/* Stop the inline mobile camera when leaving the scanner view or page. */
(function () {
  const baseShowView = window.showView;
  if (typeof baseShowView === 'function') {
    window.showView = function (id) {
      if (id !== 'mobilescanner' && typeof stopMobileQRScan === 'function') stopMobileQRScan();
      return baseShowView.apply(this, arguments);
    };
  }
  window.addEventListener('pagehide', function () {
    if (typeof stopMobileQRScan === 'function') stopMobileQRScan();
  });
})();
