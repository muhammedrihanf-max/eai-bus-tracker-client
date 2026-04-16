import React, { useState } from 'react';
import { Shield, User, Truck, Navigation, ArrowRight, ChevronDown, AlertCircle, Lock } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [role, setRole] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (role === 'driver') {
      if (!name) return;
      setLoading(true);
      try {
        const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
        const res = await fetch(`${serverUrl}/api/drivers`);
        const drivers = await res.json();
        const match = drivers.find(
          d => d.driver_name.trim().toLowerCase() === name.trim().toLowerCase()
        );
        if (!match) {
          setError('Driver not found. Please enter your registered name exactly as set by the Admin.');
          setLoading(false);
          return;
        }
        onLogin({ role, name: match.driver_name, vehicleId: match.vehicle_id });
      } catch {
        setError('Cannot reach server. Please try again.');
      }
      setLoading(false);
    } else if (role === 'admin') {
      if (!password) return;
      setLoading(true);
      try {
        const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
        const res = await fetch(`${serverUrl}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const data = await res.json();
        if (res.ok) {
          onLogin({ role: 'admin', name: 'Admin' });
        } else {
          setError(data.error || 'Invalid admin password');
        }
      } catch {
        setError('Cannot reach server. Please try again.');
      }
      setLoading(false);
    } else {
      if (!name && role !== 'admin') return;
      onLogin({ role, name });
    }
  };

  return (
    <div className="premium-gradient" style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    }}>
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 70%)',
        top: '-10%',
        left: '-10%',
        borderRadius: '50%',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0) 70%)',
        bottom: '-10%',
        right: '-10%',
        borderRadius: '50%',
        filter: 'blur(40px)',
      }} />

      <div className="glass-panel" style={{
        padding: 'clamp(1.5rem, 5vw, 3rem)',
        borderRadius: '2rem',
        width: 'min(440px, 92vw)',
        textAlign: 'center',
        maxHeight: 'min(800px, 95vh)',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 1,
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="accent-gradient" style={{
            width: '72px',
            height: '72px',
            borderRadius: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            background: '#3b82f6',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)'
          }}>
            <Navigation color="white" size={36} />
          </div>
          <h1 style={{ color: 'white', fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: '800', letterSpacing: '-0.025em' }}>EAI BUS TRACKER</h1>
          <p style={{ color: '#94a3b8', marginTop: '0.75rem', fontSize: '1.1rem' }}>
            {role ? `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}` : 'Select your workspace profile'}
          </p>
        </div>

        {!role ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', display: 'block' }}>Select Role</label>
              <select 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'admin') setRole('admin');
                  else if (val === 'employee') onLogin({ role: 'employee', name: 'Staff' });
                  else if (val === 'driver') handleRoleSelect('driver');
                }}
                defaultValue=""
                style={{
                  ...inputStyle,
                  appearance: 'none',
                  cursor: 'pointer',
                  paddingRight: '2.5rem',
                  backgroundColor: '#1e293b',
                  color: 'white'
                }}
              >
                <option value="" disabled style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>Choose your role...</option>
                <option value="admin" style={{ backgroundColor: '#1e293b', color: 'white' }}>Admin (Full Access)</option>
                <option value="employee" style={{ backgroundColor: '#1e293b', color: 'white' }}>Employee (Viewer)</option>
                <option value="driver" style={{ backgroundColor: '#1e293b', color: 'white' }}>Driver (Tracker)</option>
              </select>
              <div style={{ position: 'absolute', right: '1rem', top: '2.6rem', pointerEvents: 'none', color: '#94a3b8' }}>
                <ChevronDown size={18} />
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--glass-border)'
            }}>
              <div style={{ ...iconBoxStyle, width: '40px', height: '40px', overflow: 'hidden', padding: 0 }}>
                <img src="/employee-logo.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Logos" />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Select a staff role above to log in instantly.
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
            {role === 'driver' ? (
              <div>
                <label style={labelStyle}>Driver Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your registered name"
                  required 
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  style={inputStyle}
                />
              </div>
            ) : (
              <div>
                <label style={labelStyle}>Admin Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password" 
                    placeholder="Enter admin password"
                    required 
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    style={{ ...inputStyle, paddingLeft: '3rem' }}
                  />
                  <div style={{ position: 'absolute', left: '1.25rem', top: '1.4rem', color: '#64748b' }}>
                    <Lock size={18} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.85rem', backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => { setRole(null); setError(''); setPassword(''); setName(''); }}
                style={{ ...submitButtonStyle, background: 'transparent', border: '1px solid #334155', width: 'auto', padding: '1rem' }}
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={loading}
                style={{ ...submitButtonStyle, flex: 1, backgroundColor: loading ? '#475569' : '#3b82f6', border: 'none' }}
              >
                {loading ? 'Verifying...' : <><span>{role === 'admin' ? 'Authorize Admin' : 'Continue Tracking'}</span> <ArrowRight size={18} /></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const roleButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.25rem',
  padding: '1.25rem',
  borderRadius: '1rem',
  border: '1px solid #334155',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  color: 'white',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  width: '100%',
  outline: 'none',
};

const iconBoxStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '0.75rem',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const inputStyle = {
  width: '100%',
  padding: '1rem 1.25rem',
  borderRadius: '0.75rem',
  border: '1px solid #334155',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  color: 'white',
  fontSize: '16px', /* Prevent iOS zoom */
  marginTop: '0.5rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  minHeight: '44px' /* Touch target */
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#94a3b8',
  marginLeft: '0.25rem'
};

const submitButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
  padding: '1rem',
  borderRadius: '0.75rem',
  border: '1px solid #334155',
  backgroundColor: '#334155',
  color: 'white',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  outline: 'none',
};

export default Login;
