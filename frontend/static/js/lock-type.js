/* Katipunan AMS - Lock type chooser
   Extracted from frontend/templates/index.html. */

// ═══════════════════════════════════════════════════
// LOCK TYPE CHOOSER
// ═══════════════════════════════════════════════════
let _ltSelectedType = 'password';
let _ltPinBuffer = '';

function showLockTypeChooser() {
  const hasPin = !!localStorage.getItem('mets_pin');
  const hasPw  = !!localStorage.getItem('mets_password');
  const savedType = 'password';

  // Pre-select: use saved type if credentials exist, else default to pin
  _ltSelectedType = (hasPin || hasPw) ? savedType : 'pin';
  _ltPinBuffer = '';
  renderLtPin();

  // Update title/subtitle based on login vs first-time-setup context
  const titleEl = document.querySelector('#lockTypeChooser .ltc-title');
  const subEl   = document.querySelector('#lockTypeChooser .ltc-sub');
  if (hasPin || hasPw) {
    if (titleEl) titleEl.textContent = 'Choose Login Method';
    if (subEl)   subEl.textContent   = 'Select how you want to log in to your account.';
  } else {
    if (titleEl) titleEl.textContent = 'Screen Lock Type';
    if (subEl)   subEl.textContent   = 'Choose your preferred screen lock method to secure your account.';
  }

  // Pre-highlight the correct card
  selectLockTypeCard(_ltSelectedType);
  document.getElementById('lockTypeChooser').style.display = 'flex';
}
function hideLockTypeChooser() {
  document.getElementById('lockTypeChooser').style.display = 'none';
}

// Called when user clicks "Continue →" on the lock type chooser
function ltContinue() {
  const hasPin = !!localStorage.getItem('mets_pin');
  const hasPw  = !!localStorage.getItem('mets_password');
  const hasCredentials = hasPin || hasPw;

  hideLockTypeChooser();

  if (hasCredentials) {
    // Returning user: go to login screen for the chosen method
    localStorage.setItem('mets_lock_type', _ltSelectedType);
    showLoginScreen();
  } else {
    // First-time setup: go to setup screen for the chosen method
    if (_ltSelectedType === 'password') {
      const pwSetup = document.getElementById('pwSetupScreen');
      if (pwSetup) pwSetup.style.display = 'flex';
    } else {
      const caScreen = document.getElementById('createAccountScreen');
      if (caScreen) caScreen.style.display = 'flex';
    }
  }
}

function selectLockTypeCard(type) {
  _ltSelectedType = type;
  const isPIN = type === 'pin';
  // Cards
  const pinCard = document.getElementById('lt-pin-card');
  const pwCard  = document.getElementById('lt-pw-card');
  pinCard.style.border = isPIN ? '2px solid var(--gold)' : '2px solid var(--border)';
  pinCard.style.background = isPIN ? 'rgba(201,168,76,0.12)' : 'var(--bg)';
  pwCard.style.border  = !isPIN ? '2px solid var(--gold)' : '2px solid var(--border)';
  pwCard.style.background  = !isPIN ? 'rgba(201,168,76,0.12)' : 'var(--bg)';
  document.getElementById('lt-pin-check').style.display = isPIN  ? '' : 'none';
  document.getElementById('lt-pw-check').style.display  = !isPIN ? '' : 'none';
  // Sections
  document.getElementById('lt-pin-setup').style.display = isPIN  ? '' : 'none';
  document.getElementById('lt-pw-setup').style.display  = !isPIN ? '' : 'none';
  // Reset errors
  document.getElementById('lt-pin-err').textContent = '';
  document.getElementById('lt-pw-err').textContent  = '';
}

