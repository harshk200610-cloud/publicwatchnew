import { useGovAuth } from '../context/GovAuthContext';
import { useNavigate } from 'react-router-dom';

export default function GovSidebar({ active, setActive, counts }) {
  const { authority, logout } = useGovAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/gov'); };

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'complaints', icon: '📋', label: 'All Complaints', badge: counts?.Reported || 0 },
    { id: 'reported', icon: '🔴', label: 'Reported', badge: counts?.Reported || 0, badgeClass: 'red' },
    { id: 'assigned', icon: '🟡', label: 'Assigned', badge: counts?.Assigned || 0 },
    { id: 'inprogress', icon: '🔵', label: 'In Progress', badge: counts?.['In Progress'] || 0 },
    { id: 'completed', icon: '🟢', label: 'Completed', badge: counts?.Completed || 0 },
  ];

  const mgmtItems = [
    { id: 'workers', icon: '👷', label: 'Workers Management' },
    { id: 'escalations', icon: '⚠️', label: 'Escalations' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <div style={{ width:32, height:32, background:'linear-gradient(135deg,#00b4d8,#2d9e6b)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>🏛️</div>
          <span className="sidebar-logo-name">PUBLIC<span>WATCH</span></span>
        </div>
        {authority && (
          <div className="sidebar-dept-badge">
            {authority.department?.split('/')[0]}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">Overview</div>
        {navItems.map(item => (
          <button key={item.id} className={`sidebar-link ${active === item.id ? 'active' : ''}`}
            onClick={() => setActive(item.id)}>
            <span className="sidebar-link-icon">{item.icon}</span>
            {item.label}
            {item.badge > 0 && <span className={`sidebar-badge ${item.badgeClass || ''}`}>{item.badge}</span>}
          </button>
        ))}

        <div className="sidebar-section" style={{ marginTop:'1rem' }}>Management</div>
        {mgmtItems.map(item => (
          <button key={item.id} className={`sidebar-link ${active === item.id ? 'active' : ''}`}
            onClick={() => setActive(item.id)}>
            <span className="sidebar-link-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {authority && (
          <div className="sidebar-authority">
            <div className="sidebar-avatar">{authority.full_name?.[0]}</div>
            <div>
              <div className="sidebar-authority-name">{authority.full_name}</div>
              <div className="sidebar-authority-id">{authority.vvcmc_id}</div>
            </div>
          </div>
        )}
        <button className="btn btn-ghost btn-full btn-sm" onClick={handleLogout}>
          ← Logout
        </button>
      </div>
    </aside>
  );
}
