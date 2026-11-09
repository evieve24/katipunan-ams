/* Katipunan AMS - User administration page logic */
(function () {
  'use strict';
  var TOKEN_KEY = 'kat_token', USER_KEY = 'kat_user';
  var token = '';
  var me = null;
  var $ = function (id) { return document.getElementById(id); };

  try { token = localStorage.getItem(TOKEN_KEY) || ''; } catch (e) {}

  function signOut(message) {
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      keepalive: true
    }).catch(function () {});
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch (e) {}
    location.replace('login.html' + (message ? '?logout=1' : ''));
  }

  function toast(message, isError) {
    var el = $('toast');
    el.textContent = message;
    el.className = 'toast show' + (isError ? ' err' : '');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.className = 'toast'; }, 3200);
  }

  function api(path, options) {
    options = options || {};
    options.headers = Object.assign({ Authorization: 'Bearer ' + token }, options.headers || {});
    options.cache = 'no-store';
    return fetch(path, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (response.status === 401) {
          signOut(true);
          throw new Error('Session expired');
        }
        if (!response.ok) throw new Error(data.error || ('HTTP ' + response.status));
        return data;
      });
    });
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function roleClass(role) { return ['oic', 'inspector', 'gsostaff', 'officehead'].indexOf(role) >= 0 ? role : ''; }

  function loadStats() {
    api('/api/stats').then(function (data) {
      var s = data.stats;
      $('statAssets').textContent = s.assets;
      $('statDepartments').textContent = s.departments;
      $('statRepairs').textContent = s.repairRecords;
    }).catch(function (err) { toast(err.message, true); });
    api('/api/users').then(function (data) {
      $('statUsers').textContent = data.users.length;
      $('userCount').textContent = data.users.length + ' account' + (data.users.length === 1 ? '' : 's');
    }).catch(function () {});
  }

  function loadUsers() {
    api('/api/users').then(function (data) {
      var body = $('usersBody');
      if (!data.users.length) {
        body.innerHTML = '<tr><td colspan="5" class="empty">No accounts yet</td></tr>';
        return;
      }
      body.innerHTML = data.users.map(function (user) {
        var isMe = me && user.id === me.id;
        return '<tr>' +
          '<td><b>' + escapeHtml(user.name) + '</b><div class="muted">@' + escapeHtml(user.username) + (isMe ? ' · you' : '') + '</div></td>' +
          '<td><span class="pill ' + roleClass(user.role) + '">' + escapeHtml(user.role_label) + '</span></td>' +
          '<td>' + escapeHtml(user.office_label || '—') + '</td>' +
          '<td><span class="pill ' + (user.active ? 'on' : 'off') + '">' + (user.active ? 'Active' : 'Pending / disabled') + '</span></td>' +
          '<td><div class="row-actions">' +
            '<button class="btn small" data-action="password" data-id="' + user.id + '" data-name="' + escapeHtml(user.username) + '">Reset password</button>' +
            (isMe ? '' : '<button class="btn small" data-action="toggle" data-id="' + user.id + '" data-active="' + (user.active ? '1' : '0') + '">' + (user.active ? 'Disable' : 'Enable') + '</button>') +
            (isMe ? '' : '<button class="btn small danger" data-action="delete" data-id="' + user.id + '" data-name="' + escapeHtml(user.username) + '">Delete</button>') +
          '</div></td>' +
        '</tr>';
      }).join('');
      $('userCount').textContent = data.users.length + ' account' + (data.users.length === 1 ? '' : 's');
    }).catch(function (err) { toast(err.message, true); });
  }

  function loadAudit() {
    api('/api/audit?limit=80').then(function (data) {
      var list = $('auditList');
      if (!data.items.length) {
        list.innerHTML = '<div class="empty">No server activity yet</div>';
        return;
      }
      list.innerHTML = data.items.map(function (item) {
        return '<div class="audit-item"><b>' + escapeHtml(item.action.replace(/_/g, ' ')) + '</b>' +
          (item.detail ? ' · ' + escapeHtml(item.detail) : '') +
          '<div class="audit-meta">' + escapeHtml(item.username || 'anonymous') + ' · ' +
          escapeHtml(new Date(item.at).toLocaleString('en-PH')) + '</div></div>';
      }).join('');
    }).catch(function (err) { toast(err.message, true); });
  }

  function loadSession() {
    if (!token) { location.replace('login.html'); return; }
    api('/api/auth/me').then(function (data) {
      me = data.user;
      $('heroUser').textContent = me.name + ' · ' + me.role_label + ' · signed in to ' + location.host;
      if (me.role !== 'oic') {
        document.querySelector('.wrap').innerHTML =
          '<div class="denied"><h2>Administrator access required</h2>' +
          '<p class="muted" style="margin-bottom:16px">User administration is restricted to GSO-OIC accounts.</p>' +
          '<a class="btn gold" href="index.html">Return to the system</a></div>';
        return;
      }
      loadStats();
      loadUsers();
      loadAudit();
    }).catch(function (err) {
      if (err.message !== 'Session expired') {
        $('heroUser').textContent = 'Cannot reach the backend: ' + err.message;
        toast(err.message, true);
      }
    });
  }

  $('cRole').addEventListener('change', function () {
    $('officeRow').style.display = this.value === 'officehead' ? '' : 'none';
  });

  $('createForm').addEventListener('submit', function (event) {
    event.preventDefault();
    var msg = $('createMsg');
    msg.className = 'msg';
    msg.textContent = '';
    var payload = {
      name: $('cName').value.trim(),
      username: $('cUser').value.trim(),
      password: $('cPass').value,
      role: $('cRole').value,
      office: $('cRole').value === 'officehead' ? $('cOffice').value : null
    };
    var btn = $('createBtn');
    btn.disabled = true;
    api('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (data) {
      msg.className = 'msg ok';
      msg.textContent = 'Account created for ' + data.user.name + '.';
      $('createForm').reset();
      $('cRole').value = 'gsostaff';
      $('officeRow').style.display = 'none';
      loadUsers();
      loadStats();
      loadAudit();
      toast('Account created');
    }).catch(function (err) {
      msg.className = 'msg err';
      msg.textContent = err.message;
    }).then(function () { btn.disabled = false; });
  });

  $('usersBody').addEventListener('click', function (event) {
    var button = event.target.closest('button[data-action]');
    if (!button) return;
    var action = button.dataset.action;
    var id = button.dataset.id;
    if (action === 'password') {
      var newPassword = prompt('New password for @' + button.dataset.name + ' (at least 8 characters):');
      if (!newPassword) return;
      api('/api/users/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      }).then(function () { toast('Password updated'); loadAudit(); })
        .catch(function (err) { toast(err.message, true); });
    } else if (action === 'toggle') {
      var nextActive = button.dataset.active !== '1';
      api('/api/users/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextActive })
      }).then(function () { toast(nextActive ? 'Account enabled' : 'Account disabled'); loadUsers(); loadAudit(); })
        .catch(function (err) { toast(err.message, true); });
    } else if (action === 'delete') {
      if (!confirm('Delete the account @' + button.dataset.name + '?\n\nThis cannot be undone.')) return;
      api('/api/users/' + id, { method: 'DELETE' })
        .then(function () { toast('Account deleted'); loadUsers(); loadStats(); loadAudit(); })
        .catch(function (err) { toast(err.message, true); });
    }
  });

  $('refreshAudit').addEventListener('click', loadAudit);

  $('exportBtn').addEventListener('click', function () {
    fetch('/api/export', { headers: { Authorization: 'Bearer ' + token } })
      .then(function (response) {
        if (!response.ok) throw new Error('Export failed (HTTP ' + response.status + ')');
        return response.blob();
      })
      .then(function (blob) {
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'katipunan-ams-backup-' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        $('backupMsg').className = 'msg ok';
        $('backupMsg').textContent = 'Backup downloaded.';
        loadAudit();
      })
      .catch(function (err) {
        $('backupMsg').className = 'msg err';
        $('backupMsg').textContent = err.message;
      });
  });

  $('importFile').addEventListener('change', function () {
    var file = this.files && this.files[0];
    if (!file) return;
    var replace = confirm('Replace all server state with this backup?\n\nOK = replace everything\nCancel = merge/overwrite matching keys only');
    var reader = new FileReader();
    reader.onload = function () {
      var payload;
      try { payload = JSON.parse(reader.result); } catch (e) {
        $('backupMsg').className = 'msg err';
        $('backupMsg').textContent = 'That file is not valid JSON.';
        return;
      }
      api('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: payload.state || payload, replace: replace })
      }).then(function (data) {
        $('backupMsg').className = 'msg ok';
        $('backupMsg').textContent = 'Imported ' + data.imported + ' state keys.';
        loadStats(); loadAudit();
      }).catch(function (err) {
        $('backupMsg').className = 'msg err';
        $('backupMsg').textContent = err.message;
      });
      $('importFile').value = '';
    };
    reader.readAsText(file);
  });

  $('logoutBtn').addEventListener('click', function () { signOut(false); });
  loadSession();
})();