// PIN setup in chooser
function renderLtPin() {
  const el = document.getElementById('ltPinDots'); if (!el) return;
  const len = 6;
  el.textContent = '●'.repeat(_ltPinBuffer.length) + '─'.repeat(Math.max(0, len - _ltPinBuffer.length));
}
function ltPinPress(d) {
  if (_ltPinBuffer.length >= 12) return;
  _ltPinBuffer += d; renderLtPin();
}
function ltPinClear() {
  _ltPinBuffer = _ltPinBuffer.slice(0, -1); renderLtPin();
}
function ltPinDone() {
  const err = document.getElementById('lt-pin-err');
  if (_ltPinBuffer.length < 6) { err.textContent = '⚠ PIN must be 6–12 digits.'; return; }
  localStorage.setItem('mets_pin', _ltPinBuffer);
  localStorage.setItem('mets_lock_type', 'pin');
  hideLockTypeChooser();
  document.getElementById('createAccountScreen').style.display = 'flex';
}

// Password setup in chooser — live requirement checks
document.addEventListener('DOMContentLoaded', function() {
  const pw1 = document.getElementById('lt-pw1');
  if (pw1) pw1.addEventListener('input', checkLtPwReqs);
});
function checkLtPwReqs() {
  const pw = (document.getElementById('lt-pw1').value || '');
  const set = (id, ok) => {
    const el = document.getElementById(id); if (!el) return;
    el.style.color = ok ? 'var(--green,#48bb78)' : 'var(--text-light)';
    el.textContent = (ok ? '✔' : '○') + el.textContent.slice(1);
  };
  set('lt-req-len',  pw.length >= 8);
  set('lt-req-case', /[a-z]/.test(pw) && /[A-Z]/.test(pw));
  set('lt-req-num',  /[0-9]/.test(pw));
  set('lt-req-spec', /[^a-zA-Z0-9]/.test(pw));
}
function ltPwDone() {
  const uname = (document.getElementById('lt-username').value || '').trim();
  const pw1   = (document.getElementById('lt-pw1').value || '');
  const pw2   = (document.getElementById('lt-pw2').value || '');
  const err   = document.getElementById('lt-pw-err');
  if (!uname)        { err.textContent = '⚠ Username is required.'; return; }
  if (pw1.length < 8){ err.textContent = '⚠ Password must be at least 8 characters.'; return; }
  if (!/[a-z]/.test(pw1)||!/[A-Z]/.test(pw1)) { err.textContent = '⚠ Include uppercase and lowercase letters.'; return; }
  if (!/[0-9]/.test(pw1))      { err.textContent = '⚠ Include a number.'; return; }
  if (!/[^a-zA-Z0-9]/.test(pw1)) { err.textContent = '⚠ Include a special character.'; return; }
  if (pw1 !== pw2)   { err.textContent = '⚠ Passwords do not match.'; return; }
  localStorage.setItem('mets_username', uname);
  localStorage.setItem('mets_password', pw1);
  localStorage.setItem('mets_lock_type', 'password');
  // No PIN needed — skip create-account screen, go straight to login
  hideLockTypeChooser();
  showLoginScreen();
}

// ═══════════════════════════════════════════════════
// SHOW LOGIN SCREEN — respects lock type
// ═══════════════════════════════════════════════════
function showLoginScreen() {
  const type = 'password';
  const isPIN = type === 'pin';
  const pinMode = document.getElementById('login-pin-mode');
  const pwMode  = document.getElementById('login-pw-mode');
  if (pinMode) pinMode.style.display = isPIN ? '' : 'none';
  if (pwMode)  pwMode.style.display  = isPIN ? 'none' : '';
  document.getElementById('loginScreen').classList.remove('hidden');
}

// ═══════════════════════════════════════════════════
// PASSWORD LOGIN CHECK
// ═══════════════════════════════════════════════════
function toggleLoginPwVisibility() {
  const input = document.getElementById('login-pw-password');
  const icon  = document.getElementById('loginPwEyeIcon');
  const show  = input.type === 'password';
  input.type  = show ? 'text' : 'password';
  icon.innerHTML = show
    ? '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>';
}
function toggleLtPw1Visibility() {
  const input = document.getElementById('lt-pw1');
  const icon  = document.getElementById('ltPw1EyeIcon');
  const show  = input.type === 'password';
  input.type  = show ? 'text' : 'password';
  icon.innerHTML = show ? EYE_CLOSED_SVG : EYE_OPEN_SVG;
}
function toggleLtPw2Visibility() {
  const input = document.getElementById('lt-pw2');
  const icon  = document.getElementById('ltPw2EyeIcon');
  const show  = input.type === 'password';
  input.type  = show ? 'text' : 'password';
  icon.innerHTML = show ? EYE_CLOSED_SVG : EYE_OPEN_SVG;
}

