'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken } from '../../lib/api';
import Header from '../../components/Header';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords don\u2019t match.');
      return;
    }
    if (!getToken()) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      await api.changePassword(newPassword);
      router.push('/files');
    } catch (err) {
      setError(err.message || 'Couldn\u2019t update your password. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header showLogout />
      <main style={{ maxWidth: 380, margin: '80px auto 0', padding: '0 24px' }}>
        <h1 className="display" style={{ fontSize: 26, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>
          Set a new password
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
          You need to set your own password before continuing.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text-muted)' }}>
            New password
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={inputStyle}
          />

          <label style={{ display: 'block', fontSize: 13, margin: '16px 0 6px', color: 'var(--text-muted)' }}>
            Confirm new password
          </label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={inputStyle}
          />

          {error && (
            <p style={{
              color: 'var(--danger)', background: 'var(--danger-soft)',
              padding: '10px 12px', borderRadius: 'var(--radius)', fontSize: 13, marginTop: 16
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 22,
              width: '100%',
              background: 'var(--holo-grad)',
              color: 'var(--ink)',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '12px 0',
              fontSize: 14,
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Saving\u2026' : 'Set password'}
          </button>
        </form>
      </main>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontSize: 14,
  background: 'var(--surface)',
  color: 'var(--text)'
};
