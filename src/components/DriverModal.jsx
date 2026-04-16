import React, { useState } from 'react';
import { X, Save, User, Car, Phone } from 'lucide-react';

const DriverModal = ({ isOpen, onClose, onSave, editingDriver }) => {
  const [name, setName] = useState(editingDriver?.driver_name || '');
  const [vehicleId, setVehicleId] = useState(editingDriver?.vehicle_id || '');
  const [mobileNumber, setMobileNumber] = useState(editingDriver?.mobile_number || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: editingDriver?.id,
      driver_name: name,
      vehicle_id: vehicleId.toUpperCase(),
      mobile_number: mobileNumber,
      role: 'driver'
    });
    onClose();
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000
    }}>
      <div className="glass-panel" style={{
        width: '400px', padding: '2rem', borderRadius: '1.5rem',
        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '800' }}>
            {editingDriver ? 'Edit Driver' : 'Create New Driver'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', display: 'block' }}>Driver Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '0.75rem',
                  backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid #334155', color: 'white', outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', display: 'block' }}>Vehicle ID (Plate No.)</label>
            <div style={{ position: 'relative' }}>
              <Car size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value.toUpperCase())}
                placeholder="e.g. BUS-405"
                required
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '0.75rem',
                  backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid #334155', color: 'white', outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', display: 'block' }}>Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="tel" 
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g. +971 50 XXX XXXX"
                required
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '0.75rem',
                  backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid #334155', color: 'white', outline: 'none'
                }}
              />
            </div>
          </div>
          <button type="submit" style={{
            marginTop: '1rem', padding: '1rem', borderRadius: '0.75rem', border: 'none',
            backgroundColor: 'var(--primary)', color: 'white', fontWeight: '700', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
          }}>
            <Save size={18} /> {editingDriver ? 'Save Changes' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DriverModal;
