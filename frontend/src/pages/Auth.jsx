import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.login(form);
      if (res.error) { setError(res.error); return; }
      login(res.user);
      navigate('/feed');
    } catch { setError('Connection error. Is the server running?'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-name">PublicWatch</div>
          <div className="auth-sub">Sign in to your account</div>
        </div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email / Username</label>
            <input className="form-input" type="email" required value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="divider">or</div>
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--grey)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--teal)' }}>Create one</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--grey-dark)' }}>
          Government Official? <a href="http://localhost:3001" style={{ color: 'var(--gold)' }}>Go to Gov Portal →</a>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({ first_name:'', last_name:'', age:'', email:'', phone:'', sex:'', password:'', confirm_password:'' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await api.register(form);
      if (res.error) { setError(res.error); return; }
      setSuccess('Account created! Check your email for login credentials. Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch { setError('Connection error. Is the server running?'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card" style={{ maxWidth: 580 }}>
        <div className="auth-header">
          <div className="auth-name">PublicWatch</div>
          <div className="auth-sub">Create your citizen account</div>
        </div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" required value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Rahul" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" required value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Patil" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input className="form-input" type="number" min="18" max="100" required value={form.age} onChange={e => set('age', e.target.value)} placeholder="25" />
            </div>
            <div className="form-group">
              <label className="form-label">Sex</label>
              <select className="form-select" required value={form.sex} onChange={e => set('sex', e.target.value)}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="rahul@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" type="tel" required value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" required value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" required value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} placeholder="Repeat password" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="divider">or</div>
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--grey)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--teal)' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
