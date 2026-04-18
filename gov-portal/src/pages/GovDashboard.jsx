import { useState, useEffect, useCallback } from 'react';
import { useGovAuth } from '../context/GovAuthContext';
import { govApi } from '../api';
import GovSidebar from '../components/GovSidebar';

const UPLOAD_BASE = 'http://localhost/publicwatchnew/backend';

function timeAgo(d) {
  const diff = Date.now() - new Date(d);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

/* ─── ASSIGN MODAL ─── */
function AssignModal({ complaint, authority, onClose, onSuccess }) {
  const [workerId, setWorkerId] = useState('');
  const [workerInfo, setWorkerInfo] = useState(null);
  const [status, setStatus] = useState('Assigned');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  const lookupWorker = async () => {
    if (!workerId.trim()) return;
    setLookupLoading(true); setError('');
    const res = await govApi.getWorkerById(workerId.trim(), authority.department);
    if (res.error) { setError(res.error); setWorkerInfo(null); }
    else setWorkerInfo(res);
    setLookupLoading(false);
  };

  const submit = async () => {
    if (!workerInfo) { setError('Please look up a valid worker first.'); return; }
    setLoading(true);
    const res = await govApi.assign({
      complaint_id: complaint.id,
      worker_id: workerId,
      authority_id: authority.id,
      status
    });
    if (res.error) { setError(res.error); setLoading(false); return; }
    onSuccess('Complaint assigned successfully! User has been notified.');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">📋 Assign Complaint — {complaint.complaint_no}</h2>

        <div style={{ background:'var(--navy)', borderRadius:8, padding:'1rem', marginBottom:'1.25rem' }}>
          <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:'0.35rem' }}>{complaint.subject}</div>
          <div style={{ fontSize:'0.78rem', color:'var(--grey)' }}>{complaint.first_name} {complaint.last_name} · {complaint.exact_location}</div>
          <div style={{ fontSize:'0.75rem', color:'var(--grey-dark)', marginTop:'0.25rem' }}>{complaint.complaint_type} · {timeAgo(complaint.created_at)}</div>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <div className="form-group">
          <label className="form-label">Worker ID (from {authority.department})</label>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <input className="form-input" value={workerId} onChange={e => setWorkerId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && lookupWorker()}
              placeholder="e.g. WRK021" />
            <button className="btn btn-primary" onClick={lookupWorker} disabled={lookupLoading}>
              {lookupLoading ? '...' : 'Lookup'}
            </button>
          </div>
        </div>

        {workerInfo && (
          <div style={{ background:'rgba(45,158,107,0.1)', border:'1px solid rgba(45,158,107,0.3)', borderRadius:8, padding:'1rem', marginBottom:'1rem' }}>
            <div style={{ fontWeight:700, color:'var(--green-light)', marginBottom:'0.4rem' }}>✅ Worker Found</div>
            <div style={{ fontSize:'0.85rem' }}>👷 <strong>{workerInfo.name}</strong></div>
            <div style={{ fontSize:'0.82rem', color:'var(--grey)', marginTop:'0.2rem' }}>📞 {workerInfo.phone}</div>
            <div style={{ fontSize:'0.78rem', color:'var(--grey-dark)', marginTop:'0.2rem' }}>{workerInfo.department}</div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Set Status</label>
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option>Assigned</option>
            <option>In Progress</option>
          </select>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading || !workerInfo}>
            {loading ? 'Assigning...' : 'Assign & Notify User'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── STATUS MODAL ─── */
function StatusModal({ complaint, authority, onClose, onSuccess }) {
  const [status, setStatus] = useState(complaint.status);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const res = await govApi.updateStatus({ complaint_id: complaint.id, status, authority_id: authority.id });
    if (!res.error) {
      onSuccess('Status updated! User notified via email.');
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:400 }}>
        <h2 className="modal-title">Update Status</h2>
        <div style={{ marginBottom:'1.25rem', fontSize:'0.85rem', color:'var(--grey)' }}>
          Complaint: <strong style={{ color:'var(--white)' }}>{complaint.complaint_no}</strong>
        </div>
        <div className="form-group">
          <label className="form-label">New Status</label>
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option>Reported</option>
            <option>Assigned</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Closed</option>
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? 'Updating...' : 'Update & Notify'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── DETAIL MODAL ─── */
function DetailModal({ complaint, authority, onClose, onAssign, onStatus }) {
  const imgs = complaint.images || [];
  const [imgIdx, setImgIdx] = useState(0);
  const statusKey = complaint.status?.replace(' ', '-') || 'Reported';

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:680 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.25rem' }}>
          <h2 className="modal-title" style={{ marginBottom:0 }}>Complaint Details</h2>
          <button style={{ background:'none', border:'none', color:'var(--grey)', fontSize:'1.3rem', cursor:'pointer' }} onClick={onClose}>✕</button>
        </div>

        <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
          <span className={`status-badge status-${statusKey}`}>● {complaint.status}</span>
          <span style={{ fontSize:'0.78rem', color:'var(--teal)', fontWeight:700 }}>{complaint.complaint_no}</span>
          <span className="upvote-tag">▲ {complaint.upvote_count || 0} upvotes</span>
        </div>

        {imgs.length > 0 && (
          <div style={{ marginBottom:'1.25rem', borderRadius:10, overflow:'hidden', position:'relative', cursor:'pointer' }}
            onClick={() => setImgIdx(i => (i + 1) % imgs.length)}>
            <img src={`${UPLOAD_BASE}/${imgs[imgIdx]}`} alt="complaint" style={{ width:'100%', maxHeight:280, objectFit:'cover', display:'block' }}
              onError={e => { e.target.src = 'https://placehold.co/600x280/0d1a28/00b4d8?text=Image'; }} />
            {imgs.length > 1 && <div style={{ position:'absolute', bottom:8, right:8, background:'rgba(0,0,0,0.7)', color:'white', padding:'0.2rem 0.6rem', borderRadius:20, fontSize:'0.75rem' }}>📷 {imgIdx+1}/{imgs.length}</div>}
          </div>
        )}

        <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:'0.5rem' }}>{complaint.subject}</div>
        <div style={{ fontSize:'0.85rem', color:'var(--grey)', lineHeight:1.6, marginBottom:'1.25rem' }}>{complaint.description}</div>

        <div className="detail-grid">
          <div className="detail-item"><div className="detail-key">Citizen</div><div className="detail-val">{complaint.first_name} {complaint.last_name}</div></div>
          <div className="detail-item"><div className="detail-key">Phone</div><div className="detail-val">{complaint.user_phone}</div></div>
          <div className="detail-item"><div className="detail-key">Email</div><div className="detail-val" style={{ fontSize:'0.8rem' }}>{complaint.user_email}</div></div>
          <div className="detail-item"><div className="detail-key">Prabhag</div><div className="detail-val" style={{ fontSize:'0.82rem' }}>{complaint.prabhag?.split('/')[0]}</div></div>
          <div className="detail-item"><div className="detail-key">Complaint Type</div><div className="detail-val">{complaint.complaint_type}</div></div>
          <div className="detail-item"><div className="detail-key">Filed</div><div className="detail-val">{timeAgo(complaint.created_at)}</div></div>
          <div className="detail-item" style={{ gridColumn:'1/-1' }}>
            <div className="detail-key">Location</div>
            <div className="detail-val">📍 {complaint.exact_location || 'Not specified'}</div>
          </div>
          {complaint.assigned_worker_name && (
            <>
              <div className="detail-item"><div className="detail-key">Assigned Worker</div><div className="detail-val">👷 {complaint.assigned_worker_name}</div></div>
              <div className="detail-item"><div className="detail-key">Worker Phone</div><div className="detail-val">{complaint.assigned_worker_phone}</div></div>
            </>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent:'space-between', flexWrap:'wrap' }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <button className="btn btn-primary" onClick={() => { onClose(); onAssign(complaint); }}>👷 Assign Worker</button>
            <button className="btn btn-gold" onClick={() => { onClose(); onStatus(complaint); }}>📊 Update Status</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── WORKERS PANEL ─── */
function WorkersPanel({ authority }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newWorker, setNewWorker] = useState({ worker_id:'', name:'', phone:'' });
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');

  const loadWorkers = useCallback(() => {
    setLoading(true);
    govApi.getWorkers(authority.department).then(r => {
      setWorkers(r.workers || []); setLoading(false);
    });
  }, [authority.department]);

  useEffect(() => { loadWorkers(); }, [loadWorkers]);

  const showMsg = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const addWorker = async () => {
    if (!newWorker.worker_id || !newWorker.name || !newWorker.phone) return;
    const res = await govApi.addWorker({ ...newWorker, department: authority.department });
    if (res.error) { showMsg('❌ ' + res.error); return; }
    showMsg('✅ Worker added successfully!');
    setShowAdd(false); setNewWorker({ worker_id:'', name:'', phone:'' });
    loadWorkers();
  };

  const deleteWorker = async (id) => {
    if (!window.confirm('Delete this worker? This cannot be undone.')) return;
    await govApi.deleteWorker(id);
    showMsg('✅ Worker removed.');
    loadWorkers();
  };

  const filtered = workers.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.worker_id.toLowerCase().includes(search.toLowerCase()) ||
    w.phone.includes(search)
  );

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:700 }}>Workers Management</h2>
          <p style={{ color:'var(--grey)', fontSize:'0.82rem', marginTop:'0.2rem' }}>{authority.department} — {workers.length} workers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(s => !s)}>
          {showAdd ? '✕ Cancel' : '+ Add Worker'}
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom:'1.5rem', animation:'slideIn 0.3s ease-out' }}>
          <div style={{ fontWeight:700, marginBottom:'1rem' }}>Add New Worker</div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Worker ID</label>
              <input className="form-input" value={newWorker.worker_id} onChange={e => setNewWorker(w => ({...w, worker_id: e.target.value.toUpperCase()}))} placeholder="e.g. WRK506" />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={newWorker.name} onChange={e => setNewWorker(w => ({...w, name: e.target.value}))} placeholder="Worker name" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={newWorker.phone} onChange={e => setNewWorker(w => ({...w, phone: e.target.value}))} placeholder="9876543XXX" />
            </div>
          </div>
          <div style={{ fontSize:'0.78rem', color:'var(--grey)', marginBottom:'1rem' }}>
            Department will be auto-set to: <strong style={{ color:'var(--teal)' }}>{authority.department}</strong>
          </div>
          <button className="btn btn-primary" onClick={addWorker}>Add Worker</button>
        </div>
      )}

      <div className="complaints-panel">
        <div className="panel-header">
          <div className="panel-title">👷 Department Workers</div>
          <input className="form-input" style={{ width:240 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, phone..." />
        </div>
        {loading
          ? <div className="loading"><div className="spinner" /></div>
          : filtered.length === 0
            ? <div className="empty-state"><div className="empty-state-icon">👷</div><div className="empty-state-title">No workers found</div></div>
            : (
                <table className="workers-table">
                  <thead>
                    <tr>
                      <th>Worker ID</th><th>Name</th><th>Phone</th><th>Department</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(w => (
                      <tr key={w.id}>
                        <td><span style={{ color:'var(--teal)', fontWeight:700 }}>{w.worker_id}</span></td>
                        <td>{w.name}</td>
                        <td>{w.phone}</td>
                        <td style={{ fontSize:'0.75rem', color:'var(--grey)' }}>{w.department.split('/')[0]}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteWorker(w.worker_id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
        }
      </div>

      {/* Step-by-step guidance */}
      <div className="card" style={{ marginTop:'1.5rem' }}>
        <div style={{ fontWeight:700, marginBottom:'1rem', color:'var(--teal)' }}>📖 Worker Management Guide</div>
        <div style={{ fontSize:'0.82rem', color:'var(--grey)', lineHeight:2 }}>
          <div><strong style={{ color:'var(--white)' }}>To Add a Worker:</strong> Click "Add Worker" button → Enter unique Worker ID (e.g., WRK506) → Enter full name and phone → Click "Add Worker". The worker is auto-assigned to your department.</div>
          <div style={{ marginTop:'0.75rem' }}><strong style={{ color:'var(--white)' }}>To Delete a Worker:</strong> Find the worker in the table using search → Click "Delete" next to their name → Confirm the action. The worker is permanently removed from the database.</div>
          <div style={{ marginTop:'0.75rem' }}><strong style={{ color:'var(--white)' }}>To Assign a Worker to a Complaint:</strong> Go to "All Complaints" → Click "Assign" on any complaint → Enter the Worker ID → Click "Lookup" to auto-fill name and phone → Click "Assign & Notify User".</div>
          <div style={{ marginTop:'0.75rem', padding:'0.75rem', background:'rgba(244,162,97,0.08)', border:'1px solid rgba(244,162,97,0.2)', borderRadius:6 }}>
            ⚠️ <strong style={{ color:'var(--gold)' }}>Important:</strong> Worker IDs must be unique across all departments. Use format WRK followed by a number (e.g., WRK506, WRK507...). Phone must be 10 digits.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── COMPLAINTS PANEL ─── */
function ComplaintsPanel({ authority, filterStatus }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');

  const showMsg = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const load = useCallback(() => {
    setLoading(true);
    govApi.getComplaints(authority.department, filterStatus || '').then(r => {
      setComplaints(r.complaints || []);
      setLoading(false);
    });
  }, [authority.department, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const filtered = complaints.filter(c =>
    !search ||
    c.subject?.toLowerCase().includes(search.toLowerCase()) ||
    c.complaint_no?.toLowerCase().includes(search.toLowerCase()) ||
    c.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.exact_location?.toLowerCase().includes(search.toLowerCase())
  );

  const statusKey = (s) => s?.replace(' ', '-') || 'Reported';

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}
      {assignModal && <AssignModal complaint={assignModal} authority={authority} onClose={() => setAssignModal(null)} onSuccess={msg => { showMsg(msg); load(); }} />}
      {statusModal && <StatusModal complaint={statusModal} authority={authority} onClose={() => setStatusModal(null)} onSuccess={msg => { showMsg(msg); load(); }} />}
      {detailModal && <DetailModal complaint={detailModal} authority={authority} onClose={() => setDetailModal(null)} onAssign={c => setAssignModal(c)} onStatus={c => setStatusModal(c)} />}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:700 }}>{filterStatus || 'All'} Complaints</h2>
          <p style={{ color:'var(--grey)', fontSize:'0.82rem', marginTop:'0.2rem' }}>{authority.department} — {complaints.length} found</p>
        </div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <input className="form-input" style={{ width:240 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complaints..." />
          <button className="btn btn-ghost btn-sm" onClick={load}>↻</button>
        </div>
      </div>

      <div className="complaints-panel">
        {loading
          ? <div className="loading"><div className="spinner" /></div>
          : filtered.length === 0
            ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <div className="empty-state-title">No complaints found</div>
                  <div className="empty-state-sub">No complaints matching your filter in {authority.department}</div>
                </div>
              )
            : (
                <table className="complaint-table">
                  <thead>
                    <tr>
                      <th>Ref No.</th><th>Citizen</th><th>Subject</th>
                      <th>Location</th><th>Filed</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id}>
                        <td><span style={{ color:'var(--teal)', fontWeight:700, fontSize:'0.78rem' }}>{c.complaint_no}</span></td>
                        <td>
                          <div style={{ fontWeight:600, fontSize:'0.82rem' }}>{c.first_name} {c.last_name}</div>
                          <div style={{ fontSize:'0.72rem', color:'var(--grey-dark)' }}>{c.user_phone}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight:600, fontSize:'0.82rem', maxWidth:180 }}>{c.subject}</div>
                          <div style={{ fontSize:'0.72rem', color:'var(--grey-dark)' }}>{c.complaint_type}</div>
                          {c.upvote_count > 0 && <span className="upvote-tag" style={{ marginTop:'0.2rem', display:'inline-flex' }}>▲ {c.upvote_count}</span>}
                        </td>
                        <td style={{ fontSize:'0.78rem', color:'var(--grey)', maxWidth:160 }}>
                          {c.exact_location ? c.exact_location.slice(0, 60) + (c.exact_location.length > 60 ? '...' : '') : '—'}
                        </td>
                        <td style={{ fontSize:'0.78rem', color:'var(--grey-dark)', whiteSpace:'nowrap' }}>{timeAgo(c.created_at)}</td>
                        <td><span className={`status-badge status-${statusKey(c.status)}`}>● {c.status}</span></td>
                        <td>
                          <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setDetailModal(c)}>View</button>
                            <button className="btn btn-primary btn-sm" onClick={() => setAssignModal(c)}>Assign</button>
                            <button className="btn btn-gold btn-sm" onClick={() => setStatusModal(c)}>Status</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
        }
      </div>
    </div>
  );
}

/* ─── DASHBOARD OVERVIEW ─── */
function DashboardOverview({ authority, stats, onNav }) {
  const statCards = [
    { label:'Total Reported', val: stats.Reported || 0, color:'red', icon:'🔴', status:'Reported' },
    { label:'Assigned', val: stats.Assigned || 0, color:'teal', icon:'🟡', status:'Assigned' },
    { label:'In Progress', val: stats['In Progress'] || 0, color:'gold', icon:'🔵', status:'In Progress' },
    { label:'Completed', val: stats.Completed || 0, color:'green', icon:'🟢', status:'Completed' },
    { label:'Closed', val: stats.Closed || 0, color:'grey', icon:'⚫', status:'Closed' },
  ];
  const total = Object.values(stats).reduce((a, b) => a + parseInt(b || 0), 0);

  return (
    <div>
      <div style={{ marginBottom:'2rem' }}>
        <h2 style={{ fontSize:'1.3rem', fontWeight:700 }}>Dashboard</h2>
        <p style={{ color:'var(--grey)', fontSize:'0.82rem', marginTop:'0.25rem' }}>
          Welcome back, <strong style={{ color:'var(--white)' }}>{authority.full_name}</strong> · {authority.department}
        </p>
      </div>

      <div className="stats-grid">
        {statCards.map(s => (
          <div key={s.label} className={`stat-card ${s.color}`} style={{ cursor:'pointer' }} onClick={() => onNav(s.status.toLowerCase().replace(' ', '') === 'inprogress' ? 'inprogress' : s.status.toLowerCase())}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginTop:'0.5rem' }}>
        <div className="card">
          <div style={{ fontWeight:700, marginBottom:'1rem' }}>📊 Resolution Rate</div>
          {total > 0 ? (
            <>
              <div style={{ fontSize:'2.2rem', fontWeight:700, color:'var(--green-light)' }}>
                {Math.round(((stats.Completed || 0) / total) * 100)}%
              </div>
              <div style={{ fontSize:'0.78rem', color:'var(--grey)', marginTop:'0.3rem' }}>{stats.Completed || 0} of {total} complaints resolved</div>
              <div style={{ marginTop:'1rem', height:8, background:'var(--navy)', borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.round(((stats.Completed || 0) / total) * 100)}%`, background:'var(--green)', borderRadius:4, transition:'width 0.8s ease' }} />
              </div>
            </>
          ) : <div style={{ color:'var(--grey)', fontSize:'0.85rem' }}>No data yet</div>}
        </div>

        <div className="card">
          <div style={{ fontWeight:700, marginBottom:'1rem' }}>👤 Authority Info</div>
          <div style={{ display:'grid', gap:'0.5rem' }}>
            {[
              ['VVCMC ID', authority.vvcmc_id],
              ['Email', authority.email],
              ['Contact', authority.contact_no],
              ['Post', authority.post || '—'],
              ['Block/Floor/Desk', `${authority.block_no || '—'} / ${authority.floor_no || '—'} / ${authority.desk_no || '—'}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem' }}>
                <span style={{ color:'var(--grey-dark)' }}>{k}</span>
                <span style={{ color:'var(--white)', textAlign:'right', maxWidth:'60%', wordBreak:'break-all' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN DASHBOARD ─── */
export default function GovDashboard() {
  const { authority } = useGovAuth();
  const [active, setActive] = useState('dashboard');
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!authority) return;
    govApi.getStats(authority.department).then(setStats);
    const t = setInterval(() => govApi.getStats(authority.department).then(setStats), 30000);
    return () => clearInterval(t);
  }, [authority]);

  if (!authority) return null;

  const filterForActive = () => {
    if (active === 'reported') return 'Reported';
    if (active === 'assigned') return 'Assigned';
    if (active === 'inprogress') return 'In Progress';
    if (active === 'completed') return 'Completed';
    return '';
  };

  const topbarInfo = {
    dashboard: { title: 'Dashboard Overview', sub: `Department: ${authority.department}` },
    complaints: { title: 'All Complaints', sub: 'View and manage all complaints' },
    reported: { title: 'Reported Complaints', sub: 'Newly submitted, awaiting assignment' },
    assigned: { title: 'Assigned Complaints', sub: 'Assigned to field workers' },
    inprogress: { title: 'In Progress', sub: 'Currently being worked on' },
    completed: { title: 'Completed Complaints', sub: 'Resolved complaints' },
    workers: { title: 'Workers Management', sub: `${authority.department} field workers` },
    escalations: { title: 'Escalations', sub: 'Citizen escalation alerts' },
  };
  const info = topbarInfo[active] || { title: 'Dashboard', sub: '' };

  return (
    <div className="gov-layout">
      <GovSidebar active={active} setActive={setActive} counts={stats} />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">{info.title}</div>
            <div className="topbar-sub">{info.sub}</div>
          </div>
          <div className="topbar-right">
            <span style={{ fontSize:'0.78rem', color:'var(--grey)' }}>{authority.vvcmc_id}</span>
            <span style={{ fontSize:'0.78rem', color:'var(--teal)', background:'rgba(0,180,216,0.1)', padding:'0.25rem 0.75rem', borderRadius:20, border:'1px solid rgba(0,180,216,0.2)' }}>
              {authority.department?.split('/')[0]}
            </span>
          </div>
        </div>

        <div className="content-area">
          {active === 'dashboard' && <DashboardOverview authority={authority} stats={stats} onNav={setActive} />}
          {(active === 'complaints' || active === 'reported' || active === 'assigned' || active === 'inprogress' || active === 'completed') &&
            <ComplaintsPanel key={active} authority={authority} filterStatus={filterForActive()} />}
          {active === 'workers' && <WorkersPanel authority={authority} />}
          {active === 'escalations' && (
            <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>⚠️</div>
              <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:'0.5rem' }}>Escalations Panel</div>
              <div style={{ color:'var(--grey)', fontSize:'0.85rem' }}>Escalated complaints appear here. Citizens raise alerts when work is not done on time. These will be automatically linked from the complaints list — look for complaints with high upvotes and no status update for 7+ days.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
