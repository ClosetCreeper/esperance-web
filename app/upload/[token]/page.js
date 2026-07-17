'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { publicApi } from '../../../lib/api';
import LogoMark from '../../../components/LogoMark';

export default function PublicUploadPage() {
  const { token } = useParams();
  const [folderName, setFolderName] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [done, setDone] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    publicApi.getUploadInfo(token)
      .then((data) => setFolderName(data.folderName))
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      await publicApi.upload(token, file);
      setDone(true);
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  }, [token]);

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <LogoMark size={26} gradientId="esperance-holo-upload" />
        <span className="display holo-text" style={{ fontSize: 22, fontWeight: 600 }}>esperance</span>
      </div>

      <div style={{
        width: '100%', maxWidth: 440, background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 16, padding: 32, textAlign: 'center'
      }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading\u2026</p>
        ) : loadError ? (
          <>
            <p className="display" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 8 }}>
              Link not found
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{loadError}</p>
          </>
        ) : done ? (
          <>
            <p className="display" style={{ fontSize: 24, color: 'var(--ink)', marginBottom: 8 }}>
              Thank you!
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
              Your file was uploaded to "{folderName}".
            </p>
            <button
              onClick={() => setDone(false)}
              style={{
                background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--text)',
                borderRadius: 'var(--radius)', padding: '9px 18px', fontSize: 13,
                fontFamily: "'Baloo 2', sans-serif", fontWeight: 600
              }}
            >
              Upload another file
            </button>
          </>
        ) : (
          <>
            <p className="display" style={{ fontSize: 22, color: 'var(--ink)', marginBottom: 6 }}>
              Upload to {folderName}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
              Drag a file here, or choose one below.
            </p>

            <label
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: `2px dashed ${dragActive ? 'var(--holo-grad, #E3A02E)' : 'var(--border)'}`,
                borderColor: dragActive ? '#E3A02E' : 'var(--border)',
                borderRadius: 12, padding: '40px 20px', cursor: 'pointer',
                background: dragActive ? 'rgba(227,160,46,0.06)' : 'transparent',
                transition: 'border-color 0.15s ease'
              }}
            >
              <input
                type="file"
                onChange={(e) => handleFile(e.target.files?.[0])}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              <span style={{ fontSize: 32, marginBottom: 8 }}>{'\u2191'}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {uploading ? 'Uploading\u2026' : 'Drop a file here or click to choose'}
              </span>
            </label>

            {uploadError && (
              <p style={{
                color: 'var(--danger)', background: 'var(--danger-soft)', padding: '10px 12px',
                borderRadius: 'var(--radius)', fontSize: 13, marginTop: 16
              }}>
                {uploadError}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
