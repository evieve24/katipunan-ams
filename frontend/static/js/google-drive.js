/* Katipunan AMS - Google Account / Drive Sync panel
   -------------------------------------------------
   LGU server sync works out of the box. Google Drive uploads are optional.

   To enable Drive with a real Google account:
   1. Create an OAuth 2.0 Web client in Google Cloud Console.
   2. Enable the Google Drive API for the project.
   3. Add your app origin (e.g. http://localhost:8080) to the
      authorized JavaScript origins.
   4. Set GOOGLE_CLIENT_ID in the project .env file, or paste the client ID
      in this panel (GSO-OIC) and click "Save & Connect Google".
*/
'use strict';

let googleClientId = window.GOOGLE_CLIENT_ID || '';
const GOOGLE_DRIVE_SCOPE =
  'https://www.googleapis.com/auth/drive.file openid email profile';

let _gsiLoadPromise = null;

// No Google account is connected until the user clicks "Sign in with Google".
// The access token is kept in memory for this page session only and is never
// written to MariaDB, localStorage, or sessionStorage.

function gdUser() {
  if (window.KAT_USER) return window.KAT_USER;
  if (typeof currentGSOUser !== 'undefined' && currentGSOUser) return currentGSOUser;
  return null;
}

function gdIsAdmin() {
  const user = gdUser();
  return !!(user && (user.role === 'oic' || user.perm === 'oic'));
}

function gdSetText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function gdFormatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  const value = n / Math.pow(1024, i);
  return (i === 0 ? Math.round(value) : value.toFixed(1)) + ' ' + units[i];
}

function gdOnline() {
  return typeof isOnline === 'boolean' ? isOnline : navigator.onLine;
}

function gdPending() {
  try {
    return Array.isArray(pendingSync) ? pendingSync.length : 0;
  } catch (e) {
    return 0;
  }
}

function gdLastSyncText() {
  let raw = null;
  try { raw = localStorage.getItem('kat_last_sync'); } catch (e) {}
  if (!raw) return 'Last sync: this session';
  const stamp = new Date(raw);
  if (isNaN(stamp.getTime())) return 'Last sync: this session';
  return 'Last sync: ' + stamp.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
}

async function loadGoogleConfig() {
  try {
    const token = localStorage.getItem('kat_token') || '';
    if (!token) return googleClientId;
    const res = await fetch('/api/config', {
      headers: { Authorization: 'Bearer ' + token },
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.googleClientId === 'string') {
        googleClientId = data.googleClientId.trim();
      }
    }
  } catch (e) {
    /* Server config is optional; the panel still works for server sync. */
  }
  gdRenderSetup();
  if (googleClientId) gdLoadGsi().catch(function () {});
  return googleClientId;
}

function gdRenderSetup() {
  const setup = document.getElementById('gdpSetup');
  if (!setup) return;
  const configured = !!googleClientId;
  const admin = gdIsAdmin();
  setup.style.display = !configured && admin ? 'block' : 'none';
  const msg = document.getElementById('gdpSetupMsg');
  if (msg && !configured) msg.textContent = '';
  const originEl = document.getElementById('gdpSetupOrigin');
  if (originEl) originEl.textContent = location.origin;
  const status = document.getElementById('gdpSetupStatus');
  if (status) {
    const secure =
      location.protocol === 'https:' ||
      /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    status.textContent = secure
      ? ''
      : 'Google sign-in requires localhost or HTTPS. This page is ' + location.origin + '.';
    status.style.color = secure ? 'rgba(168,184,212,0.55)' : '#efaa27';
  }
  const change = document.getElementById('gdpChangeClient');
  if (change) change.style.display = configured && admin ? 'flex' : 'none';
  const clearBtn = document.getElementById('gdpClearClientBtn');
  if (clearBtn) clearBtn.style.display = configured ? 'block' : 'none';
}

