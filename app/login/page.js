'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken, setUser } from '../../lib/api';
import Header from '../../components/Header';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      setUser(data.user);
      router.push(data.mustResetPassword ? '/change-password' : '/files');
    } catch (err) {
      setError(err.message === 'Invalid email or password'
        ? 'That email or password isn\u2019t right.'
        : 'Couldn\u2019t reach Esperance. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <main style={{
        maxWidth: 380,
        margin: '80px auto 0',
        padding: '0 24px'
      }}>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>
          Sign in
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
          Enter your Esperance account to see your files.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text-muted)' }}>
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <label style={{ display: 'block', fontSize: 13, margin: '16px 0 6px', color: 'var(--text-muted)' }}>
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          {error && (
            <p style={{
              color: 'var(--danger)',
              background: 'var(--danger-soft)',
              padding: '10px 12px',
              borderRadius: 'var(--radius)',
              fontSize: 13,
              marginTop: 16
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
            {loading ? 'Signing in\u2026' : 'Sign in'}
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
