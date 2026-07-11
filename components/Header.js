'use client';

import { clearToken } from '../lib/api';
import { useRouter } from 'next/navigation';
import LogoMark from './LogoMark';

export default function Header({ showLogout = false }) {
  const router = useRouter();

  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '18px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark size={22} gradientId="esperance-holo-header" />
          <span className="display holo-text" style={{ fontSize: 20, fontWeight: 600 }}>
            esperance
          </span>
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
