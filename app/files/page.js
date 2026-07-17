'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken } from '../../lib/api';
import Header from '../../components/Header';
import { FileTypeIcon } from '../../components/FileTypeIcon';

function formatSize(bytes) {
  if (bytes === 0) return '\u2014';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function FilesPage() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState([]);
  const [canEdit, setCanEdit] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [renaming, setRenaming] = useState(null); // { name }
  const [renameValue, setRenameValue] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!getToken()) router.replace('/login');
  }, [router]);

  const load = useCallback(async (path) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.listFiles(path);
      setItems(data.items);
      setCanEdit(!!data.canEdit); // backend now always sends this explicitly
    } catch (err) {
      const alreadyRedirecting = [
        'Session expired',
        'Password reset required',
        'Admin access only'
      ].includes(err.message);
      if (alreadyRedirecting) return; // a more specific redirect is already happening

      if (!path) {
        // The home folder failed to load — this usually means the Pi/API
        // itself is unreachable, not just a permissions or path issue.
        router.push('/down');
        return;
      }
      setError('Couldn\u2019t load this folder.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load(currentPath);
  }, [currentPath, load]);

  function joinPath(...parts) {
    return parts.filter(Boolean).join('/').replace(/\/+/g, '/');
  }

  function openFolder(name) {
    setCurrentPath(joinPath(currentPath, name));
  }

  function goToCrumb(index, crumbs) {
    setCurrentPath(crumbs.slice(0, index + 1).join('/'));
  }

  const [uploading, setUploading] = useState(false);
  const [fileRequestLink, setFileRequestLink] = useState(null); // { url, folderName }
  const [creatingLink, setCreatingLink] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    let failCount = 0;

    for (const file of files) {
      try {
        await api.upload(joinPath(currentPath, file.name), file);
      } catch (err) {
        failCount++;
      }
    }

    setUploading(false);
    e.target.value = '';
    load(currentPath);

    if (failCount > 0) {
      setError(
        failCount === files.length
          ? 'Upload failed for all files. Try again.'
          : `${failCount} of ${files.length} file${files.length > 1 ? 's' : ''} failed to upload.`
      );
    }
  }

  async function handleCreateFileRequest() {
    setCreatingLink(true);
    setCopied(false);
    try {
      const data = await api.createFileRequest(currentPath);
      const url = `${window.location.origin}/upload/${data.token}`;
      setFileRequestLink({ url, folderName: data.folderName });
    } catch (err) {
      setError('Couldn\u2019t create a file request link.');
    } finally {
      setCreatingLink(false);
    }
  }

  function copyFileRequestLink() {
    navigator.clipboard.writeText(fileRequestLink.url);
    setCopied(true);
  }

  async function handleNewFolder() {
    const name = window.prompt('Name the new folder');
    if (!name) return;
    try {
      await api.mkdir(joinPath(currentPath, name));
      load(currentPath);
    } catch (err) {
      setError('Couldn\u2019t create that folder.');
    }
  }

  async function handleDelete(name) {
    if (!window.confirm(`Delete "${name}"? This can\u2019t be undone.`)) return;
    try {
      await api.deleteItem(joinPath(currentPath, name));
      load(currentPath);
    } catch (err) {
      setError('Couldn\u2019t delete that item.');
    }
  }

  async function handleDownload(name) {
    try {
      await api.downloadFile(joinPath(currentPath, name), name);
    } catch (err) {
      setError('Download failed.');
    }
  }

  function startRename(name) {
    setRenaming(name);
    setRenameValue(name);
  }

  async function submitRename(oldName) {
    if (!renameValue || renameValue === oldName) {
      setRenaming(null);
      return;
    }
    try {
      await api.rename(joinPath(currentPath, oldName), joinPath(currentPath, renameValue));
      setRenaming(null);
      load(currentPath);
    } catch (err) {
      setError('Couldn\u2019t rename that item.');
      setRenaming(null);
    }
  }

  const crumbs = currentPath ? currentPath.split('/').filter(Boolean) : [];
  const sortedItems = [...items].sort((a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header showLogout />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 28px' }}>

        {/* Breadcrumbs */}
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          <span
            onClick={() => setCurrentPath('')}
            style={{ cursor: 'pointer', color: currentPath ? 'var(--text-muted)' : 'var(--text)' }}
          >
            Files
          </span>
          {crumbs.map((c, i) => (
            <span key={i}>
              {' / '}
              <span
                onClick={() => goToCrumb(i, crumbs)}
                style={{ cursor: 'pointer', color: i === crumbs.length - 1 ? 'var(--text)' : 'var(--text-muted)' }}
              >
                {c}
              </span>
            </span>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {canEdit ? (
            <>
              <button onClick={() => fileInputRef.current.click()} disabled={uploading} style={{ ...primaryBtn, opacity: uploading ? 0.7 : 1 }}>
                {uploading ? 'Uploading\u2026' : 'Upload files'}
              </button>
              <input ref={fileInputRef} type="file" multiple onChange={handleUpload} style={{ display: 'none' }} />
              <button onClick={handleNewFolder} style={secondaryBtn}>
                New folder
              </button>
              <button onClick={handleCreateFileRequest} disabled={creatingLink} style={secondaryBtn}>
                {creatingLink ? 'Creating link\u2026' : 'Create File Request'}
              </button>
            </>
          ) : currentPath ? (
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              View-only access
            </span>
          ) : (
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Open a folder to upload or manage files
            </span>
          )}
        </div>

        {fileRequestLink && (
          <div style={{
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            background: 'var(--surface)', padding: '14px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                Anyone with this link can upload to \u201c{fileRequestLink.folderName || 'Home'}\u201d \u2014 no sign-in needed
              </div>
              <div className="mono" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fileRequestLink.url}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={copyFileRequestLink} style={secondaryBtn}>
                {copied ? 'Copied!' : 'Copy link'}
              </button>
              <button onClick={() => setFileRequestLink(null)} style={{ ...secondaryBtn, padding: '9px 12px' }}>
                {'\u2715'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p style={{
            color: 'var(--danger)', background: 'var(--danger-soft)',
            padding: '10px 12px', borderRadius: 'var(--radius)', fontSize: 13, marginBottom: 16
          }}>
            {error}
          </p>
        )}

        {/* File list */}
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          background: 'var(--surface)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              Loading\u2026
            </div>
          ) : sortedItems.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <p className="display" style={{ fontSize: 17, marginBottom: 4 }}>Nothing here yet</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Upload a file or create a folder to get started.
              </p>
            </div>
          ) : (
            sortedItems.map((item, idx) => (
              <div
                key={item.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
                  gap: 12
                }}
              >
                <span style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileTypeIcon filename={item.name} isFolder={item.isFolder} size={26} />
                </span>

                {renaming === item.name ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => submitRename(item.name)}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitRename(item.name); }}
                    style={{ ...inputSmall, flex: 1 }}
                  />
                ) : (
                  <span
                    onClick={() => {
                      if (item.isFolder) openFolder(item.name);
                      else router.push(`/files/view?path=${encodeURIComponent(joinPath(currentPath, item.name))}&name=${encodeURIComponent(item.name)}`);
                    }}
                    style={{
                      flex: 1,
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    {item.name}
                  </span>
                )}

                <span className="mono" style={{ width: 70, textAlign: 'right' }}>
                  {item.isFolder ? '\u2014' : formatSize(item.size)}
                </span>
                <span className="mono" style={{ width: 90, textAlign: 'right' }}>
                  {formatDate(item.modifiedAt)}
                </span>

                <div style={{ display: 'flex', gap: 6 }}>
                  {!item.isFolder && (
                    <button onClick={() => handleDownload(item.name)} style={iconBtn} title="Download">
                      {'\u2193'}
                    </button>
                  )}
                  {(item.role ? item.role === 'editor' : canEdit) && (
                    <>
                      <button onClick={() => startRename(item.name)} style={iconBtn} title="Rename">
                        {'\u270E'}
                      </button>
                      <button onClick={() => handleDelete(item.name)} style={{ ...iconBtn, color: 'var(--danger)' }} title="Delete">
                        {'\u2715'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

const primaryBtn = {
  background: 'var(--holo-grad)',
  color: 'var(--ink)',
  border: 'none',
  borderRadius: 'var(--radius)',
  padding: '9px 18px',
  fontSize: 13,
  fontFamily: "'Baloo 2', sans-serif",
  fontWeight: 700
};

const secondaryBtn = {
  background: 'transparent',
  color: 'var(--text)',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '9px 16px',
  fontSize: 13,
  fontFamily: "'Baloo 2', sans-serif",
  fontWeight: 600
};

const iconBtn = {
  background: 'none',
  border: '1px solid var(--border)',
  borderRadius: 6,
  width: 28,
  height: 28,
  fontSize: 13,
  color: 'var(--text-muted)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const inputSmall = {
  padding: '4px 8px',
  border: '1px solid var(--accent)',
  borderRadius: 6,
  fontSize: 14
};
