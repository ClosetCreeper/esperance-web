const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('esperance_token');
}

function setToken(token) {
  localStorage.setItem('esperance_token', token);
}

function clearToken() {
  localStorage.removeItem('esperance_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData) && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Session expired');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  listFiles: (path = '') =>
    request(`/files?path=${encodeURIComponent(path)}`),

  mkdir: (path) =>
    request(`/files/mkdir?path=${encodeURIComponent(path)}`, { method: 'POST' }),

  deleteItem: (path) =>
    request(`/files?path=${encodeURIComponent(path)}`, { method: 'DELETE' }),

  rename: (from, to) =>
    request('/files/rename', { method: 'PATCH', body: JSON.stringify({ from, to }) }),

  upload: async (path, file) => {
    const token = getToken();
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_URL}/files/upload?path=${encodeURIComponent(path)}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Upload failed');
    }
    return res.json();
  },

  downloadFile: async (path, filename) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/files/download?path=${encodeURIComponent(path)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // Fetches a file's bytes for in-app preview (doesn't trigger a browser download)
  fetchFileBlob: async (path) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/files/download?path=${encodeURIComponent(path)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Could not load file');
    const blob = await res.blob();
    return { blob, url: window.URL.createObjectURL(blob), contentType: blob.type };
  },

  // Admin
  listUsers: () => request('/admin/users'),

  createUser: (email, password, name) =>
    request('/admin/users', { method: 'POST', body: JSON.stringify({ email, password, name }) }),

  deleteUser: (id) =>
    request(`/admin/users/${id}`, { method: 'DELETE' }),

  listTopLevelFolders: () => request('/admin/folders'),

  setUserPermissions: (id, permissions) =>
    request(`/admin/users/${id}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions }) })
};

export { getToken, setToken, clearToken };
