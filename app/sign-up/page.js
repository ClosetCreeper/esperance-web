'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken, setUser } from '../../lib/api';
import Header from '../../components/Header';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.signUp(name, email, password);
      setToken(data.token);
      setUser(data.user);
      router.push('/files');
    } catch (err) {
      setError(err.message || 'Couldn\u2019t create your account. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <main style={{ maxWidth: 380, margin: '80px auto 0', padding: '0 24px' }}>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>
          Create your account
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
          Please fill out the information below!
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text-muted)' }}>
            Full name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />

          <label style={{ display: 'block', fontSize: 13, margin: '16px 0 6px', color: 'var(--text-muted)' }}>
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
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: 68 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-muted)',
                fontSize: 12, fontFamily: "'Baloo 2', sans-serif", fontWeight: 600,
                padding: '6px 8px', cursor: 'pointer'
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

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
            {loading ? 'Creating account\u2026' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: 'var(--ink)', fontWeight: 500 }}>Sign in</a>
        </p>
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
  color: 'var(--text)',
  boxSizing: 'border-box'
};
