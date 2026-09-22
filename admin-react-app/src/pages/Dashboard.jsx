import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, addUser, bulkAddUsers, deleteUser } from '../api/users.js';

/* ── CSV client-side parser & validator ─────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseAndValidateCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    return { error: 'CSV must have a header row and at least one data row.' };
  }

  const header = lines[0].trim().toLowerCase();
  if (header !== 'email,password') {
    return { error: 'CSV header must be exactly: email,password' };
  }

  if (lines.length > 501) {
    return { error: 'Maximum 500 data rows per upload.' };
  }

  const rows = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length < 2) {
      errors.push(`Row ${i + 1}: expected 2 columns, got ${parts.length}.`);
      continue;
    }
    const email = parts[0].trim();
    const password = parts.slice(1).join(',').trim(); // handles commas in pwd

    if (!EMAIL_RE.test(email)) {
      errors.push(`Row ${i + 1}: invalid email "${email}".`);
      continue;
    }
    if (password.length < 6) {
      errors.push(`Row ${i + 1}: password for "${email}" must be ≥ 6 characters.`);
      continue;
    }
    rows.push({ email, password });
  }

  if (errors.length > 0) return { error: null, errors, rows };
  return { error: null, errors: [], rows };
}

/* ── Stat card ───────────────────────────────────────────────────────── */
function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}

/* ── Modal wrapper ────────────────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Single User Form ─────────────────────────────────────────────────── */
function AddUserForm({ onAdded }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await addUser(email, password);
      setSuccess(`✅ User "${email}" added successfully.`);
      setEmail(''); setPassword(''); setConfirm('');
      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>Email</label>
        <input type="email" placeholder="user@example.com" value={email}
          onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="form-row">
        <label>Password</label>
        <input type="password" placeholder="Min 6 characters" value={password}
          onChange={e => setPassword(e.target.value)} required />
      </div>
      <div className="form-row">
        <label>Confirm Password</label>
        <input type="password" placeholder="Repeat password" value={confirm}
          onChange={e => setConfirm(e.target.value)} required />
      </div>
      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Adding…' : 'Add User'}
      </button>
    </form>
  );
}

