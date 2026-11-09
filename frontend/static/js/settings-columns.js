/* Katipunan AMS - Settings: global column manager
   Extracted from frontend/templates/index.html. */

// ══════════════════════════════════════════════════════
// SETTINGS: GLOBAL COLUMN MANAGER
// Keys: 'mets_global_eq_cols'   → [{key,label}]
//       'mets_global_pers_cols' → [{key,label}]
// ══════════════════════════════════════════════════════

function getGlobalColStore(type) {
  const k = type === 'equipment' ? 'mets_global_eq_cols' : 'mets_global_pers_cols';
  try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch(e){ return []; }
}
function saveGlobalColStore(type, arr) {
  const k = type === 'equipment' ? 'mets_global_eq_cols' : 'mets_global_pers_cols';
  try { localStorage.setItem(k, JSON.stringify(arr)); } catch(e){}
}

/* Render the pill-style badge list in the settings card */
function renderSettingsColLists() {
  const el = document.getElementById('settings-eq-col-list');
  if (!el) return;

  // Gather all unique columns across ALL staff from mets_custom_cols
  const store = getCustomColStore();
  // Build a map: colKey -> { label, staffIds[] }
  const colMap = {};
  Object.entries(store).forEach(([staffId, data]) => {
    (data.colDefs || []).forEach(c => {
      if (!colMap[c.key]) colMap[c.key] = { label: c.label, staffIds: [] };
      if (!colMap[c.key].staffIds.includes(staffId)) colMap[c.key].staffIds.push(staffId);
    });
  });

  const entries = Object.entries(colMap);
  if (!entries.length) {
    el.innerHTML = '<span style="font-size:0.72rem;color:var(--text-light);font-style:italic;">No custom columns in any table yet</span>';
    return;
  }

  el.innerHTML = entries.map(([key, info]) =>
    `<div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:7px 12px;margin-bottom:5px;">
      <div>
        <div style="font-size:0.8rem;font-weight:700;color:var(--text-dark);">${escHtml(info.label)}</div>
        <div style="font-size:0.67rem;color:var(--text-light);margin-top:1px;">Used in ${info.staffIds.length} table${info.staffIds.length!==1?'s':''}</div>
      </div>
      <span class="settings-col-del-x" data-colkey="${key}" data-collabel="${escHtml(info.label)}" data-staffids="${info.staffIds.join(',')}"
        title="Delete column"
        style="cursor:pointer;background:var(--red-light);color:var(--red);border:1px solid var(--red);border-radius:6px;padding:3px 10px;font-size:0.7rem;font-weight:700;white-space:nowrap;flex-shrink:0;">
        🗑 Delete
      </span>
    </div>`
  ).join('');

  // Attach listeners via JS (no inline onclick — avoids key-escaping issues)
  el.querySelectorAll('.settings-col-del-x').forEach(btn => {
    btn.addEventListener('click', function () {
      const key      = this.dataset.colkey;
      const label    = this.dataset.collabel;
      const staffIds = this.dataset.staffids.split(',').filter(Boolean);
      openSettingsDelColConfirm(key, label, staffIds);
    });
  });
}

function openSettingsDelColConfirm(colKey, colLabel, staffIds) {
  document.getElementById('settingsDelColConfirmLabel').textContent = colLabel;
  const modal = document.getElementById('settingsDelColConfirmModal');
  modal.dataset.colKey   = colKey;
  modal.dataset.staffIds = staffIds.join(',');
  modal.classList.add('open');
}
function closeSettingsDelColConfirm() {
  document.getElementById('settingsDelColConfirmModal').classList.remove('open');
}
function confirmSettingsDeleteCol() {
  const modal    = document.getElementById('settingsDelColConfirmModal');
  const colKey   = modal.dataset.colKey;
  const staffIds = modal.dataset.staffIds.split(',').filter(Boolean);
  closeSettingsDelColConfirm();

  const store = getCustomColStore();
  staffIds.forEach(staffId => {
    if (!store[staffId]) return;
    store[staffId].colDefs = (store[staffId].colDefs || []).filter(c => c.key !== colKey);
    const rows = store[staffId].rows || {};
    Object.values(rows).forEach(r => { delete r[colKey]; });
  });
  saveCustomColStore(store);
  renderSettingsColLists();
  if (typeof showSyncToast === 'function') showSyncToast('🗑 Column deleted from all tables');
  if (typeof logAction    === 'function') logAction(`Column "${colKey}" deleted from equipment tables via Settings`);
  if (typeof currentStaff !== 'undefined' && currentStaff) showProfile(currentStaff);
}

