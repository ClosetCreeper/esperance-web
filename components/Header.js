'use client';

import { clearToken } from '../lib/api';
import { useRouter } from 'next/navigation';

export default function Header({ showLogout = false }) {
  const router = useRouter();

  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)'
    }}>
      <div style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '20px 28px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div className="display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>
            Esperance
          </div>
          <svg width="120" height="8" viewBox="0 0 120 8" style={{ marginTop: 2 }}>
            <path
              d="M2 6.5 Q 60 -3, 118 6.5"
              stroke="var(--accent)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {showLogout && (
          <button
            onClick={() => { clearToken(); router.push('/login'); }}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '8px 14px',
              fontSize: 13,
              color: 'var(--text-muted)'
            }}
          >
            Log out
          </button>
        )}
      </div>
    </header>
  );
}
