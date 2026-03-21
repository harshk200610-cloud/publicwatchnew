import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpeg';

export default function Landing() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 3800);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Splash Screen */}
      <div className="splash" style={{ pointerEvents: splashDone ? 'none' : 'all' }}>
        <img src={logo} alt="PublicWatch" className="splash-logo" />
        <div className="splash-title">PUBLIC<span>WATCH</span></div>
        <div className="splash-sub">Towards a Better Society</div>
        <div className="splash-org">🏛️ Vasai-Virar City Municipal Corporation</div>
        <div className="splash-bar"><div className="splash-bar-fill" /></div>
      </div>

      {/* Main Landing */}
      <div style={{ opacity: splashDone ? 1 : 0, transition: 'opacity 0.6s 0.3s' }}>
        {/* Navbar */}
        <nav className="nav">
          <div className="nav-brand">
            <img src={logo} alt="logo" />
            <span className="nav-brand-name">PUBLIC<span>WATCH</span></span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="landing-hero">
          <div className="hero-bg" />
          <div className="hero-grid" />
          <img src={logo} alt="PublicWatch" className="hero-logo" />
          <div className="hero-badge">
            <span>🏛️</span> Vasai-Virar City Municipal Corporation
          </div>
          <h1 className="hero-title">
            Report. Track.<br /><span>Transform Your City.</span>
          </h1>
          <p className="hero-sub">
            PublicWatch empowers citizens of Vasai-Virar to report civic issues directly to the right authorities — from potholes to water supply problems — and track real-time resolution progress.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
            <Link to="/login" className="btn btn-outline btn-lg">Login to Report</Link>
          </div>
        </section>

        {/* Stats */}
        <section style={{ background: 'rgba(0,180,216,0.05)', borderTop: '1px solid rgba(0,180,216,0.15)', borderBottom: '1px solid rgba(0,180,216,0.15)', padding: '2.5rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            {[
              { val: '22', label: 'Departments' },
              { val: '10', label: 'Wards/Prabhag' },
              { val: '500+', label: 'Field Workers' },
              { val: '24/7', label: 'Monitoring' },
            ].map(s => (
              <div key={s.val}>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--teal)' }}>{s.val}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--grey)', marginTop: '0.25rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section>
          <div style={{ textAlign: 'center', padding: '4rem 2rem 0' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>How It Works</h2>
            <p style={{ color: 'var(--grey)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Three simple steps to make your city better</p>
          </div>
          <div className="features-grid">
            {[
              { icon: '📝', title: 'Report an Issue', desc: 'Fill in the complaint form with details, images, and your exact GPS location on the map.' },
              { icon: '🔔', title: 'Get Notified', desc: 'Receive instant email & website notifications as your complaint is assigned and progressed.' },
              { icon: '📍', title: 'Track Real-Time', desc: 'Watch your complaint status update from "Reported" to "Assigned" to "Completed" in real time.' },
              { icon: '👥', title: 'Community Feed', desc: 'See all reported issues in your area. Upvote urgent ones to prioritize faster resolution.' },
              { icon: '🏛️', title: 'Direct Authority', desc: 'Your complaint reaches the right department authority immediately. No middlemen, no delays.' },
              { icon: '⚠️', title: 'Escalate Issues', desc: 'If work isn\'t done on time, raise an escalation alert to fast-track resolution.' },
            ].map((f, i) => (
              <div key={f.title} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ textAlign: 'center', padding: '5rem 2rem', background: 'linear-gradient(135deg, rgba(0,180,216,0.08), rgba(45,158,107,0.08))' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Ready to make a difference?</h2>
          <p style={{ color: 'var(--grey)', marginTop: '0.75rem', marginBottom: '2rem', fontSize: '0.9rem' }}>Join thousands of citizens already reporting and tracking civic issues.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Create Account</Link>
            <a href="http://localhost:3001" className="btn btn-ghost btn-lg" target="_blank" rel="noreferrer">Government Portal →</a>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem', textAlign: 'center', color: 'var(--grey-dark)', fontSize: '0.78rem' }}>
          <div style={{ marginBottom: '0.5rem', color: 'var(--grey)' }}>
            <strong style={{ color: 'var(--white)' }}>PublicWatch</strong> — Empowering Citizens. Improving Cities.
          </div>
          <div>© 2026 Vasai-Virar City Municipal Corporation. All rights reserved.</div>
        </footer>
      </div>
    </>
  );
}
