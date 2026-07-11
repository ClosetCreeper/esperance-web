'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, getToken } from '../../../lib/api';
import { getViewerKind } from '../../../lib/fileKind';
import LogoMark from '../../../components/LogoMark';

function ViewerContent() {
  const router = useRouter();
  const params = useSearchParams();
  const path = params.get('path') || '';
  const filename = params.get('name') || path.split('/').pop() || 'File';

  const [state, setState] = useState({ loading: true, error: '', url: '', textContent: '', kind: 'unsupported' });

  useEffect(() => {
    if (!getToken()) router.replace('/login');
  }, [router]);

  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;

    async function load() {
      setState({ loading: true, error: '', url: '', textContent: '', kind: 'unsupported' });
      try {
        const { url, contentType } = await api.fetchFileBlob(path);
        if (cancelled) return;
        objectUrl = url;
        const kind = getViewerKind(filename, contentType);

        if (kind === 'text') {
          const res = await fetch(url);
          const text = await res.text();
          if (cancelled) return;
          setState({ loading: false, error: '', url, textContent: text, kind });
        } else {
          setState({ loading: false, error: '', url, textContent: '', kind });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ loading: false, error: 'Couldn\u2019t load this file.', url: '', textContent: '', kind: 'unsupported' });
        }
      }
    }

    if (path) load();

    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [path, filename]);

  function handleBack() {
    router.back();
  }

  function handleDownload() {
    api.downloadFile(path, filename);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <button onClick={handleBack} style={backBtn}>
              {'\u2190'} Back
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <LogoMark size={18} gradientId="esperance-holo-viewer" />
              <span style={{
                fontSize: 14, fontWeight: 500, color: 'var(--text)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {filename}
              </span>
            </div>
          </div>
          <button onClick={handleDownload} style={downloadBtn}>
            {'\u2193'} Download
          </button>
        </div>
      </header>

      {/* Body */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        overflow: 'auto'
      }}>
        {state.loading && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading\u2026</p>
        )}

        {!state.loading && state.error && (
          <p style={{ color: 'var(--danger)', fontSize: 14 }}>{state.error}</p>
        )}

        {!state.loading && !state.error && state.kind === 'pdf' && (
          <embed src={state.url} type="application/pdf" style={{ width: '100%', height: 'calc(100vh - 90px)', border: 'none' }} />
        )}

        {!state.loading && !state.error && state.kind === 'video' && (
          <video controls autoPlay={false} src={state.url} style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 120px)' }} />
        )}

        {!state.loading && !state.error && state.kind === 'audio' && (
          <div style={{ padding: 48, width: '100%', maxWidth: 600 }}>
            <audio controls src={state.url} style={{ width: '100%' }} />
          </div>
        )}

        {!state.loading && !state.error && state.kind === 'image' && (
          <img src={state.url} alt={filename} style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 120px)', objectFit: 'contain' }} />
        )}

        {!state.loading && !state.error && state.kind === 'text' && (
          <pre className="mono" style={{
            width: '100%', maxWidth: 900, maxHeight: 'calc(100vh - 120px)', overflow: 'auto',
            padding: 24, margin: 0, background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text)'
          }}>
            {state.textContent}
          </pre>
        )}

        {!state.loading && !state.error && state.kind === 'unsupported' && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p className="display" style={{ fontSize: 20, marginBottom: 8, color: 'var(--ink)' }}>
              No preview available
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
              This file type can\u2019t be previewed here \u2014 download it to open it.
            </p>
            <button onClick={handleDownload} style={downloadBtn}>
              {'\u2193'} Download
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ViewPage() {
  return (
    <Suspense fallback={null}>
      <ViewerContent />
    </Suspense>
  );
}

const backBtn = {
  background: 'transparent',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '7px 14px',
  fontSize: 13,
  fontFamily: "'Baloo 2', sans-serif",
  fontWeight: 600,
  color: 'var(--text)',
  flexShrink: 0
};

const downloadBtn = {
  background: 'var(--holo-grad)',
  color: 'var(--ink)',
  border: 'none',
  borderRadius: 'var(--radius)',
  padding: '8px 16px',
  fontSize: 13,
  fontFamily: "'Baloo 2', sans-serif",
  fontWeight: 700,
  flexShrink: 0
};
