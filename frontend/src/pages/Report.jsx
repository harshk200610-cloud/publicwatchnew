import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, DEPARTMENTS, PRABHAGS, COMPLAINT_TYPES } from '../api';
import Navbar from '../components/Navbar';

// Captcha generator
function genCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function Report() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  const [form, setForm] = useState({
    prabhag: '', department: '', complaint_type: '', subject: '', description: '',
    latitude: '', longitude: '', exact_location: '', captcha_input: ''
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [captcha, setCaptcha] = useState(genCaptcha());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Initialize Leaflet map
  useEffect(() => {
    if (mapRef.current && !leafletMap.current && window.L) {
      const map = window.L.map(mapRef.current, { center: [19.42, 72.83], zoom: 13 });
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setForm(f => ({ ...f, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));

        if (markerRef.current) markerRef.current.remove();
        markerRef.current = window.L.marker([lat, lng]).addTo(map);

        // Reverse geocode using Nominatim
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
          .then(r => r.json())
          .then(data => {
            const a = data.address || {};
            const parts = [
              a.road || a.footway || '',
              a.neighbourhood || a.suburb || '',
              a.village || a.town || a.city || '',
              a.state_district || '',
              a.state || '',
              a.postcode || ''
            ].filter(Boolean);
            setForm(f => ({ ...f, exact_location: parts.join(', ') }));
          })
          .catch(() => {
            setForm(f => ({ ...f, exact_location: `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
          });
      });

      leafletMap.current = map;
      setMapReady(true);
    }
  }, []);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews(p => [...p, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (i) => {
    setImages(imgs => imgs.filter((_, idx) => idx !== i));
    setImagePreviews(ps => ps.filter((_, idx) => idx !== i));
  };

  const locateMe = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setForm(f => ({ ...f, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
      if (leafletMap.current) {
        leafletMap.current.setView([lat, lng], 16);
        if (markerRef.current) markerRef.current.remove();
        markerRef.current = window.L.marker([lat, lng]).addTo(leafletMap.current);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
          .then(r => r.json()).then(data => {
            const a = data.address || {};
            const parts = [a.road || '', a.neighbourhood || a.suburb || '', a.city || a.town || '', a.state || '', a.postcode || ''].filter(Boolean);
            setForm(f => ({ ...f, exact_location: parts.join(', ') }));
          });
      }
    }, () => alert('Unable to get location. Please allow location access.'));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.captcha_input.toUpperCase() !== captcha) {
      setError('Incorrect CAPTCHA. Please try again.');
      setCaptcha(genCaptcha());
      setForm(f => ({ ...f, captcha_input: '' }));
      return;
    }
    if (!form.exact_location) { setError('Please select a location on the map.'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('user_id', user.id);
      Object.entries(form).forEach(([k, v]) => { if (k !== 'captcha_input') fd.append(k, v); });
      images.forEach(img => fd.append('images[]', img));

      const res = await api.submitComplaint(fd);
      if (res.error) { setError(res.error); return; }
      setSuccess(`Complaint submitted! Your reference number is ${res.complaint_no}. Check your email for confirmation.`);
      setTimeout(() => navigate('/feed'), 4000);
    } catch { setError('Failed to submit. Is the backend running?'); }
    finally { setLoading(false); }
  };

  const deptTypes = COMPLAINT_TYPES[form.department] || [];

  return (
    <>
      {/* Load Leaflet */}
      {!window.L && (
        <>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" onLoad={() => setMapReady(true)} />
        </>
      )}
      <Navbar />
      <div className="page-header">
        <h1 className="page-title">Report an Issue</h1>
        <p className="page-sub">Fill in the details and pin your location on the map</p>
      </div>

      <form onSubmit={submit}>
        <div className="report-layout">
          {/* Left: Form */}
          <div className="report-form-panel">
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            {success && <div className="alert alert-success">✅ {success}</div>}

            {/* Citizen Details */}
            <div className="section-label">Citizen Details</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={`${user?.first_name || ''} ${user?.last_name || ''}`} readOnly style={{ opacity: 0.7 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={user?.phone || ''} readOnly style={{ opacity: 0.7 }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email || ''} readOnly style={{ opacity: 0.7 }} />
            </div>

            {/* Complaint Details */}
            <div className="section-label" style={{ marginTop: '1.5rem' }}>Complaint Details</div>
            <div className="form-group">
              <label className="form-label">Prabhag (क्षेत्र)</label>
              <select className="form-select" required value={form.prabhag} onChange={e => set('prabhag', e.target.value)}>
                <option value="">Select Prabhag</option>
                {PRABHAGS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-select" required value={form.department} onChange={e => { set('department', e.target.value); set('complaint_type', ''); }}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {form.department && (
              <div className="form-group">
                <label className="form-label">Complaint Type</label>
                <select className="form-select" required value={form.complaint_type} onChange={e => set('complaint_type', e.target.value)}>
                  <option value="">Select Type</option>
                  {deptTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-input" required value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Brief title of the issue" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" required value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the issue in detail — when it started, severity, impact on residents..." rows={5} />
            </div>

            {/* Images */}
            <div className="form-group">
              <label className="form-label">Photos (Multiple)</label>
              <div className="img-upload-area">
                <div className="img-upload-icon">📷</div>
                <div className="img-upload-text">Click to upload or drag photos here<br /><span style={{ fontSize: '0.75rem', color: 'var(--grey-dark)' }}>On mobile: take photo directly with camera</span></div>
                <input type="file" accept="image/*" multiple capture="environment" onChange={handleImages} />
              </div>
              {imagePreviews.length > 0 && (
                <div className="img-preview-grid">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="img-preview-item">
                      <img src={src} alt={`preview ${i}`} />
                      <button type="button" className="img-remove" onClick={() => removeImage(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CAPTCHA */}
            <div className="form-group">
              <label className="form-label">CAPTCHA Verification</label>
              <div className="captcha-box">
                <div className="captcha-code">{captcha}</div>
                <button type="button" className="captcha-refresh" onClick={() => { setCaptcha(genCaptcha()); set('captcha_input', ''); }}>↻</button>
                <input className="form-input" style={{ flex: 1 }} value={form.captcha_input} onChange={e => set('captcha_input', e.target.value)} placeholder="Enter the code above" required />
              </div>
            </div>

            {/* Coordinates */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input className="form-input" value={form.latitude} readOnly placeholder="Click map to set" style={{ opacity: 0.7 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input className="form-input" value={form.longitude} readOnly placeholder="Click map to set" style={{ opacity: 0.7 }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Exact Location</label>
              <input className="form-input" value={form.exact_location} onChange={e => set('exact_location', e.target.value)} placeholder="Auto-filled when you pin on map" />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Submitting...' : '📤 Submit Complaint'}
            </button>
          </div>

          {/* Right: Map */}
          <div className="report-map-panel">
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>📍 Pin Your Location</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--grey)', marginTop: '0.2rem' }}>Click anywhere on the map to set location</div>
              </div>
              <button type="button" className="btn btn-teal btn-sm" onClick={locateMe} style={{ background: 'var(--teal)', color: 'var(--navy)', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.78rem', fontWeight: 700 }}>
                🎯 My Location
              </button>
            </div>
            <div className="map-container" ref={mapRef} id="report-map" style={{ height: 420 }} />
            <div className="map-info" style={{ background: 'var(--navy-light)', padding: '1rem' }}>
              {form.exact_location
                ? <div style={{ fontSize: '0.82rem', color: 'var(--teal)' }}>📍 {form.exact_location}</div>
                : <div style={{ fontSize: '0.8rem', color: 'var(--grey-dark)' }}>No location selected — click the map or use "My Location"</div>
              }
              {form.latitude && (
                <div style={{ fontSize: '0.72rem', color: 'var(--grey-dark)', marginTop: '0.3rem' }}>
                  {form.latitude}, {form.longitude}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
