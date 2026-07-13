'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken } from '../../lib/api';
import Header from '../../components/Header';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // New user form
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  // Pending permission edits per user id: { [userId]: { [path]: 'viewer'|'editor' } }
  // '*' is a special path meaning full access
  const [pendingPerms, setPendingPerms] = useState({});
  const [expandedUsers, setExpandedUsers] = useState(new Set());

  useEffect(() => {
    if (!getToken()) router.replace('/login');
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, foldersRes] = await Promise.all([
        api.listUsers(),
        api.listTopLevelFolders()
      ]);
      setUsers(usersRes.users);
      setFolders(foldersRes.folders);

      const initialPerms = {};
      usersRes.users.forEach((u) => {
        const map = {};
        u.permissions.forEach((p) => { map[p.path] = p.role; });
        initialPerms[u.id] = map;
      });
      setPendingPerms(initialPerms);
    } catch (err) {
      setError('Couldn\u2019t load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreateUser(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    setMessage('');
    try {
      await api.createUser(newEmail, newPassword, newName);
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      setMessage('User created.');
      load();
    } catch (err) {
      setError(err.message || 'Could not create user.');
    } finally {
      setCreating(false);
    }
  }

  function setPermission(userId, path, role) {
    setPendingPerms((prev) => {
      const next = { ...prev };
      const map = { ...(prev[userId] || {}) };
      if (role === 'none') {
        delete map[path];
      } else {
        map[path] = role;
      }
      next[userId] = map;
      return next;
    });
  }

  async function savePermissions(userId) {
    setError('');
    setMessage('');
    try {
      const map = pendingPerms[userId] || {};
      const permissions = Object.entries(map)
        .filter(([path]) => path !== '*') // full access is no longer settable from this UI
        .map(([path, role]) => ({ path, role }));
      await api.setUserPermissions(userId, permissions);
      setMessage('Permissions saved.');
      load();
    } catch (err) {
      setError(err.message || 'Couldn\u2019t save permissions.');
    }
  }

  function toggleExpanded(userId) {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function handleToggleRootAccess(userId, current) {
    setError('');
    setMessage('');
    try {
      await api.setCanAddRoot(userId, !current);
      setMessage('Updated.');
      load();
    } catch (err) {
      setError(err.message || 'Couldn\u2019t update that.');
    }
  }

  async function handleDeleteUser(userId, email) {
    if (!window.confirm(`Remove ${email}? They\u2019ll lose access immediately.`)) return;
    try {
      await api.deleteUser(userId);
      load();
    } catch (err) {
      setError('Couldn\u2019t remove that user.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header showLogout />
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '32px 28px 80px' }}>
        <h1 className="display" style={{ fontSize: 24, fontWeight: 600, marginBottom: 4, color: 'var(--ink)' }}>
          Admin
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
          Create accounts and control which folders each person can view or edit.
        </p>

        {error && <Banner tone="danger">{error}</Banner>}
        {message && <Banner tone="success">{message}</Banner>}

        {/* New user form */}
        <section style={cardStyle}>
          <h2 style={sectionTitle}>Add a new user</h2>
          <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Field label="Name">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Email">
              <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Password">
              <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />
            </Field>
            <button type="submit" disabled={creating} style={primaryBtn}>
              {creating ? 'Creating\u2026' : 'Create user'}
            </button>
          </form>
        </section>

        {/* User list */}
        <section style={{ marginTop: 28 }}>
          <h2 style={sectionTitle}>Existing users</h2>

          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading\u2026</p>
          ) : (
            users.map((u) => {
              const map = pendingPerms[u.id] || {};
              const hasLegacyFullAccess = !!map['*'];
              const isExpanded = expandedUsers.has(u.id);
              const grantedCount = Object.keys(map).filter((k) => k !== '*').length;

              return (
                <div key={u.id} style={{ ...cardStyle, marginBottom: 10, padding: 0 }}>
                  <div
                    onClick={() => toggleExpanded(u.id)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 18px', cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        display: 'inline-block',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.15s ease',
                        color: 'var(--text-muted)',
                        fontSize: 12
                      }}>
                        {'\u25B6'}
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{u.name || u.email}</div>
                        <div className="mono" style={{ fontSize: 12 }}>{u.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {hasLegacyFullAccess ? 'Full access (legacy)' : `${grantedCount} folder${grantedCount === 1 ? '' : 's'}`}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id, u.email); }}
                        style={dangerBtn}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 0', borderBottom: '1px solid var(--border)'
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>Add to Home</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Can upload files or create folders directly on the front page
                          </div>
                        </div>
                        <RoleButton
                          active={u.can_add_root}
                          onClick={() => handleToggleRootAccess(u.id, u.can_add_root)}
                        >
                          {u.can_add_root ? 'Enabled' : 'Enable'}
                        </RoleButton>
                      </div>

                      <div style={{ marginTop: 14 }}>
                        {hasLegacyFullAccess && (
                          <p style={{
                            fontSize: 12, color: 'var(--text-muted)', marginBottom: 10,
                            background: 'var(--accent-soft)', padding: '8px 10px', borderRadius: 8
                          }}>
                            This user currently has full access from before. Pick folders below and
                            save to replace it with specific permissions.
                          </p>
                        )}

                        {folders.length > 0 ? (
                          folders.map((folder) => (
                            <PermissionRow
                              key={folder}
                              label={folder}
                              value={map[folder] || 'none'}
                              onChange={(role) => setPermission(u.id, folder, role)}
                            />
                          ))
                        ) : (
                          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                            No folders exist yet in storage.
                          </p>
                        )}
                      </div>

                      <button onClick={() => savePermissions(u.id)} style={{ ...secondaryBtn, marginTop: 14 }}>
                        Save permissions
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}

function PermissionRow({ label, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 0', borderBottom: '1px solid var(--border)'
    }}>
      <span style={{ fontSize: 13 }}>{label}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        <RoleButton active={value === 'none'} onClick={() => onChange('none')}>None</RoleButton>
        <RoleButton active={value === 'viewer'} onClick={() => onChange('viewer')}>Viewer</RoleButton>
        <RoleButton active={value === 'editor'} onClick={() => onChange('editor')}>Editor</RoleButton>
      </div>
    </div>
  );
}

function RoleButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 12,
        padding: '5px 12px',
        borderRadius: 999,
        border: active ? 'none' : '1px solid var(--border)',
        background: active ? 'var(--holo-grad)' : 'transparent',
        color: active ? 'var(--ink)' : 'var(--text-muted)',
        fontFamily: "'Baloo 2', sans-serif",
        fontWeight: active ? 700 : 600
      }}
    >
      {children}
    </button>
  );
}

function Banner({ children, tone }) {
  return (
    <p style={{
      color: tone === 'danger' ? 'var(--danger)' : 'var(--success)',
      background: tone === 'danger' ? 'var(--danger-soft)' : 'var(--success-soft)',
      padding: '10px 12px',
      borderRadius: 'var(--radius)',
      fontSize: 13,
      marginBottom: 16
    }}>
      {children}
    </p>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const cardStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 18
};

const sectionTitle = {
  fontSize: 15,
  fontWeight: 500,
  marginBottom: 14
};

const inputStyle = {
  padding: '8px 10px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontSize: 14,
  background: 'var(--surface)',
  color: 'var(--text)',
  minWidth: 160
};

const primaryBtn = {
  background: 'var(--holo-grad)',
  color: 'var(--ink)',
  border: 'none',
  borderRadius: 'var(--radius)',
  padding: '9px 18px',
  fontSize: 13,
  fontFamily: "'Baloo 2', sans-serif",
  fontWeight: 700,
  height: 38
};

const secondaryBtn = {
  background: 'transparent',
  color: 'var(--text)',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '8px 14px',
  fontSize: 13,
  fontFamily: "'Baloo 2', sans-serif",
  fontWeight: 600
};

const dangerBtn = {
  background: 'none',
  border: '1px solid var(--border)',
  color: 'var(--danger)',
  borderRadius: 'var(--radius)',
  padding: '6px 12px',
  fontSize: 12
};
