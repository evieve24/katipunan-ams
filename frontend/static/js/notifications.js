/* Katipunan AMS - GSO-OIC notification panel and real-time feed. */
'use strict';

(function () {
  let items = [];
  let unread = 0;
  let filter = 'all';
  let stream = null;
  let pollTimer = null;

  function currentUser() {
    return (
      window.KAT_USER ||
      window.__KAT_USER__ ||
      (typeof currentGSOUser !== 'undefined' ? currentGSOUser : null)
    );
  }

  function isOic() {
    const user = currentUser();
    return !!(user && (user.role === 'oic' || user.perm === 'oic'));
  }

  function authToken() {
    try {
      return localStorage.getItem('kat_token') || '';
    } catch (e) {
      return '';
    }
  }

  function el(id) {
    return document.getElementById(id);
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtTime(iso, withSeconds) {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return iso || '—';
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    if (withSeconds) options.second = '2-digit';
    return date.toLocaleString('en-PH', options);
  }

  function itemSummary(item) {
    const asset = item.asset_name || item.asset_id || '';
    return item.label + (asset ? ' · ' + asset : '');
  }

  async function api(path, options) {
    const opts = options || {};
    opts.headers = Object.assign({}, opts.headers || {}, {
      Authorization: 'Bearer ' + authToken(),
    });
    const response = await fetch(path, opts);
    const data = await response.json().catch(function () {
      return {};
    });
    if (!response.ok) throw new Error(data.error || 'HTTP ' + response.status);
    return data;
  }

  async function load() {
    if (!authToken()) return;
    try {
      const data = await api('/api/notifications?limit=100');
      items = Array.isArray(data.items) ? data.items : [];
      unread = Number(data.unread) || 0;
      render();
    } catch (e) {
      /* Keep the last rendered list if the server is temporarily unavailable. */
    }
  }

  function render() {
    renderBell();
    renderDashboard();
    renderPanel();
    renderAlertsCount();
  }

  function equipmentAlerts() {
    if (typeof getAllEquipment !== 'function') return [];
    var bad = ['Damaged', 'Unserviceable', 'Lost', 'Missing'];
    return getAllEquipment().filter(function (eq) {
      return bad.indexOf(eq.status) >= 0;
    });
  }

  function renderAlertsCount() {
    var count = el('notifAlertsTabCount');
    if (count) count.textContent = String(equipmentAlerts().length);
  }

  function renderBell() {
    var bell = el('notifBellBtn');
    var badge = el('notifBellBadge');
    // Merge the legacy equipment-alert bell into this one for the GSO-OIC.
    var legacy = document.querySelector('.alerts-btn');
    if (legacy) legacy.style.display = 'none';
    if (bell) {
      bell.style.display = 'flex';
      bell.title = 'Notifications';
      bell.classList.toggle('has-unread', unread > 0);
    }
    if (badge) {
      badge.textContent = unread > 99 ? '99+' : String(unread);
      badge.style.display = unread > 0 ? 'flex' : 'none';
    }
  }

  function renderDashboard() {
    const card = el('oicNotificationsCard');
    if (card) card.style.display = 'block';
    const count = el('oicNotifUnread');
    if (count) count.textContent = String(unread);
    const list = el('oicNotifRecent');
    if (!list) return;
    const recent = items.slice(0, 4);
    if (!recent.length) {
      list.innerHTML =
        '<div class="notif-empty" style="padding:14px 0;">No notifications yet.</div>';
      return;
    }
    list.innerHTML = recent
      .map(function (item) {
        return (
          '<div class="notif-dash-item ' +
          (item.read ? '' : 'unread') +
          '" onclick="openNotificationDetail(' +
          Number(item.id) +
          ')">' +
          '<div class="ndi-icon">🔔</div>' +
          '<div class="ndi-body">' +
          '<div class="ndi-title">' +
          esc(itemSummary(item)) +
          '</div>' +
          '<div class="ndi-meta">' +
          esc(item.actor_name) +
          ' · ' +
          esc(item.actor_role_label) +
          ' · ' +
          esc(fmtTime(item.created_at)) +
          '</div>' +
          '</div>' +
          (item.read ? '' : '<span class="ndi-dot"></span>') +
          '</div>'
        );
      })
      .join('');
  }

  function renderPanel() {
    const summary = el('notifPanelSummary');
    const list = el('notifList');
    const empty = el('notifEmpty');
    const tabCount = el('notifUnreadTabCount');
    if (tabCount) tabCount.textContent = String(unread);

    if (filter === 'alerts') {
      const alerts = equipmentAlerts();
      if (summary) summary.textContent = alerts.length + ' equipment alerts';
      if (!list) return;
      if (!alerts.length) {
        list.innerHTML = '';
        if (empty) {
          empty.style.display = 'block';
          empty.textContent = 'No equipment alerts.';
        }
        return;
      }
      if (empty) empty.style.display = 'none';
      list.innerHTML = alerts
        .map(function (eq) {
          const office =
            typeof dashDeptName === 'function'
              ? dashDeptName(eq.dept)
              : eq.dept || '';
          return (
            '<div class="notif-item">' +
            '<div class="notif-item-title">' +
            esc(eq.name + ' (' + eq.id + ')') +
            '</div>' +
            '<div class="notif-item-meta">' +
            esc(eq.status || 'No status') +
            ' · ' +
            esc(eq.owner || 'Unassigned') +
            (office ? ' · ' + esc(office) : '') +
            '</div>' +
            '<div class="notif-item-details">' +
            esc((eq.brand || '') + (eq.serial ? ' · S/N: ' + eq.serial : '')) +
            '</div>' +
            '</div>'
          );
        })
        .join('');
      return;
    }

    if (summary) {
      summary.textContent = unread + ' unread · ' + items.length + ' total';
    }

    if (!list) return;
    const visible =
      filter === 'unread' ? items.filter(function (item) { return !item.read; }) : items;
    if (!visible.length) {
      list.innerHTML = '';
      if (empty) {
        empty.style.display = 'block';
        empty.textContent =
          filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.';
      }
      return;
    }
    if (empty) empty.style.display = 'none';
    list.innerHTML = visible
      .map(function (item) {
        const details = item.details || '';
        return (
          '<div class="notif-item ' +
          (item.read ? '' : 'unread') +
          '" onclick="activateNotification(' +
          Number(item.id) +
          ')">' +
          '<button type="button" class="notif-item-info" title="View details" onclick="event.stopPropagation();openNotificationDetail(' +
          Number(item.id) +
          ')">ℹ</button>' +
          (item.read ? '' : '<span class="notif-unread-dot"></span>') +
          '<div class="notif-item-title">' +
          esc(itemSummary(item)) +
          '</div>' +
          '<div class="notif-item-meta">' +
          esc(item.actor_name) +
          ' · ' +
          esc(item.actor_role_label) +
          '</div>' +
          (details
            ? '<div class="notif-item-details">' +
              esc(details.length > 150 ? details.slice(0, 147) + '…' : details) +
              '</div>'
            : '') +
          '<div class="notif-item-time">' +
          esc(fmtTime(item.created_at)) +
          '</div>' +
          '</div>'
        );
      })
      .join('');
  }

  function findItem(id) {
    return items.find(function (item) {
      return Number(item.id) === Number(id);
    });
  }

  function findAssetContext(assetId) {
    const id = String(assetId || '').trim();
    if (!id || typeof staffData === 'undefined') return null;
    for (const dept of Object.keys(staffData)) {
      const list = staffData[dept];
      if (!Array.isArray(list)) continue;
      for (const staff of list) {
        if (
          (staff.equipment || []).some(function (eq) {
            return String(eq.id) === id;
          })
        ) {
          return { dept: dept, staff: staff };
        }
      }
    }
    return null;
  }

  function navigateToNotification(item) {
    const action = String(item.action || '');
    if (
      action === 'account_registration' ||
      action === 'account_approved' ||
      action === 'account_updated'
    ) {
      openDetail(item.id);
      return;
    }
    if (action === 'report_generated') {
      if (typeof showView === 'function') showView('reports');
      else openDetail(item.id);
      return;
    }
    if (action === 'backup_recorded' || action === 'backup_imported') {
      if (typeof showSettings === 'function') showSettings();
      else openDetail(item.id);
      return;
    }
    if (action === 'sync_received' || action === 'sync_error') {
      if (typeof showSyncCenter === 'function') showSyncCenter();
      else openDetail(item.id);
      return;
    }
    if (action === 'inventory_loaded') {
      if (typeof showView === 'function') showView('equipment');
      else openDetail(item.id);
      return;
    }
    if (item.asset_id) {
      const context = findAssetContext(item.asset_id);
      if (context && typeof showStaff === 'function') {
        showStaff(context.dept);
        setTimeout(function () {
          if (typeof showProfile === 'function') showProfile(context.staff);
        }, 120);
        return;
      }
      if (typeof handleSearch === 'function') {
        const input = el('searchInput');
        if (input) input.value = item.asset_id;
        handleSearch(item.asset_id);
        return;
      }
    }
    openDetail(item.id);
  }

  function activateNotification(id) {
    const item = findItem(id);
    if (!item) return;
    if (!item.read) markRead(item.id);
    const panel = el('notificationPanel');
    if (panel) panel.classList.remove('open');
    navigateToNotification(item);
  }

  function formatValue(value) {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return String(value);
      }
    }
    return String(value);
  }

  function openDetail(id) {
    const item = findItem(id);
    if (!item) return;
    const panel = el('notificationPanel');
    if (panel) panel.classList.remove('open');

    if (!item.read) markRead(item.id);

    const changes = Array.isArray(item.changes) ? item.changes : [];
    const rows = changes
      .map(function (change) {
        return (
          '<tr><td>' +
          esc(change.label || change.field) +
          '</td><td class="prev">' +
          esc(formatValue(change.from)) +
          '</td><td class="next">' +
          esc(formatValue(change.to)) +
          '</td></tr>'
        );
      })
      .join('');

    let signupUsername = '';
    if (item.action === 'account_registration') {
      changes.forEach(function (change) {
        if (change.field === 'username' && change.to) signupUsername = change.to;
      });
      if (!signupUsername && item.details) {
        const match = String(item.details).match(/@([A-Za-z0-9._-]+)/);
        if (match) signupUsername = match[1];
      }
    }
    const approval =
      isOic() && item.action === 'account_registration' && signupUsername
        ? '<div class="notif-approval">' +
          '<button class="notif-approve-btn" onclick="approveSignupAccount(\'' +
          esc(signupUsername) +
          '\')">Approve account</button>' +
          '<button class="notif-link-btn" onclick="window.open(\'/admin.html\', \'_blank\')">Open User administration</button>' +
          '<div id="notifApprovalMsg" class="notif-approval-msg"></div>' +
          '</div>'
        : '';

    const body = el('notifDetailBody');
    if (!body) return;
    body.innerHTML =
      '<div class="notif-detail-meta">' +
      '<div><b>Action:</b> ' +
      esc(item.label) +
      '</div>' +
      '<div><b>Performed by:</b> ' +
      esc(item.actor_name) +
      ' (' +
      esc(item.actor_role_label) +
      ')</div>' +
      '<div><b>Asset:</b> ' +
      esc(item.asset_name || '—') +
      (item.asset_id ? ' · ' + esc(item.asset_id) : '') +
      '</div>' +
      '<div><b>Date and time:</b> ' +
      esc(fmtTime(item.created_at, true)) +
      '</div>' +
      (item.details
        ? '<div><b>Details:</b> ' + esc(item.details) + '</div>'
        : '') +
      '</div>' +
      (changes.length
        ? '<table class="notif-detail-table"><thead><tr><th>Field</th><th>Previous</th><th>Updated</th></tr></thead><tbody>' +
          rows +
          '</tbody></table>'
        : '<div class="notif-empty" style="padding:12px 0;">No field changes recorded.</div>') +
      approval;

    const modal = el('notifDetailModal');
    if (modal) modal.classList.add('open');
  }

  async function approveSignupAccount(username) {
    const msg = el('notifApprovalMsg');
    if (msg) msg.textContent = 'Approving ' + username + '…';
    try {
      const listing = await api('/api/users');
      const target = (listing.users || []).find(function (user) {
        return String(user.username).toLowerCase() === String(username).toLowerCase();
      });
      if (!target) throw new Error('Account not found — open User administration.');
      if (target.active) {
        if (msg) msg.textContent = '✅ @' + target.username + ' is already active.';
        return;
      }
      await api('/api/users/' + encodeURIComponent(target.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true }),
      });
      if (msg) {
        msg.textContent =
          '✅ @' + target.username + ' approved. The user can now sign in.';
      }
      if (typeof showSyncToast === 'function') {
        showSyncToast('✅ Account approved: @' + target.username);
      }
    } catch (error) {
      if (msg) msg.textContent = '⚠ ' + (error.message || 'Approval failed.');
    }
  }

  function closeDetail() {
    const modal = el('notifDetailModal');
    if (modal) modal.classList.remove('open');
  }

  async function markRead(id) {
    try {
      const data = await api(
        '/api/notifications/' + encodeURIComponent(id) + '/read',
        { method: 'POST' }
      );
      const item = findItem(id);
      if (item) item.read = true;
      unread = Number(data.unread) || 0;
      render();
    } catch (e) {
      /* Leave the item unread if the server call fails. */
    }
  }

  async function markAll() {
    try {
      const data = await api('/api/notifications/read-all', { method: 'POST' });
      items.forEach(function (item) {
        item.read = true;
      });
      unread = Number(data.unread) || 0;
      render();
    } catch (e) {
      /* Ignore temporary failures. */
    }
  }

  function setFilter(next, button) {
    filter = next === 'unread' ? 'unread' : next === 'alerts' ? 'alerts' : 'all';
    document.querySelectorAll('.notif-tab').forEach(function (tab) {
      tab.classList.toggle('active', tab === button);
    });
    renderPanel();
  }

  function togglePanel(show) {
    if (!authToken()) return;
    const panel = el('notificationPanel');
    if (!panel) return;
    const open =
      show === true ? true : show === false ? false : !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    if (open) load();
  }

  function startPolling() {
    if (pollTimer) return;
    pollTimer = setInterval(load, 30000);
  }

  function connectStream() {
    if (!authToken()) return;
    if (stream) return;
    if (typeof EventSource === 'undefined') {
      startPolling();
      return;
    }
    let failures = 0;
    try {
      stream = new EventSource(
        '/api/notifications/stream?token=' + encodeURIComponent(authToken())
      );
    } catch (e) {
      startPolling();
      return;
    }
    stream.onmessage = function (event) {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        return;
      }
      failures = 0;
      if (data.type === 'notification' && data.item) {
        const exists = items.some(function (item) {
          return Number(item.id) === Number(data.item.id);
        });
        if (!exists) items.unshift(data.item);
        unread = Number(data.unread) || 0;
        render();
        if (typeof showSyncToast === 'function') {
          showSyncToast(
            '🔔 ' + data.item.label + ' — ' + data.item.actor_name
          );
        }
      } else if (data.type === 'read') {
        if (data.all) {
          items.forEach(function (item) {
            item.read = true;
          });
          unread = 0;
        } else {
          const ids = new Set((data.ids || []).map(Number));
          items.forEach(function (item) {
            if (ids.has(Number(item.id))) item.read = true;
          });
          unread = Number(data.unread) || 0;
        }
        render();
      } else if (data.type === 'ready') {
        unread = Number(data.unread) || 0;
        render();
        load();
      }
    };
    stream.onerror = function () {
      failures += 1;
      if (failures >= 3 && stream) {
        try {
          stream.close();
        } catch (e) {}
        stream = null;
        startPolling();
      }
    };
  }

  function init() {
    if (!authToken()) return;
    const bell = el('notifBellBtn');
    const card = el('oicNotificationsCard');
    const manage = el('notifManageUsersBtn');
    const title = el('notifPanelTitle');
    const subtitle = el('notifPanelSummary');
    if (bell) bell.style.display = 'flex';
    if (card) card.style.display = 'block';
    if (manage) manage.style.display = isOic() ? 'inline-block' : 'none';
    if (title) title.textContent = 'Notifications';
    if (subtitle) {
      subtitle.textContent = isOic()
        ? 'Activity across all offices'
        : 'Updates relevant to your role';
    }
    load();
    connectStream();
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) load();
  });
  document.addEventListener('click', function (event) {
    const panel = el('notificationPanel');
    if (!panel || !panel.classList.contains('open')) return;
    if (panel.contains(event.target)) return;
    if (event.target.closest && event.target.closest('#notifBellBtn')) return;
    if (event.target.closest && event.target.closest('#oicNotificationsCard')) return;
    panel.classList.remove('open');
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      const panel = el('notificationPanel');
      if (panel) panel.classList.remove('open');
    }
  });

  window.toggleNotificationPanel = togglePanel;
  window.setNotificationFilter = setFilter;
  window.openNotificationDetail = openDetail;
  window.closeNotificationDetail = closeDetail;
  window.activateNotification = activateNotification;
  window.markAllNotificationsRead = markAll;
  window.approveSignupAccount = approveSignupAccount;
  window.loadNotifications = load;
})();
