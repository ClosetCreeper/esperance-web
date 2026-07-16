'use client';

import LogoMark from '../../components/LogoMark';

export default function DownPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      textAlign: 'center'
    }}>
      <LogoMark size={56} />
      <h1 className="display" style={{ fontSize: 28, fontWeight: 600, color: 'var(--ink)', marginTop: 20, marginBottom: 10 }}>
        Esperance Cloud is Down
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 380, lineHeight: 1.6 }}>
        The Esperance network is experiencing a temporary outage. Please try again later.
      </p>
      <button
        onClick={() => window.location.href = '/files'}
        style={{
          marginTop: 28,
          background: 'var(--holo-grad)',
          color: 'var(--ink)',
          border: 'none',
          borderRadius: 'var(--radius)',
          padding: '10px 22px',
          fontSize: 14,
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 700
        }}
      >
        Try again
      </button>
    </div>
  );
}
