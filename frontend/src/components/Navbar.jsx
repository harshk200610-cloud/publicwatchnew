import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import logo from '../assets/logo.jpeg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef();

  useEffect(() => {
    if (!user) return;
    const load = () => api.getNotifications(user.id).then(r => setNotifs(r.notifications || []));
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [user]);

  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifs.filter(n => !n.is_read).length;

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) => location.pathname === path;

  const markRead = () => {
    if (user) api.markNotificationsRead(user.id).then(() => setNotifs(n => n.map(x => ({...x, is_read: 1}))));
  };

  return (
    <nav className="nav">
      <Link to="/feed" className="nav-brand">
        <img src={logo} alt="logo" />
        <span className="nav-brand-name">PUBLIC<span>WATCH</span></span>
      </Link>

      {user && (
        <div className="nav-tabs">
          <Link to="/feed" className={`nav-tab ${isActive('/feed') ? 'active' : ''}`}>Feed</Link>
          <Link to="/report" className={`nav-tab ${isActive('/report') ? 'active' : ''}`}>Report</Link>
          <Link to="/my-complaints" className={`nav-tab ${isActive('/my-complaints') ? 'active' : ''}`}>My Complaints</Link>
        </div>
      )}

      {user && (
        <div className="nav-right">
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button className="notif-btn" onClick={() => { setShowNotifs(s => !s); if (!showNotifs) markRead(); }}>
              🔔
              {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
            </button>
            {showNotifs && (
              <div className="notif-dropdown">
                <div className="notif-header">Notifications</div>
                {notifs.length === 0
                  ? <div className="notif-empty">No notifications yet</div>
                  : notifs.slice(0, 15).map(n => (
                      <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                        <div>{n.message}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--grey-dark)', marginTop: '0.3rem' }}>
                          {new Date(n.created_at).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
              </div>
            )}
          </div>

          <div className="user-menu" onClick={() => navigate('/my-complaints')}>
            <div className="user-avatar">{user.first_name?.[0]}{user.last_name?.[0]}</div>
            <span className="user-name">{user.first_name}</span>
          </div>

          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}
