/* Katipunan AMS - Screen lock (PIN / password)
   Extracted from frontend/templates/index.html. */

// ═══════════════════════════════════════════
// SCREEN LOCK TYPE — PIN or Password
// Key: 'mets_lock_type'  → 'pin' | 'password'
//      'mets_password'   → hashed/stored password
// ═══════════════════════════════════════════

function getLockType() {
  return 'password';
}
function setLockType(type) {
  localStorage.setItem('mets_lock_type', type);
  applyLockTypeUI(type);
  if (typeof showSyncToast === 'function') showSyncToast(`🔐 Screen lock set to ${type === 'pin' ? 'PIN' : 'Password'}`);
  if (typeof logAction   === 'function') logAction(`Screen lock type changed to ${type}`);
}
function applyLockTypeUI(type) {
  const isPIN = type === 'pin';
  // Sections
  const pinSec = document.getElementById('locktype-pin-section');
  const pwSec  = document.getElementById('locktype-pw-section');
  if (pinSec) pinSec.style.display = isPIN ? '' : 'none';
  if (pwSec)  pwSec.style.display  = isPIN ? 'none' : '';
  if (!isPIN) {
    const unField = document.getElementById('changeUsername');
    if (unField && !unField.value) {
      unField.value = localStorage.getItem('mets_username') || '';
    }
  }
  // Settings card-style selectors (new design)
  const pinBtn = document.getElementById('locktype-pin-btn');
  const pwBtn  = document.getElementById('locktype-pw-btn');
  const pinCheck = document.getElementById('lt-settings-pin-check');
  const pwCheck  = document.getElementById('lt-settings-pw-check');
  if (pinBtn) {
    pinBtn.style.border     = isPIN ? '2px solid var(--gold)' : '2px solid var(--border)';
    pinBtn.style.background = isPIN ? 'rgba(201,168,76,0.12)' : 'var(--bg)';
  }
  if (pwBtn) {
    pwBtn.style.border     = !isPIN ? '2px solid var(--gold)' : '2px solid var(--border)';
    pwBtn.style.background = !isPIN ? 'rgba(201,168,76,0.12)' : 'var(--bg)';
  }
  if (pinCheck) pinCheck.style.display = isPIN  ? '' : 'none';
  if (pwCheck)  pwCheck.style.display  = !isPIN ? '' : 'none';
  // Also update the lock screen prompt label if it exists
  const lockPrompt = document.getElementById('lockScreenPromptLabel');
  if (lockPrompt) lockPrompt.textContent = isPIN ? 'Enter PIN' : 'Enter Password';
  const lockInput = document.getElementById('lockScreenInput');
  if (lockInput) {
    lockInput.placeholder  = isPIN ? '••••••' : 'Password';
    lockInput.inputMode    = isPIN ? 'numeric' : 'text';
    lockInput.maxLength    = isPIN ? 12 : 64;
  }
}

function changePassword() {
  const un  = (document.getElementById('changeUsername').value || '').trim();
  const np  = (document.getElementById('newPassword').value  || '').trim();
  const cp  = (document.getElementById('confirmPassword').value || '').trim();
  const msg = document.getElementById('pw-change-msg');
  if (un.length < 1) {
    msg.style.color = 'var(--red)';
    msg.textContent = '\u26a0 Username cannot be empty.';
    return;
  }
  if (np.length < 8) {
    msg.style.color = 'var(--red)';
    msg.textContent = '\u26a0 Password must be at least 8 characters.';
    return;
  }
  if (np !== cp) {
    msg.style.color = 'var(--red)';
    msg.textContent = '\u26a0 Passwords do not match.';
    return;
  }
  localStorage.setItem('mets_username', un);
  localStorage.setItem('mets_password', np);
  document.getElementById('changeUsername').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  msg.style.color = 'var(--green, #48bb78)';
  msg.textContent = '\u2705 Username and password saved successfully.';
  setTimeout(() => { msg.textContent = ''; }, 3000);
  if (typeof showSyncToast === 'function') showSyncToast('\u2705 Credentials updated');
  if (typeof logAction === 'function') logAction('Admin username and password changed');
}

// Patch the lock-screen verification to check type
(function patchLockScreen() {
  const _origVerify = window.verifyLockScreen || window.verifyPIN;
  // We patch verifyPIN / verifyLockScreen whichever exists
  function patchedVerify() {
    const type  = getLockType();
    const input = document.getElementById('lockScreenInput') || document.getElementById('pinInput');
    if (!input) return;
    const val = input.value;
    let correct = false;
    if (type === 'password') {
      const saved = localStorage.getItem('mets_password') || '';
      correct = saved && val === saved;
    } else {
      // Original PIN check
      if (typeof _origVerify === 'function') { _origVerify(); return; }
      const savedPin = localStorage.getItem('gsoPin') || '123456';
      correct = val === savedPin;
    }
    if (correct) {
      const overlay = document.getElementById('lockScreen') || document.getElementById('lockOverlay');
      if (overlay) overlay.style.display = 'none';
      if (input) input.value = '';
    } else {
      if (input) { input.classList.add('shake'); setTimeout(()=>input.classList.remove('shake'),500); input.value=''; input.focus(); }
      if (typeof showSyncToast === 'function') showSyncToast('❌ Incorrect ' + (type==='password'?'password':'PIN'));
    }
  }
  if (window.verifyPIN)        window.verifyPIN        = patchedVerify;
  if (window.verifyLockScreen) window.verifyLockScreen = patchedVerify;
})();

// Init on settings open
(function(){
  const _orig = window.showSettings;
  window.showSettings = function(){
    if (typeof _orig === 'function') _orig.apply(this, arguments);
    setTimeout(() => applyLockTypeUI(getLockType()), 80);
  };
})();
document.addEventListener('DOMContentLoaded', () => applyLockTypeUI(getLockType()));
setTimeout(() => applyLockTypeUI(getLockType()), 500);