function checkPassword() {
  const uname = (document.getElementById('login-pw-username').value || '').trim();
  const pw    = (document.getElementById('login-pw-password').value || '');
  const savedU = localStorage.getItem('mets_username') || '';
  const savedP = localStorage.getItem('mets_password') || '';
  const errEl  = document.getElementById('loginError');
  if (!savedU && !savedP) {
    if (!uname) { errEl.textContent = 'Enter a username to set up your account.'; return; }
    if (pw.length < 8) { errEl.textContent = 'First-time setup: password must be at least 8 characters.'; return; }
    localStorage.setItem('mets_username', uname);
    localStorage.setItem('mets_password', pw);
    localStorage.setItem('mets_lock_type', 'password');
    errEl.textContent = '';
    _doPostLogin(uname);
    return;
  }
  if (uname === savedU && pw === savedP) {
    errEl.textContent = '';
    _doPostLogin(uname);
  } else {
    errEl.textContent = 'Incorrect username or password.';
    document.getElementById('login-pw-password').value = '';
    document.getElementById('login-pw-password').focus();
  }
}
function _doPostLogin(uname) {
  document.getElementById('forgotPasswordLink').style.display = 'none';
  document.getElementById('loginScreen').classList.add('hidden');
  if (typeof logAction === 'function') logAction('System unlocked by ' + (uname || 'Admin'));
  if (typeof resetLockTimer === 'function') resetLockTimer();
  if (typeof initDashboard === 'function') initDashboard();
  const ab = document.getElementById('adminNameDisplay');
  if (ab) ab.textContent = uname || localStorage.getItem('mets_admin_name') || 'Admin';
  const ad = document.getElementById('adminDeptDisplay');
  if (ad) ad.textContent = localStorage.getItem('mets_admin_dept') || 'General Services Office';
  const av = document.getElementById('adminAvatarInitials');
  if (av) av.textContent = (uname || 'A').substring(0, 3).toUpperCase();
}

function resetPasswordCredentials() {
  if (!confirm('This will erase ALL saved credentials and authentication settings.\n\nSaved password changes will be cleared and the default accounts restored.\n\nContinue?')) return;

  // Wipe every auth key
  ['mets_pin','mets_password','mets_username','mets_lock_type'].forEach(k => localStorage.removeItem(k));

  // Hide the login screen
  const loginScreen = document.getElementById('loginScreen');
  if (loginScreen) loginScreen.classList.add('hidden');

  // Reset lock-type chooser card UI to default (PIN selected)
  const pinCard  = document.getElementById('lt-pin-card');
  const pwCard   = document.getElementById('lt-pw-card');
  const pinCheck = document.getElementById('lt-pin-check');
  const pwCheck  = document.getElementById('lt-pw-check');
  if (pinCard)  { pinCard.style.background  = 'rgba(201,168,76,0.12)'; pinCard.style.border  = '2px solid var(--gold)'; }
  if (pwCard)   { pwCard.style.background   = 'var(--bg)';             pwCard.style.border   = '2px solid var(--border)'; }
  if (pinCheck) pinCheck.style.display = '';
  if (pwCheck)  pwCheck.style.display  = 'none';

  // Hide password setup screen if open
  const pwSetup = document.getElementById('pwSetupScreen');
  if (pwSetup) pwSetup.style.display = 'none';

  // Go straight to the lock type chooser — fresh start, no reload
  if (typeof showLockTypeChooser === 'function') showLockTypeChooser();
}