function gdShowSetup() {
  if (!gdIsAdmin()) {
    ms_showToast('Only the GSO-OIC can configure Google Drive backup');
    return;
  }
  const setup = document.getElementById('gdpSetup');
  if (!setup) return;
  setup.style.display = 'block';
  const input = document.getElementById('gdpClientId');
  if (input) {
    input.value = googleClientId || '';
    try { input.focus(); } catch (e) {}
  }
  try { setup.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
}

async function saveGoogleClientId() {
  const input = document.getElementById('gdpClientId');
  const msg = document.getElementById('gdpSetupMsg');
  const value = (input && input.value ? input.value : '').trim();
  if (msg) { msg.textContent = ''; msg.style.color = '#f09595'; }
  if (!/^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/.test(value)) {
    if (msg) {
      if (value.indexOf('@') >= 0) {
        msg.textContent =
          'That looks like an email. Paste the OAuth Client ID from Google Cloud Console — it ends with .apps.googleusercontent.com. Your Gmail is used later on the Google sign-in screen.';
      } else {
        msg.textContent =
          'Paste the OAuth Client ID from Google Cloud Console. It looks like 1234567890-xxxx.apps.googleusercontent.com.';
      }
    }
    if (input) input.select();
    return;
  }
  try {
    const token = localStorage.getItem('kat_token') || '';
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ googleClientId: value })
    });
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.error || 'Could not save the client ID');
    googleClientId = data.googleClientId || value;
    gdRenderSetup();
    gdRenderAccount();
    gdLoadGsi().catch(function () {});
    if (msg) {
      msg.textContent = 'Saved. Now click Sign in with Google.';
      msg.style.color = '#34A853';
    }
    ms_showToast('✅ Google client ID saved — click Sign in with Google');
  } catch (e) {
    if (msg) msg.textContent = e.message || 'Could not save the client ID';
  }
}

async function clearGoogleClientId() {
  if (!confirm('Remove the saved Google OAuth client ID and disconnect Google Drive?')) return;
  const msg = document.getElementById('gdpSetupMsg');
  try {
    const token = localStorage.getItem('kat_token') || '';
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ googleClientId: '' })
    });
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.error || 'Could not remove the client ID');
    gdRevokeToken();
    window.GDRIVE_ACCESS_TOKEN = '';
    window.GDRIVE_PROFILE = null;
    googleClientId = '';
    gdShowSetup();
    await refreshGDriveProfile();
    if (msg) {
      msg.textContent = 'Client ID removed.';
      msg.style.color = '#34A853';
    }
    ms_showToast('Google client ID removed');
  } catch (e) {
    if (msg) msg.textContent = e.message || 'Could not remove the client ID';
  }
}

function gdRenderAccount() {
  const user = gdUser();
  const connected = !!window.GDRIVE_ACCESS_TOKEN;
  const profile = connected ? window.GDRIVE_PROFILE || null : null;
  const systemName =
    (user && (user.name || user.full_name)) ||
    localStorage.getItem('mets_admin_name') ||
    'GSO Admin';
  const username =
    (user && (user.username || user.un)) ||
    localStorage.getItem('mets_admin_user') ||
    'gso.admin';

  gdSetText(
    'gdpLguAccount',
    'LGU account: ' + systemName + (username ? ' (' + username + ')' : '')
  );

  if (connected) {
    gdSetText(
      'gdpName',
      (profile && (profile.name || profile.given_name)) || 'Google account connected'
    );
    gdSetText('gdpEmail', (profile && profile.email) || 'Loading Google profile…');
    gdSetText('gdpBadgeText', 'Google Drive Connected');
  } else {
    gdSetText('gdpName', 'Google Drive Backup');
    gdSetText('gdpEmail', 'No Google account connected');
    gdSetText('gdpBadgeText', 'Google Drive Not Connected');
  }

  const badge = document.getElementById('gdpBadge');
  if (badge) {
    badge.style.background = connected ? 'rgba(52,168,83,0.15)' : 'rgba(168,184,212,0.10)';
    badge.style.borderColor = connected ? 'rgba(52,168,83,0.3)' : 'rgba(168,184,212,0.25)';
    badge.style.color = connected ? '#34A853' : '#8a9bb8';
  }

  gdSetText('gdpConnectLabel', connected ? 'Google Drive Connected' : 'Sign in with Google');
  gdSetText(
    'gdpConnectSub',
    connected
      ? profile && profile.email
        ? 'Backups upload to ' + profile.email
        : 'Connected Google Drive'
      : googleClientId
        ? 'Use your own Google account for backup'
        : gdIsAdmin()
          ? 'Configure the OAuth client ID below'
          : 'Ask the GSO-OIC to configure Google Drive backup'
  );

  const connectAction = document.getElementById('gdpConnectAction');
  if (connectAction) connectAction.style.display = connected ? 'none' : 'flex';
  const switchAction = document.getElementById('gdpSwitchAccount');
  if (switchAction) switchAction.style.display = connected ? 'flex' : 'none';
  const backupNow = document.getElementById('gdpBackupNow');
  if (backupNow) backupNow.style.display = connected ? 'flex' : 'none';
  const logout = document.getElementById('gdpLogoutBtn');
  if (logout) logout.style.display = connected ? 'flex' : 'none';

  gdRenderSetup();
}

