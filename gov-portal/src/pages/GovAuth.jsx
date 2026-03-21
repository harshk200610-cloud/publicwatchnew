import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGovAuth } from '../context/GovAuthContext';
import { DEPARTMENTS } from '../api';

const BASE = 'http://localhost/publicwatch/backend/api';

export function GovLogin() {
  const [form, setForm] = useState({ vvcmc_id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useGovAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${BASE}/authority.php?action=login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      }).then(r => r.json());
      if (res.error) { setError(res.error); return; }
      login(res.authority);
      navigate('/gov/dashboard');
    } catch { setError('Connection error. Is the backend server running?'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ fontSize:'1.8rem', fontWeight:700, color:'var(--white)' }}>VVCMC Portal</div>
          <div className="auth-sub">Authority Login — Government Officials Only</div>
          <div style={{ marginTop:'0.75rem', padding:'0.5rem 0.9rem', background:'rgba(244,162,97,0.08)', border:'1px solid rgba(244,162,97,0.2)', borderRadius:6, fontSize:'0.75rem', color:'var(--gold)' }}>
            🔒 Restricted Access. Authorized Personnel Only.
          </div>
        </div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">VVCMC Authority ID</label>
            <input className="form-input" required value={form.vvcmc_id} onChange={e => setForm({...form, vvcmc_id: e.target.value})} placeholder="VVCMCID12345" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login to Portal'}
          </button>
        </form>
        <div className="divider">or</div>
        <div style={{ textAlign:'center', fontSize:'0.82rem', color:'var(--grey)' }}>
          Need an account? <Link to="/gov/register" style={{ color:'var(--teal)' }}>Register Authority</Link>
        </div>
        <div style={{ textAlign:'center', marginTop:'1rem', fontSize:'0.75rem', color:'var(--grey-dark)' }}>
          Citizen Portal: <a href="http://localhost:3000" style={{ color:'var(--grey)' }}>publicwatch.vvcmc.in</a>
        </div>
      </div>
    </div>
  );
}

const POSTS = [
  'Municipal Commissioner','Deputy Commissioner','Assistant Commissioner',
  'Executive Engineer','Junior Engineer','Health Officer','Sanitary Inspector',
  'Revenue Officer','City Planner','Ward Officer','Section Officer','Clerk',
  'Technical Assistant','Data Entry Operator','Field Supervisor'
];

export function GovRegister() {
  const [form, setForm] = useState({
    full_name:'', email:'', contact_no:'', department:'', block_no:'',
    floor_no:'', desk_no:'', post:'', age:'', sex:'', password:'', confirm:''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/authority.php?action=register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      }).then(r => r.json());
      if (res.error) { setError(res.error); return; }
      setSuccess(`Account created! Your VVCMC ID is: ${res.vvcmc_id}. Check your email for credentials. Redirecting...`);
      setTimeout(() => navigate('/gov/login'), 4000);
    } catch { setError('Connection error.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ alignItems:'flex-start', paddingTop:'3rem' }}>
      <div className="auth-card" style={{ maxWidth:600 }}>
        <div className="auth-header">
          <div style={{ fontSize:'1.6rem', fontWeight:700 }}>Create Authority Account</div>
          <div className="auth-sub">VVCMC Government Officials Registration</div>
        </div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" required value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Official full name" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Official Email</label>
              <input className="form-input" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="yourname@vvcmcgov.in" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact No.</label>
              <input className="form-input" type="tel" required value={form.contact_no} onChange={e => set('contact_no', e.target.value)} placeholder="9876543210" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Department Allocated</label>
            <select className="form-select" required value={form.department} onChange={e => set('department', e.target.value)}>
              <option value="">Select Department</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Block No.</label>
              <input className="form-input" value={form.block_no} onChange={e => set('block_no', e.target.value)} placeholder="A" />
            </div>
            <div className="form-group">
              <label className="form-label">Floor</label>
              <input className="form-input" value={form.floor_no} onChange={e => set('floor_no', e.target.value)} placeholder="2nd" />
            </div>
            <div className="form-group">
              <label className="form-label">Desk No.</label>
              <input className="form-input" value={form.desk_no} onChange={e => set('desk_no', e.target.value)} placeholder="14" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Post / Designation</label>
            <select className="form-select" value={form.post} onChange={e => set('post', e.target.value)}>
              <option value="">Select Post</option>
              {POSTS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input className="form-input" type="number" min="21" max="65" value={form.age} onChange={e => set('age', e.target.value)} placeholder="35" />
            </div>
            <div className="form-group">
              <label className="form-label">Sex</label>
              <select className="form-select" value={form.sex} onChange={e => set('sex', e.target.value)}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password (min 8 chars)</label>
              <input className="form-input" type="password" required value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" required value={form.confirm} onChange={e => set('confirm', e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn-gold btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Authority Account'}
          </button>
        </form>
        <div className="divider">or</div>
        <div style={{ textAlign:'center', fontSize:'0.82rem', color:'var(--grey)' }}>
          Already have an account? <Link to="/gov/login" style={{ color:'var(--teal)' }}>Login here</Link>
        </div>
      </div>
    </div>
  );
}
