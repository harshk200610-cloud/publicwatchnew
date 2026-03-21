import { useState, useEffect } from 'react';
import { api, UPLOAD_BASE } from '../api';
import { useAuth } from '../context/AuthContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PostCard({ complaint, onUpdate }) {
  const { user } = useAuth();
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(complaint.upvotes || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [imgIdx, setImgIdx] = useState(0);
  const [loadingComment, setLoadingComment] = useState(false);

  const images = complaint.images || [];
  const statusKey = complaint.status?.replace(' ', '-') || 'Reported';

  useEffect(() => {
    if (user) {
      api.checkUpvote(complaint.id, user.id).then(r => setUpvoted(r.upvoted));
    }
  }, [complaint.id, user]);

  const handleUpvote = async () => {
    if (!user) return;
    const res = await api.upvote({ complaint_id: complaint.id, user_id: user.id });
    if (res.action === 'added') { setUpvoted(true); setUpvotes(v => v + 1); }
    else { setUpvoted(false); setUpvotes(v => Math.max(0, v - 1)); }
  };

  const loadComments = async () => {
    const data = await api.getComplaint(complaint.id);
    setComments(data.comments || []);
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(s => !s);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    setLoadingComment(true);
    const res = await api.addComment({ complaint_id: complaint.id, user_id: user.id, comment: commentText });
    setComments(c => [...c, { ...res, first_name: user.first_name, last_name: user.last_name }]);
    setCommentText('');
    setLoadingComment(false);
  };

  const initials = (c) => `${c.first_name?.[0] || '?'}${c.last_name?.[0] || ''}`;

  return (
    <div className="post-card">
      {/* Header */}
      <div className="post-header">
        <div className="post-user">
          <div className="post-avatar">{initials(complaint)}</div>
          <div>
            <div className="post-user-name">{complaint.first_name} {complaint.last_name}</div>
            <div className="post-user-dept">{complaint.department}</div>
            <div className="post-time">{timeAgo(complaint.created_at)} • {complaint.prabhag?.split('/')[0]}</div>
          </div>
        </div>
        <div className="post-meta">
          <span className={`status-badge status-${statusKey}`}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
            {complaint.status}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--grey-dark)' }}>#{complaint.complaint_no}</span>
        </div>
      </div>

      {/* Subject */}
      <div className="post-content" style={{ paddingBottom: '0.5rem' }}>
        <div className="post-subject">{complaint.subject}</div>
        <div className="post-desc">{complaint.description?.slice(0, 160)}{complaint.description?.length > 160 ? '...' : ''}</div>
      </div>

      {/* Images */}
      {images.length > 0 && (
        <div className="post-images" onClick={() => setImgIdx(i => (i + 1) % images.length)} style={{ cursor: images.length > 1 ? 'pointer' : 'default' }}>
          <img src={`${UPLOAD_BASE}/${images[imgIdx]}`} alt="complaint" onError={e => { e.target.src = 'https://placehold.co/600x340/162032/00b4d8?text=Image'; }} />
          {images.length > 1 && (
            <div className="post-img-count">📷 {imgIdx + 1}/{images.length} — tap to cycle</div>
          )}
        </div>
      )}

      {/* Location */}
      {complaint.exact_location && (
        <div className="post-location">
          <span className="post-location-icon">📍</span>
          <span>{complaint.exact_location}</span>
        </div>
      )}

      {/* Actions */}
      <div className="post-actions">
        <button className={`action-btn ${upvoted ? 'upvoted' : ''}`} onClick={handleUpvote}>
          {upvoted ? '▲' : '△'} {upvotes} {upvotes === 1 ? 'Upvote' : 'Upvotes'}
        </button>
        <button className="action-btn" onClick={toggleComments}>
          💬 {complaint.comment_count || 0} {showComments ? 'Hide' : 'Comments'}
        </button>
        {complaint.complaint_type && (
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--grey-dark)', background: 'var(--navy)', padding: '0.25rem 0.6rem', borderRadius: '20px' }}>
            {complaint.complaint_type}
          </span>
        )}
      </div>

      {/* Comments */}
      {showComments && (
        <div className="comments-section">
          {user && (
            <form className="comment-input-row" onSubmit={submitComment}>
              <input
                className="form-input"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={loadingComment}>Post</button>
            </form>
          )}
          {comments.length === 0
            ? <div style={{ fontSize: '0.8rem', color: 'var(--grey-dark)', textAlign: 'center', padding: '1rem 0' }}>No comments yet. Be the first!</div>
            : comments.map((c, i) => (
                <div key={c.id || i} className="comment-item">
                  <div className="comment-avatar">{(c.first_name?.[0] || '?')}{c.last_name?.[0] || ''}</div>
                  <div>
                    <div className="comment-meta">{c.first_name} {c.last_name} · {timeAgo(c.created_at)}</div>
                    <div className="comment-text">{c.comment}</div>
                  </div>
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
