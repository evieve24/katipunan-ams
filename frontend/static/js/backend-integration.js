/* Katipunan AMS - Backend session integration
   Extracted from frontend/templates/index.html. */

(function () {
  'use strict';
  var user = window.__KAT_USER__ || null;
  var token = window.__KAT_TOKEN__ || '';

  var ROLE_APP = {
    oic: 'GSO-OIC',
    inspector: 'Inspectorate Personnel',
    gsostaff: 'GSO Office Personnel',
    officehead: 'Municipal Office Head'
  };

  function apiLogin(username, password) {
    return fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ username: username, password: password })
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) throw new Error(data.error || 'Incorrect username or password.');
        return data;
      });
    });
  }

  function storeSession(data) {
    localStorage.setItem('kat_token', data.token);
    localStorage.setItem('kat_user', JSON.stringify(data.user));
    try { sessionStorage.setItem('kat_skip_landing', '1'); } catch (e) {}
  }

  if (!user) {
    // No active session: use the app's own v71 role/login screens, backed by
    // the server instead of the old browser-only credential list.
    function byId(id) { return document.getElementById(id); }
    function showLoginError(message) {
      var el = byId('loginError');
      if (!el) return;
      el.textContent = message || '';
      if (message) el.classList.add('show');
      else el.classList.remove('show');
    }

    window.checkPassword = function () {
      var un = ((byId('login-pw-username') || {}).value || '').trim();
      var pw = ((byId('login-pw-password') || {}).value || '');
      var role = window._pendingRole;
      if (!role) { try { window.showRoleSelect(); } catch (e) {} return; }
      if (!un || !pw) { showLoginError('Enter your username and password.'); return; }
      showLoginError('Signing in…');
      apiLogin(un, pw).then(function (data) {
        if (data.user.role !== role) {
          throw new Error('This account is registered as ' +
            (ROLE_APP[data.user.role] || data.user.role) + '. Choose that role and try again.');
        }
        storeSession(data);
        location.reload();
      }).catch(function (err) {
        showLoginError(err.message || 'Sign-in failed. Check the server connection.');
        var field = byId('login-pw-password');
        if (field) { field.value = ''; field.focus(); }
      });
    };

    window.doLogin = function () {
      var un = ((byId('loginUsername') || {}).value || '').trim();
      var pw = ((byId('loginPassword') || {}).value || '');
      var err = byId('loginError');
      if (!un || !pw) {
        if (err) { err.textContent = 'Enter your username and password.'; err.classList.add('show'); }
        return;
      }
      apiLogin(un, pw).then(function (data) {
        storeSession(data);
        location.reload();
      }).catch(function (e) {
        if (err) { err.textContent = e.message || 'Incorrect username or password.'; err.classList.add('show'); }
        var field = byId('loginPassword');
        if (field) { field.value = ''; field.focus(); }
      });
    };

    // Sign-up is available for Inspectorate, GSO Office, and Municipal Office
    // Head accounts. New accounts stay inactive until the GSO-OIC enables them.
    var baseSelectRole = window.selectRole;
    if (typeof baseSelectRole === 'function') {
      window.selectRole = function (perm) {
        var result = baseSelectRole.apply(this, arguments);
        var link = byId('signupLink');
        if (link) link.textContent = 'Sign up';
        showLoginError('');
        return result;
      };
    }
    window.submitSignup = function () {
      var role = window._pendingRole;
      var allowed = { inspector: 1, gsostaff: 1, officehead: 1 };
      if (!allowed[role]) return;
      var nameField = byId('suName');
      var userField = byId('suUser');
      var pwField = byId('suPw');
      var pw2Field = byId('suPw2');
      var officeField = byId('suOffice');
      var errField = byId('suErr');
      var name = ((nameField || {}).value || '').trim();
      var username = ((userField || {}).value || '').trim();
      var password = (pwField || {}).value || '';
      var confirm = (pw2Field || {}).value || '';
      var office = role === 'officehead' ? ((officeField || {}).value || '') : null;
      function fail(message) {
        if (errField) errField.textContent = message;
      }
      if (!name || !username) {
        fail('Please enter your name and a username.');
        return;
      }
      if (!/^[A-Za-z0-9._-]{3,32}$/.test(username)) {
        fail('Username: 3-32 letters, numbers, . _ or -');
        return;
      }
      if (password.length < 8) {
        fail('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirm) {
        fail('Passwords do not match.');
        return;
      }
      if (role === 'officehead' && !office) {
        fail('Select your office.');
        return;
      }
      var submit = document.querySelector(
        '#signupModal button[onclick="submitSignup()"]'
      );
      if (submit) submit.disabled = true;
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          name: name,
          username: username,
          password: password,
          role: role,
          office: office
        })
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          if (!response.ok) throw new Error(data.error || 'Registration failed.');
          return data;
        });
      }).then(function () {
        if (typeof closeSignup === 'function') closeSignup();
        showLoginError(
          'Sign-up submitted. The GSO-OIC must approve your account before you can sign in.'
        );
      }).catch(function (err) {
        fail(err.message || 'Registration failed. Check the server connection.');
        if (submit) submit.disabled = false;
      });
    };
    window.resetPasswordCredentials = function () {
      showLoginError('Passwords are managed on the server. Ask the GSO-OIC to reset your password.');
    };

    return;
  }

  var roleLabel = ROLE_APP[user.role] || user.role || 'GSO Office Personnel';

  // Feed the app's own account model so role-based menus keep working.
  try {
    var acc = null;
    for (var i = 0; i < GSO_CREDS.length; i++) {
      if (GSO_CREDS[i].un === user.username) acc = GSO_CREDS[i];
    }
    if (!acc) {
      acc = { un: user.username, pw: '', name: user.name, perm: user.role };
      GSO_CREDS.push(acc);
    }
    acc.name = user.name;
    acc.perm = user.role;
    // The server is authoritative for an Office Head's office. This prevents
    // a stale/demo local account with the same display name from widening the
    // equipment list beyond the head's own office.
    acc.office = user.office || acc.office;
    isGSOLoggedIn = true;
    currentGSOUser = acc;
  } catch (e) {
    console.warn('KAT identity setup failed', e);
  }

  function setIfChanged(key, value) {
    try {
      if (localStorage.getItem(key) !== value) localStorage.setItem(key, value);
    } catch (e) {}
  }
  setIfChanged('mets_admin_name', user.name);
  setIfChanged('mets_admin_user', user.username);
  setIfChanged('mets_admin_dept', user.office_label || 'General Services Office');

  window.KAT_USER = user;

  // User administration is an OIC-only destination inside Settings.
  try {
    if (user.role !== 'oic') {
      var userAdminRow = document.getElementById('userAdminSettingRow');
      if (userAdminRow) userAdminRow.style.display = 'none';
    }
  } catch (e) {}

  // Bypass the local auth screens — the server already authenticated this user.
  window.initPostLanding = function () {
    var landing = document.getElementById('landingScreen');
    if (landing) { landing.classList.add('fade-out'); landing.style.display = 'none'; }
    var roleScreen = document.getElementById('roleSelectScreen');
    if (roleScreen) roleScreen.style.display = 'none';
    var login = document.getElementById('loginScreen');
    if (login) login.classList.add('hidden');
    try { window._doPostLogin(user.name); } catch (e) { console.warn('KAT post-login failed', e); }
    try { var ad = document.getElementById('adminDeptDisplay'); if (ad) ad.textContent = user.office_label || roleLabel; } catch (e) {}
    try { if (typeof updateDDLoginState === 'function') updateDDLoginState(); } catch (e) {}
  };
  window.showRoleSelect = function () {};
  window.showLoginScreen = function () { window.initPostLanding(); };
  window.resetLockTimer = function () { try { clearTimeout(lockTimer); } catch (e) {} };

  window.confirmLogout = function () {
    try { document.getElementById('logoutConfirmModal').classList.remove('open'); } catch (e) {}
    try {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
    try { localStorage.removeItem('kat_token'); localStorage.removeItem('kat_user'); } catch (e) {}
    location.replace('./');
  };
  window.lockSystem = function () { window.confirmLogout(); };

  // ── Record reports and backups in the normalized ERD tables ──
  function recordErd(path, payload) {
    try {
      fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(payload || {})
      }).catch(function () {});
    } catch (e) {}
  }
  function erdAllowed(action) {
    try { return typeof can !== 'function' || can(action); } catch (e) { return true; }
  }
  window.katRecordBackup = function (fileName, storageType) {
    if (!fileName) return;
    recordErd('/api/backups', { fileName: fileName, storageType: storageType, status: 'completed' });
  };
  [
    ['exportMasterCSV', 'Asset master list CSV', 'export'],
    ['exportActivityLogCSV', 'Activity log CSV', 'export'],
    ['pfPrintReport', 'Procurement forecast report', 'view:reports']
  ].forEach(function (spec) {
    var fn = window[spec[0]];
    if (typeof fn !== 'function') return;
    window[spec[0]] = function () {
      var result = fn.apply(this, arguments);
      if (erdAllowed(spec[2])) {
        recordErd('/api/reports', {
          type: spec[1],
          period: new Date().toISOString().slice(0, 7),
          filePath: null
        });
      }
      return result;
    };
  });

  // Small cloud-save indicator in the corner.
  function ensurePill() {
    var pill = document.getElementById('katServerPill');
    if (pill) return pill;
    pill = document.createElement('div');
    pill.id = 'katServerPill';
    pill.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:2147483000;display:flex;align-items:center;' +
      'gap:6px;font:600 11px/1 "Source Sans 3",system-ui,sans-serif;padding:7px 11px;border-radius:999px;' +
      'background:rgba(13,27,62,.92);color:#e8c96d;border:1px solid rgba(201,168,76,.45);' +
      'box-shadow:0 4px 16px rgba(0,0,0,.28);opacity:0;transition:opacity .25s;pointer-events:none';
    var dot = document.createElement('span');
    dot.id = 'katServerDot';
    dot.style.cssText = 'width:7px;height:7px;border-radius:50%;background:#6ee7a0';
    var label = document.createElement('span');
    label.id = 'katServerText';
    label.textContent = 'Cloud: connected';
    pill.appendChild(dot);
    pill.appendChild(label);
    document.body.appendChild(pill);
    return pill;
  }

  function pillStatus(status, text) {
    if (status === 'saved') {
      try { localStorage.setItem('kat_last_sync', new Date().toISOString()); } catch (e) {}
    }
    try {
      var pill = ensurePill();
      var dot = document.getElementById('katServerDot');
      var label = document.getElementById('katServerText');
      var color = status === 'offline' ? '#ff8a80' : status === 'saving' ? '#e8c96d' : '#6ee7a0';
      if (dot) dot.style.background = color;
      if (label) label.textContent = text;
      pill.style.opacity = '1';
      if (pillStatus.timer) clearTimeout(pillStatus.timer);
      if (status === 'saved' || status === 'offline') {
        pillStatus.timer = setTimeout(function () { pill.style.opacity = '0'; }, 2400);
      }
    } catch (e) {}
  }

  window.addEventListener('kat-sync', function (event) {
    var detail = event.detail || {};
    pillStatus(detail.status || 'saved', detail.text || 'Cloud: saved');
  });

  function bootStatus() {
    var initial = window.__KAT_STATUS__ || {};
    setTimeout(function () {
      pillStatus(initial.status || (window.__KAT_ONLINE__ ? 'saved' : 'offline'),
        initial.text || (window.__KAT_ONLINE__ ? 'Cloud: connected' : 'Cloud: offline'));
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(bootStatus, 0); });
  } else {
    setTimeout(bootStatus, 0);
  }
})();
