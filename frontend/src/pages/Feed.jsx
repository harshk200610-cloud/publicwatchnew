import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import PostCard from '../components/PostCard';
import Navbar from '../components/Navbar';

export default function Feed() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getFeed(p);
      if (data.error) { setError(data.error); return; }
      if (p === 1) setComplaints(data.complaints || []);
      else setComplaints(prev => [...prev, ...(data.complaints || [])]);
      setTotal(data.total || 0);
      setPage(p);
    } catch { setError('Failed to load feed. Make sure the backend server is running.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(1); }, [load]);

  return (
    <>
      <Navbar />
      <div className="feed-layout">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Community Feed</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--grey)', marginTop: '0.2rem' }}>
              {total} reports from Vasai-Virar citizens
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => load(1)}>↻ Refresh</button>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {loading && complaints.length === 0
          ? <div className="loading"><div className="spinner" /><span>Loading feed...</span></div>
          : complaints.length === 0
            ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>No reports yet</div>
                  <p style={{ color: 'var(--grey)', marginTop: '0.5rem', fontSize: '0.85rem' }}>Be the first to report a civic issue in your area!</p>
                </div>
              )
            : complaints.map((c, i) => (
                <PostCard key={c.id} complaint={c} onUpdate={() => load(1)} />
              ))
        }

        {!loading && complaints.length < total && (
          <button className="btn btn-ghost btn-full" onClick={() => load(page + 1)}>
            Load More ({total - complaints.length} remaining)
          </button>
        )}

        {loading && complaints.length > 0 && (
          <div className="loading"><div className="spinner" /></div>
        )}
      </div>
    </>
  );
}