function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* ── ADD COLUMN MODAL ── */
function openSettingsAddColModal(type) {
  document.getElementById('settingsAddColType').value = type;
  document.getElementById('settingsAddColTitle').textContent = type === 'equipment' ? '➕ Add Column — Equipment Table' : '➕ Add Column — Personnel Table';
  document.getElementById('settingsAddColSub').textContent  = type === 'equipment' ? 'Add a global custom column to all equipment tables' : 'Add a global custom column to all personnel tables';
  document.getElementById('settingsAddColName').value = '';
  document.getElementById('settingsAddColModal').classList.add('open');
  setTimeout(()=>document.getElementById('settingsAddColName').focus(), 180);
}
function closeSettingsAddColModal() {
  document.getElementById('settingsAddColModal').classList.remove('open');
}
function saveSettingsAddCol() {
  const type  = document.getElementById('settingsAddColType').value;
  const label = (document.getElementById('settingsAddColName').value || '').trim();
  if (!label) { document.getElementById('settingsAddColName').focus(); return; }
  const cols = getGlobalColStore(type);
  const alreadyExists = cols.find(c => c.label.toLowerCase() === label.toLowerCase());
  if (alreadyExists) { alert('A column with that name already exists.'); return; }
  const key = 'gc_' + type.slice(0,2) + '_' + label.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'') + '_' + Date.now();
  cols.push({key, label});
  saveGlobalColStore(type, cols);
  closeSettingsAddColModal();
  renderSettingsColLists();
  if(typeof showSyncToast === 'function') showSyncToast(`✅ Column "${label}" added`);
  if(typeof logAction === 'function') logAction(`Global column "${label}" added to ${type} table`);
}

/* ── DELETE COLUMN MODAL ── */
function openSettingsDelColModal(type) {
  document.getElementById('settingsDelColType').value = type;
  document.getElementById('settingsDelColTitle').textContent = type === 'equipment' ? '🗑 Delete Column — Equipment Table' : '🗑 Delete Column — Personnel Table';
  document.getElementById('settingsDelColSub').textContent  = type === 'equipment' ? 'Remove a global custom column from all equipment tables' : 'Remove a global custom column from all personnel tables';
  const cols = getGlobalColStore(type);
  const list = document.getElementById('settingsDelColList');
  const empty = document.getElementById('settingsDelColEmpty');
  if (!cols.length) {
    list.innerHTML = '';
    empty.style.display = '';
  } else {
    empty.style.display = 'none';
    list.innerHTML = cols.map(c =>
      `<div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg);border:1px solid var(--border);border-radius:7px;padding:8px 12px;">
        <span style="font-size:0.82rem;font-weight:600;color:var(--text-dark);">${escHtml(c.label)}</span>
        <button onclick="confirmDeleteGlobalCol('${type}','${c.key}',this)" class="action-btn delete" style="font-size:0.68rem;padding:3px 10px;">🗑 Remove</button>
      </div>`
    ).join('');
  }
  document.getElementById('settingsDelColModal').classList.add('open');
}
function closeSettingsDelColModal() {
  document.getElementById('settingsDelColModal').classList.remove('open');
}
function confirmDeleteGlobalCol(type, colKey, btn) {
  if (!confirm('Remove this column from all tables? This cannot be undone.')) return;
  const cols = getGlobalColStore(type).filter(c => c.key !== colKey);
  saveGlobalColStore(type, cols);
  // re-render the delete list in place
  const parent = btn.closest('[style*="display:flex"]');
  if (parent) parent.remove();
  if (!cols.length) {
    document.getElementById('settingsDelColList').innerHTML = '';
    document.getElementById('settingsDelColEmpty').style.display = '';
  }
  renderSettingsColLists();
  if(typeof showSyncToast === 'function') showSyncToast('🗑 Column removed from all tables');
  if(typeof logAction === 'function') logAction(`Global column removed from ${type} table`);
}

/* Hook into showSettings to refresh the column pill lists */
(function(){
  const _orig = window.showSettings;
  window.showSettings = function(){
    if(typeof _orig === 'function') _orig.apply(this, arguments);
    setTimeout(renderSettingsColLists, 80);
  };
})();

/* Open Delete Column modal from Settings — uses currentStaff if available */
function openDelColFromSettings() {
  const staffId = (typeof currentStaff !== 'undefined' && currentStaff) ? currentStaff.id : null;
  if (!staffId) {
    alert('Please open a staff profile first, then come back to Settings to delete columns for that table.');
    return;
  }
  openDelColModal(staffId);
}

/* Auto-init on page load */
document.addEventListener('DOMContentLoaded', function(){ renderSettingsColLists(); });
setTimeout(renderSettingsColLists, 600); // fallback for dynamic init