/* ── CSV Upload Form ─────────────────────────────────────────────────── */
function CSVUploadForm({ onAdded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [parseErrors, setParseErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const fileRef = useRef();

  function handleFile(f) {
    if (!f) return;
    if (!f.name.endsWith('.csv')) {
      setGlobalError('Please upload a .csv file.'); return;
    }
    setGlobalError('');
    setResult(null);
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { error, errors, rows } = parseAndValidateCSV(ev.target.result);
      if (error) { setGlobalError(error); setPreview(null); setParseErrors([]); return; }
      setParseErrors(errors);
      setPreview(rows);
    };
    reader.readAsText(f);
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function handleUpload() {
    if (!preview || preview.length === 0) return;
    setLoading(true); setResult(null);
    try {
      const res = await bulkAddUsers(preview);
      setResult(res);
      setFile(null); setPreview(null); setParseErrors([]);
      onAdded();
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="csv-section">
      {/* Format spec */}
      <div className="csv-format-box">
        <p className="csv-format-title">📋 Required CSV Format</p>
        <pre className="csv-sample">email,password{'\n'}alice@example.com,SecurePass1{'\n'}bob@example.com,AnotherPass2</pre>
        <ul className="csv-rules">
          <li>First row must be exactly: <code>email,password</code></li>
          <li>Each email must be a valid address</li>
          <li>Each password must be ≥ 6 characters</li>
          <li>Maximum 500 rows per upload</li>
          <li>Duplicate emails are silently skipped</li>
        </ul>
      </div>

      {/* Drop zone */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
      >
        <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])} />
        {file
          ? <><span className="drop-icon">📄</span><p>{file.name}</p><p className="drop-sub">{preview?.length ?? 0} valid rows found</p></>
          : <><span className="drop-icon">☁️</span><p>Drop a CSV here or <span className="drop-link">browse</span></p></>
        }
      </div>

      {globalError && <p className="form-error">{globalError}</p>}

      {/* Parse errors list */}
      {parseErrors.length > 0 && (
        <div className="csv-errors">
          <p className="csv-errors-title">⚠️ {parseErrors.length} row(s) will be skipped</p>
          {parseErrors.slice(0, 10).map((e, i) => <p key={i} className="csv-error-row">{e}</p>)}
          {parseErrors.length > 10 && <p className="csv-error-row">…and {parseErrors.length - 10} more</p>}
        </div>
      )}

      {/* Preview table */}
      {preview && preview.length > 0 && (
        <>
          <div className="preview-table-wrap">
            <p className="preview-label">Preview — {preview.length} users ready to import</p>
            <table className="preview-table">
              <thead><tr><th>#</th><th>Email</th><th>Password</th></tr></thead>
              <tbody>
                {preview.slice(0, 8).map((row, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{row.email}</td>
                    <td>{'•'.repeat(Math.min(row.password.length, 10))}</td>
                  </tr>
                ))}
                {preview.length > 8 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-faint)' }}>…{preview.length - 8} more</td></tr>}
              </tbody>
            </table>
          </div>
          <button className="btn-primary" onClick={handleUpload} disabled={loading}>
            {loading ? 'Importing…' : `Import ${preview.length} Users`}
          </button>
        </>
      )}

      {result && (
        <div className="import-result">
          <p className="import-result-title">✅ Import Complete</p>
          <p>Created: <strong>{result.created}</strong> &nbsp;|&nbsp; Skipped: <strong>{result.skipped}</strong></p>
          {result.skippedEmails.length > 0 && (
            <p className="import-skipped">Skipped: {result.skippedEmails.join(', ')}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Dashboard ────────────────────────────────────────────────────── */
export default function Dashboard({ admin, onLogout }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [modal, setModal] = useState(null); // 'single' | 'csv' | null
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      /* silent */
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function handleLogout() {
    localStorage.removeItem('talkedge_admin_token');
    localStorage.removeItem('talkedge_admin_email');
    onLogout();
    navigate('/login');
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteUser(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
    } catch { /* silent */ } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  return (
    <div className="dashboard-screen">
      {/* ── Top Bar ─────────────────────────────── */}
      <header className="dashboard-header">
        <div className="header-brand">
          <span className="header-logo">TE</span>
          <div>
            <p className="header-title">TalkEdge Admin</p>
            <p className="header-sub">{admin?.email}</p>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Log out</button>
      </header>

      <main className="dashboard-main">
        {/* ── Stats ───────────────────────────────── */}
        <div className="stats-bar">
          <StatCard label="Total Users" value={users.length} icon="👥" />
          <StatCard label="Admin" value="1 of 1" icon="🔐" />
          <StatCard label="Modules" value="5" icon="📚" />
        </div>

        {/* ── Actions row ─────────────────────────── */}
        <div className="actions-row">
          <h2 className="section-title">User Management</h2>
          <div className="action-buttons">
            <button className="btn-secondary" onClick={() => setModal('csv')}>
              ⬆ Upload CSV
            </button>
            <button className="btn-primary" onClick={() => setModal('single')}>
              + Add User
            </button>
          </div>
        </div>

        {/* ── Search ──────────────────────────────── */}
        <div className="search-row">
          <input
            className="search-input"
            type="text"
            placeholder="Search users by email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="search-count">{filteredUsers.length} of {users.length}</span>
        </div>

        {/* ── Users Table ─────────────────────────── */}
        <div className="table-wrap">
          {loadingUsers ? (
            <div className="table-empty">Loading users…</div>
          ) : filteredUsers.length === 0 ? (
            <div className="table-empty">
              {search ? 'No users match your search.' : 'No users yet. Add one above.'}
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Added</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr key={user.id}>
                    <td className="td-num">{idx + 1}</td>
                    <td className="td-email">
                      <span className="user-avatar">{user.email[0].toUpperCase()}</span>
                      {user.email}
                    </td>
                    <td className="td-date">{formatDate(user.created_at)}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => setDeleteTarget(user)}
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id ? '…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ── Add Single User Modal ────────────────── */}
      {modal === 'single' && (
        <Modal title="Add Single User" onClose={() => setModal(null)}>
          <AddUserForm onAdded={() => { fetchUsers(); }} />
        </Modal>
      )}

      {/* ── CSV Upload Modal ─────────────────────── */}
      {modal === 'csv' && (
        <Modal title="Bulk Upload via CSV" onClose={() => setModal(null)}>
          <CSVUploadForm onAdded={() => { fetchUsers(); }} />
        </Modal>
      )}

      {/* ── Delete Confirm Modal ─────────────────── */}
      {deleteTarget && (
        <Modal title="Confirm Deletion" onClose={() => setDeleteTarget(null)}>
          <div className="delete-confirm">
            <p>Are you sure you want to delete</p>
            <p className="delete-email">{deleteTarget.email}</p>
            <p className="delete-warn">This action cannot be undone.</p>
            <div className="delete-actions">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