function gdRenderSyncStatus() {
  const online = gdOnline();
  const pending = gdPending();
  const state = document.getElementById('gdpSyncState');
  const sub = document.getElementById('gdpLastSync');
  const icon = document.getElementById('gdpSyncIcon');
  const badge = document.getElementById('gdpSyncBadge');

  let text = 'All records synced to LGU server';
  let color = '#34A853';
  let iconClass = 'ti-cloud-check';
  if (!online) {
    text = 'Offline — changes saved locally';
    color = '#efaa27';
    iconClass = 'ti-cloud-off';
  } else if (pending) {
    text = pending + ' change' + (pending === 1 ? '' : 's') + ' waiting to sync';
    color = '#efaa27';
    iconClass = 'ti-cloud-upload';
  }

  if (state) { state.textContent = text; state.style.color = color; }
  if (sub) sub.textContent = gdLastSyncText();
  if (icon) { icon.className = 'ti ' + iconClass; icon.style.color = color; }
  if (badge) {
    badge.textContent = String(pending);
    badge.style.display = pending ? 'inline-block' : 'none';
  }
}

function gdRenderStorage(title, used, total, percent, note) {
  gdSetText('gdpStorageTitle', title);
  gdSetText('gdpStorageUsed', gdFormatBytes(used) + ' used');
  gdSetText('gdpStorageTotal', total > 0 ? gdFormatBytes(total) + ' total' : 'MariaDB');
  const fill = document.getElementById('gdpStorageFill');
  if (fill) fill.style.width = Math.max(used > 0 ? 4 : 0, Math.min(100, percent || 0)) + '%';
  gdSetText('gdpStorageNote', note || '');
}

async function gdFetchGoogleProfile(token) {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (res.ok) window.GDRIVE_PROFILE = await res.json();
  } catch (e) {
    /* Profile is optional; the LGU account remains visible separately. */
  }
}

