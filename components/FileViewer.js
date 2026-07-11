'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getViewerKind } from '../lib/fileKind';

export default function FileViewer({ path, filename, onClose, onDownload }) {
  const [state, setState] = useState({ loading: true, error: '', url: '', textContent: '', kind: 'unsupported' });

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

    load();

    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [path, filename]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(36,42,69,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: 24
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)', borderRadius: 14, width: '100%', maxWidth: 900,
          maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(36,42,69,0.25)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid var(--border)'
        }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {filename}
          </span>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 12 }}>
            <button onClick={onDownload} style={downloadBtn} title="Download">
              {'\u2193'} Download
            </button>
            <button onClick={onClose} style={closeBtn} title="Close">
              {'\u2715'}
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          {state.loading && (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading\u2026</p>
          )}

          {!state.loading && state.error && (
            <p style={{ color: 'var(--danger)', fontSize: 14 }}>{state.error}</p>
          )}

          {!state.loading && !state.error && state.kind === 'pdf' && (
            <embed src={state.url} type="application/pdf" style={{ width: '100%', height: '75vh', border: 'none' }} />
          )}

          {!state.loading && !state.error && state.kind === 'video' && (
            <video controls src={state.url} style={{ maxWidth: '100%', maxHeight: '75vh' }} />
          )}

          {!state.loading && !state.error && state.kind === 'audio' && (
            <div style={{ padding: 48, width: '100%' }}>
              <audio controls src={state.url} style={{ width: '100%' }} />
            </div>
          )}

          {!state.loading && !state.error && state.kind === 'image' && (
            <img src={state.url} alt={filename} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }} />
          )}

          {!state.loading && !state.error && state.kind === 'text' && (
            <pre className="mono" style={{
              width: '100%', maxHeight: '75vh', overflow: 'auto', padding: 20,
              margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text)'
            }}>
              {state.textContent}
            </pre>
          )}

          {!state.loading && !state.error && state.kind === 'unsupported' && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p className="display" style={{ fontSize: 18, marginBottom: 8, color: 'var(--ink)' }}>
                No preview available
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
                This file type can\u2019t be previewed here \u2014 download it to open it.
              </p>
              <button onClick={onDownload} style={downloadBtn}>
                {'\u2193'} Download
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const downloadBtn = {
  background: 'var(--holo-grad)',
  color: 'var(--ink)',
  border: 'none',
  borderRadius: 8,
  padding: '7px 14px',
  fontSize: 12,
  fontFamily: "'Baloo 2', sans-serif",
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: 4
};

const closeBtn = {
  background: 'none',
  border: '1px solid var(--border)',
  borderRadius: 8,
  width: 30,
  height: 30,
  fontSize: 13,
  color: 'var(--text-muted)'
};
