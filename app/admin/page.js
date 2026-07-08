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

  // Track pending permission edits per user id: { [userId]: Set<path> }
  const [pendingPerms, setPendingPerms] = useState({});

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
        initialPerms[u.id] = new Set(u.permissions);
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

  function toggleFullAccess(userId, checked) {
    setPendingPerms((prev) => {
      const next = { ...prev };
      next[userId] = checked ? new Set(['*']) : new Set();
      return next;
    });
  }

  function toggleFolder(userId, folder, checked) {
    setPendingPerms((prev) => {
      const next = { ...prev };
      const current = new Set(prev[userId]);
      current.delete('*'); // toggling a specific folder implies not "full access"
      if (checked) current.add(folder);
      else current.delete(folder);
      next[userId] = current;
      return next;
    });
  }

  async function savePermissions(userId) {
    setError('');
    setMessage('');
    try {
      await api.setUserPermissions(userId, Array.from(pendingPerms[userId] || []));
      setMessage('Permissions saved.');
      load();
    } catch (err) {
      setError('Couldn\u2019t save permissions.');
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
      <main style={{ maxWidth: 780, margin: '0 auto', padding: '32px 28px 80px' }}>
        <h1 className="display" style={{ fontSize: 24, fontWeight: 500, marginBottom: 4 }}>
          Admin
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
          Create accounts and control which folders each person can see.
        </p>

        {error && <Banner tone="danger">{error}</Banner>}
        {message && <Banner tone="accent">{message}</Banner>}

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
              const perms = pendingPerms[u.id] || new Set();
              const fullAccess = perms.has('*');
              return (
                <div key={u.id} style={{ ...cardStyle, marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{u.name || u.email}</div>
                      <div className="mono" style={{ fontSize: 12 }}>{u.email}</div>
                    </div>
                    <button onClick={() => handleDeleteUser(u.id, u.email)} style={dangerBtn}>
                      Remove
                    </button>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 10 }}>
                      <input
                        type="checkbox"
                        checked={fullAccess}
                        onChange={(e) => toggleFullAccess(u.id, e.target.checked)}
                      />
                      Full access (sees everything)
                    </label>

                    {!fullAccess && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', paddingLeft: 2 }}>
                        {folders.length === 0 ? (
                          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            No folders exist yet in storage.
                          </span>
                        ) : (
                          folders.map((folder) => (
                            <label key={folder} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                              <input
                                type="checkbox"
                                checked={perms.has(folder)}
                                onChange={(e) => toggleFolder(u.id, folder, e.target.checked)}
                              />
                              {folder}
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <button onClick={() => savePermissions(u.id)} style={{ ...secondaryBtn, marginTop: 14 }}>
                    Save permissions
                  </button>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}

function Banner({ children, tone }) {
  return (
    <p style={{
      color: tone === 'danger' ? 'var(--danger)' : 'var(--accent)',
      background: tone === 'danger' ? 'var(--danger-soft)' : 'var(--accent-soft)',
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
  background: 'var(--accent)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius)',
  padding: '9px 16px',
  fontSize: 13,
  fontWeight: 500,
  height: 36
};

const secondaryBtn = {
  background: 'var(--surface)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '8px 14px',
  fontSize: 13
};

const dangerBtn = {
  background: 'none',
  border: '1px solid var(--border)',
  color: 'var(--danger)',
  borderRadius: 'var(--radius)',
  padding: '6px 12px',
  fontSize: 12
};