async function gdRefreshStorage() {
  const token = window.GDRIVE_ACCESS_TOKEN;
  let fallbackNote = '';
  if (token) {
    try {
      if (!window.GDRIVE_PROFILE) await gdFetchGoogleProfile(token);
      const res = await fetch(
        'https://www.googleapis.com/drive/v3/about?fields=storageQuota',
        { headers: { Authorization: 'Bearer ' + token } }
      );
      if (res.status === 401) {
        window.GDRIVE_ACCESS_TOKEN = '';
        throw new Error('Google Drive session expired');
      }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const quota = data.storageQuota || {};
      const used = Number(quota.usage || 0);
      const limit = Number(quota.limit || 0);
      gdRenderStorage(
        'Google Drive Storage',
        used,
        limit,
        limit > 0 ? (used / limit) * 100 : 0,
        'Backup destination: Google Drive'
      );
      gdRenderAccount();
      return;
    } catch (e) {
      fallbackNote = 'Google Drive quota unavailable — showing LGU server storage. ';
      logAction('Google Drive quota unavailable: ' + (e && e.message ? e.message : e));
    }
  }

  try {
    const authToken = localStorage.getItem('kat_token') || '';
    const res = await fetch('/api/storage', {
      headers: { Authorization: 'Bearer ' + authToken },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const used = Number(data.databaseBytes || 0);
    const appBytes = Number(data.appStateBytes || 0);
    const backups = Number(data.backupCount || 0);
    gdRenderStorage(
      'LGU Server Storage',
      used,
      0,
      used > 0 ? 100 : 0,
      fallbackNote +
        gdFormatBytes(appBytes) +
        ' application data · ' +
        backups +
        ' backup' +
        (backups === 1 ? '' : 's')
    );
  } catch (e) {
    gdRenderStorage('LGU Server Storage', 0, 0, 0, fallbackNote + 'Storage information unavailable.');
  }
  gdRenderAccount();
}

async function refreshGDriveProfile() {
  await loadGoogleConfig();
  gdRenderAccount();
  gdRenderSyncStatus();
  await gdRefreshStorage();
  gdRenderSetup();
}

function openGDriveProfile() {
  const overlay = document.getElementById('gdriveProfileOverlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  refreshGDriveProfile();
}

function closeGDriveProfile() {
  const overlay = document.getElementById('gdriveProfileOverlay');
  if (overlay) overlay.style.display = 'none';
}

function gdLoadGsi() {
  if (window.google && window.google.accounts && window.google.accounts.oauth2) {
    return Promise.resolve();
  }
  if (_gsiLoadPromise) return _gsiLoadPromise;
  _gsiLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) resolve();
      else reject(new Error('Google sign-in is unavailable'));
    };
    script.onerror = () => reject(new Error('Google sign-in failed to load'));
    document.head.appendChild(script);
  });
  return _gsiLoadPromise;
}

function connectGoogleDrive(forceAccountChoice) {
  if (!googleClientId) {
    if (gdIsAdmin()) {
      gdShowSetup();
      ms_showToast('Add your Google OAuth client ID to enable Google Drive backup');
      const note = document.getElementById('gdpStorageNote');
      if (note) {
        note.textContent =
          'Paste your OAuth client ID below. Create one in Google Cloud Console with the Drive API enabled.';
      }
    } else {
      ms_showToast('Google Drive backup is not configured — ask the GSO-OIC');
    }
    logAction('Google Drive sign-in requested without a client ID');
    return;
  }

  const secure =
    location.protocol === 'https:' ||
    /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (!secure) {
    const message =
      'Google sign-in requires localhost or HTTPS. This page is ' + location.origin + '.';
    ms_showToast(message);
    const note = document.getElementById('gdpStorageNote');
    if (note) note.textContent = message;
    logAction(message);
    return;
  }

  if (!(window.google && window.google.accounts && window.google.accounts.oauth2)) {
    ms_showToast('Preparing Google sign-in…');
    gdLoadGsi()
      .then(function () {
        connectGoogleDrive(forceAccountChoice);
      })
      .catch(function (e) {
        ms_showToast('Google sign-in library could not load — check your internet connection');
        logAction('Google sign-in load failed: ' + (e && e.message ? e.message : e));
      });
    return;
  }

  function reportError(code) {
    const text = String(code || 'unknown');
    let message = 'Google sign-in failed: ' + text;
    if (text === 'access_denied') {
      message = 'Google sign-in was cancelled or access was denied.';
    } else if (text === 'origin_mismatch') {
      message =
        'Google origin mismatch. Add ' + location.origin + ' to Authorized JavaScript origins.';
    } else if (text === 'invalid_client') {
      message = 'The Google client ID is invalid. Check the OAuth Web client ID.';
    } else if (text.indexOf('popup') >= 0) {
      message =
        'Google sign-in popup was blocked or closed. Allow popups for this site and try again.';
    }
    ms_showToast(message);
    const note = document.getElementById('gdpStorageNote');
    if (note) note.textContent = message;
    logAction(message);
  }

  try {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      scope: GOOGLE_DRIVE_SCOPE,
      callback: async (response) => {
        if (response.error) {
          reportError(response.error);
          return;
        }
        window.GDRIVE_ACCESS_TOKEN = response.access_token;
        window.GDRIVE_PROFILE = null;
        await gdFetchGoogleProfile(response.access_token);
        await refreshGDriveProfile();
        ms_showToast('✅ Google Drive connected');
        logAction('Connected Google Drive');
      },
      error_callback: (err) => {
        reportError((err && (err.type || err.message)) || 'unknown');
      }
    });
    client.requestAccessToken({ prompt: forceAccountChoice ? 'select_account' : '' });
  } catch (e) {
    ms_showToast('Google sign-in unavailable — check your configuration');
    logAction('Google Drive sign-in failed: ' + (e && e.message ? e.message : e));
  }
}

