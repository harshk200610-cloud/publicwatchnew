import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import Navbar from '../components/Navbar';

function timeAgo(d) {
  const diff = Date.now() - new Date(d);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function MyComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [escalating, setEscalating] = useState(null);
  const [reason, setReason] = useState('');
  const [tab, setTab] = useState('all');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!user) return;
    api.getMyComplaints(user.id).then(r => {
      setComplaints(r.complaints || []);
      setLoading(false);
    });
  }, [user]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleEscalate = async (c) => {
    if (!reason.trim()) return;
    await api.escalate({ complaint_id: c.id, user_id: user.id, reason });
    setEscalating(null);
    setReason('');
    showToast('Escalation submitted. Authorities have been notified.');
  };

  const statusKey = (s) => s?.replace(' ', '-') || 'Reported';

  const filtered = tab === 'all' ? complaints : complaints.filter(c => c.status === tab);

  return (
    <>
      <Navbar />
      {toast && <div className="toast">✅ {toast}</div>}

      <div className="my-complaints">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>My Complaints</h1>
          <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {complaints.length} total complaints filed
          </p>
        </div>

        {/* Tabs */}
        <div className="tab-list">
          {['all','Reported','Assigned','In Progress','Completed'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'all' ? 'All' : t}
              {t !== 'all' && <span style={{ marginLeft: '0.5rem', background: 'var(--navy)', borderRadius: '10px', padding: '0.1rem 0.45rem', fontSize: '0.7rem', color: 'var(--grey)' }}>
                {complaints.filter(c => c.status === t).length}
              </span>}
            </button>
          ))}
        </div>

        {loading
          ? <div className="loading"><div className="spinner" /><span>Loading your complaints...</span></div>
          : filtered.length === 0
            ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                  <div style={{ fontWeight: 700 }}>No complaints in this category</div>
                  <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    {tab === 'all' ? 'You haven\'t filed any complaints yet.' : `No ${tab} complaints.`}
                  </p>
                </div>
              )
            : filtered.map(c => (
                <div key={c.id} className="complaint-row">
                  <div>
                    <div className="complaint-no">{c.complaint_no}</div>
                    <div className="complaint-subject">{c.subject}</div>
                    <div className="complaint-dept">{c.department} — {c.complaint_type}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--grey-dark)', marginTop: '0.25rem' }}>
                      📍 {c.exact_location || 'No location'} · {timeAgo(c.created_at)}
                    </div>
                    {c.assigned_worker_name && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--teal)', marginTop: '0.4rem' }}>
                        👷 {c.assigned_worker_name} · {c.assigned_worker_phone}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <span className={`status-badge status-${statusKey(c.status)}`}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
                      {c.status}
                    </span>

                    {(c.status === 'Reported' || c.status === 'Assigned' || c.status === 'In Progress') && (
                      <button className="escalate-btn" onClick={() => setEscalating(c)}>
                        ⚠️ Escalate
                      </button>
                    )}

                    <button className="btn btn-ghost btn-sm" onClick={() => setSelected(selected?.id === c.id ? null : c)}>
                      {selected?.id === c.id ? 'Hide' : 'Details'}
                    </button>
                  </div>
                </div>
              ))}

        {/* Escalation Modal */}
        {escalating && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: '1rem' }}>
            <div className="card" style={{ maxWidth: 480, width: '100%', animation: 'fadeSlideUp 0.3s ease-out' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>⚠️ Raise Escalation</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--grey)', marginBottom: '1.25rem' }}>
                Complain: <strong style={{ color: 'var(--white)' }}>{escalating.complaint_no}</strong><br />
                This will immediately notify the concerned authority.
              </p>
              <div className="form-group">
                <label className="form-label">Reason for Escalation</label>
                <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Work not done even after 7 days of assignment..." rows={4} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-danger btn-full" onClick={() => handleEscalate(escalating)}>Submit Escalation</button>
                <button className="btn btn-ghost" onClick={() => { setEscalating(null); setReason(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
