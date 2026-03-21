import { Link } from 'react-router-dom';

export default function GovLanding() {
  return (
    <div className="gov-landing-hero">
      {/* Nav */}
      <nav className="gov-nav">
        <div className="gov-nav-brand">
          <div style={{ width:40, height:40, background:'linear-gradient(135deg,#00b4d8,#2d9e6b)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>🏛️</div>
          <div>
            <div className="gov-nav-name">VVCMC PublicWatch</div>
            <div className="gov-nav-text">Vasai-Virar City Municipal Corporation — Government Portal</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <Link to="/gov/login" className="btn btn-ghost btn-sm">Authority Login</Link>
          <Link to="/gov/register" className="btn btn-gold btn-sm">Register Authority</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero-content">
        <div className="gov-badge">🏛️ Official Government Portal</div>
        <h1 className="gov-hero-title">
          Resolving Civic Issues.<br /><span>Building a Better Vasai-Virar.</span>
        </h1>
        <p className="gov-hero-sub">
          The VVCMC PublicWatch Government Portal empowers municipal authorities to receive, assign, track, and resolve citizen complaints with full transparency and accountability.
        </p>
        <div style={{ display:'flex', gap:'1rem', marginTop:'2.5rem', flexWrap:'wrap', justifyContent:'center' }}>
          <Link to="/gov/login" className="btn btn-primary btn-lg">Authority Login</Link>
          <Link to="/gov/register" className="btn btn-ghost btn-lg">Create Authority Account</Link>
        </div>
      </div>

      {/* Mission Section */}
      <section style={{ background:'rgba(0,180,216,0.04)', borderTop:'1px solid rgba(0,180,216,0.12)', padding:'3rem' }}>
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <h2 style={{ fontSize:'1.6rem', fontWeight:700 }}>Our Commitment to Citizens</h2>
          <p style={{ color:'var(--grey)', marginTop:'0.5rem', fontSize:'0.85rem' }}>The VVCMC is dedicated to responsive, transparent, and accountable governance</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1.25rem', maxWidth:1000, margin:'0 auto' }}>
          {[
            { icon:'⚡', val:'48hr', label:'Target Response Time', color:'var(--teal)' },
            { icon:'📊', val:'22', label:'Active Departments', color:'var(--gold)' },
            { icon:'👷', val:'500+', label:'Field Workers', color:'var(--green)' },
            { icon:'📍', val:'10', label:'Wards Covered', color:'var(--teal)' },
          ].map(s => (
            <div key={s.val} style={{ background:'var(--card-bg)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem', textAlign:'center' }}>
              <div style={{ fontSize:'1.8rem', marginBottom:'0.5rem' }}>{s.icon}</div>
              <div style={{ fontSize:'2rem', fontWeight:700, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--grey)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Cards */}
      <div className="mission-grid">
        {[
          { num:'01', title:'Receive Complaints Instantly', desc:'All citizen complaints are routed directly to the relevant department the moment they are submitted — no delays, no lost reports.' },
          { num:'02', title:'Assign Field Workers', desc:'Authorities can assign qualified field workers from their department roster, with worker IDs auto-filling name and contact details.' },
          { num:'03', title:'Update Status in Real Time', desc:'Change complaint status from Reported → Assigned → In Progress → Completed. Citizens are notified at every step.' },
          { num:'04', title:'Handle Escalations', desc:'If work is not completed in time, citizens can escalate. Authorities receive immediate alerts and are accountable for resolution.' },
          { num:'05', title:'Full Transparency', desc:'Every action is logged with timestamps. Citizens can see who is handling their complaint, including worker name and contact.' },
          { num:'06', title:'Department-wise Dashboard', desc:'Each authority sees only their department\'s complaints — keeping operations organized and focused on relevant issues.' },
        ].map(m => (
          <div key={m.num} className="mission-card">
            <div className="mission-num">{m.num}</div>
            <div className="mission-title">{m.title}</div>
            <p className="mission-desc">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'1.5rem 3rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
        <div style={{ fontSize:'0.78rem', color:'var(--grey-dark)' }}>
          © 2026 Vasai-Virar City Municipal Corporation. Government Portal — Restricted Access.
        </div>
        <div style={{ fontSize:'0.78rem', color:'var(--grey-dark)' }}>
          Citizen Portal: <a href="http://localhost:3000" style={{ color:'var(--teal)' }}>publicwatch.vvcmc.in</a>
        </div>
      </footer>
    </div>
  );
}