function addGmailAccount() {
  connectGoogleDrive(true);
}

function switchGoogleAccount() {
  if (!window.GDRIVE_ACCESS_TOKEN) {
    connectGoogleDrive(true);
    return;
  }
  gdRevokeToken();
  window.GDRIVE_ACCESS_TOKEN = '';
  window.GDRIVE_PROFILE = null;
  refreshGDriveProfile();
  ms_showToast(
    'Google Drive disconnected — click Sign in with Google to choose another account'
  );
}

function switchGmailAccount() {
  switchGoogleAccount();
}

async function gdRevokeToken() {
  const token = window.GDRIVE_ACCESS_TOKEN;
  if (!token) return;
  try {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      window.google.accounts.oauth2.revoke(token);
      return;
    }
    await fetch('https://oauth2.googleapis.com/revoke?token=' + encodeURIComponent(token), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  } catch (e) {
    /* Local disconnect still proceeds if revocation fails. */
  }
}

async function logoutGDrive() {
  if (!window.GDRIVE_ACCESS_TOKEN) {
    ms_showToast('Google Drive is not connected — LGU server sync stays active');
    return;
  }
  if (!confirm('Disconnect Google Drive? Existing backups stay in Drive and on the LGU server.')) return;
  await gdRevokeToken();
  window.GDRIVE_ACCESS_TOKEN = '';
  window.GDRIVE_PROFILE = null;
  await refreshGDriveProfile();
  ms_showToast('👋 Google Drive disconnected');
  logAction('Disconnected Google Drive');
}

function updateCloudLabel() {
  const online = gdOnline();
  const pending = gdPending();
  const label = document.getElementById('qrCloudLabel');
  const icon = document.getElementById('qrCloudIcon');
  if (label) {
    label.textContent = !online ? 'Offline' : pending ? pending + ' pending' : 'Synced to server';
  }
  if (icon) {
    icon.style.color = !online ? 'rgba(192,57,43,0.7)' : pending ? '#efaa27' : '#34A853';
  }
}

function showCloudStatus() {
  updateCloudLabel();
  const online = gdOnline();
  const pending = gdPending();
  if (!online) {
    ms_showToast('📴 Offline — changes are saved locally and will sync later');
  } else if (pending) {
    ms_showToast('☁️ ' + pending + ' change' + (pending === 1 ? '' : 's') + ' waiting to sync');
  } else {
    ms_showToast('☁️ All records synced to the LGU server');
  }
}

window.refreshGDriveProfile = refreshGDriveProfile;

window.addEventListener('kat-sync', function () {
  updateCloudLabel();
  const overlay = document.getElementById('gdriveProfileOverlay');
  if (overlay && overlay.style.display === 'flex') gdRenderSyncStatus();
});

document.addEventListener('DOMContentLoaded', function () {
  updateCloudLabel();
  loadGoogleConfig();
});
