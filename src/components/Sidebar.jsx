import React, { useState } from 'react';
import { Truck, Navigation, Shield, User, LogOut, Search, Users, Plus, Edit2, Trash2, X, Phone, Flag, Clock } from 'lucide-react';
import DriverModal from './DriverModal';

const Sidebar = ({ 
  vehicles, drivers, onSelect, selectedId, user, onLogout, 
  isTracking, startTracking, stopTracking, geoError,
  onCreateDriver, onUpdateDriver, onDeleteDriver,
  stops, onCreateStop, onDeleteStop
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('fleet'); // 'fleet', 'users', or 'stops'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const vehicleList = Object.values(vehicles).filter(v => {
    const vId = (v.vehicle_id || '').toLowerCase();
    const dName = (v.driver_name || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return vId.includes(search) || dName.includes(search);
  });

  const driverList = (drivers || []).filter(d => {
    const vId = (d.vehicle_id || '').toLowerCase();
    const dName = (d.driver_name || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return vId.includes(search) || dName.includes(search);
  });

  // Haversine Distance Helper for Progress
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // meters
  };

  const selectedVehicle = selectedId ? vehicles[selectedId] : null;

  return (
    <>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'fixed', 
          left: isCollapsed ? '1rem' : 'max(1rem, calc(var(--sidebar-width) - 2.5rem))', 
          top: '1.5rem',
          zIndex: 10001, 
          padding: '0.6rem', 
          borderRadius: '0.75rem', 
          border: '1px solid var(--glass-border)',
          backgroundColor: 'rgba(15, 23, 42, 0.9)', 
          backdropFilter: 'blur(12px)', 
          color: 'white',
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        title={isCollapsed ? "Show Sidebar" : "Hide Sidebar"}
      >
        {isCollapsed ? <Truck size={20} /> : <X size={20} />}
      </button>

      <aside className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`} style={{
        transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
        opacity: isCollapsed ? 0 : 1,
        pointerEvents: isCollapsed ? 'none' : 'all',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="accent-gradient" style={{
              padding: '0.6rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
            }}>
              <Navigation size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.025em', lineHeight: 1 }}>EAI BUS TRACKER</h1>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Vehicle Management</div>
            </div>
            <button 
              onClick={onLogout} 
              style={{ 
                marginLeft: 'auto', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', 
                color: '#ef4444', padding: '0.5rem', borderRadius: '0.6rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }} 
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
              Current Profile
            </div>
            <div style={{ 
              padding: '1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid var(--border)'
              }}>
                {(user.role === 'admin' || user.role === 'employee') ? (
                  <img src="/employee-logo.jpg" style={{ width: '100%', height: '100%', objectDistance: 'cover' }} alt="Profile" />
                ) : (
                  <Truck size={22} color="#f59e0b" />
                )}
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'white' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.25rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }}>
            <button 
              onClick={() => setActiveTab('fleet')}
              style={{
                flex: 1, padding: '0.6rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer',
                backgroundColor: activeTab === 'fleet' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'fleet' ? 'white' : 'var(--text-muted)',
                fontWeight: '700', fontSize: '0.8rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              <Truck size={14} /> Vehicle
            </button>
            {user.role === 'admin' && (
              <button 
                onClick={() => setActiveTab('users')}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer',
                  backgroundColor: activeTab === 'users' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'users' ? 'white' : 'var(--text-muted)',
                  fontWeight: '700', fontSize: '0.8rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                <Users size={14} /> Users
              </button>
            )}
            <button 
              onClick={() => setActiveTab('stops')}
              style={{
                flex: 1, padding: '0.6rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer',
                backgroundColor: activeTab === 'stops' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'stops' ? 'white' : 'var(--text-muted)',
                fontWeight: '700', fontSize: '0.8rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              <Flag size={14} /> Stops
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" placeholder="Search..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)',
                  color: 'white', fontSize: '0.875rem', outline: 'none'
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="vehicle-list" style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem 1.5rem' }}>
          {activeTab === 'fleet' && (
            <>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', marginBottom: '0.75rem' }}>
                Active Vehicles ({vehicleList.length})
              </div>
              {vehicleList.map((item) => (
                <div 
                  key={item.vehicle_id}
                  className={`vehicle-item ${selectedId === item.vehicle_id ? 'active' : ''}`}
                  onClick={() => onSelect(item.vehicle_id)}
                  style={{
                    padding: '1rem', borderRadius: '1rem', marginBottom: '0.75rem', cursor: 'pointer',
                    transition: 'all 0.2s', backgroundColor: selectedId === item.vehicle_id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid', borderColor: selectedId === item.vehicle_id ? 'var(--primary)' : 'var(--glass-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '800', color: 'white', fontSize: '0.9rem' }}>{item.vehicle_id}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                      <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>LIVE</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <User size={14} /> <span>{item.driver_name}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === 'users' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                  Driver Accounts ({driverList.length})
                </div>
                <button onClick={() => { setEditingDriver(null); setIsModalOpen(true); }} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'var(--primary)', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.70rem', fontWeight: '700', cursor: 'pointer' }}>+ Add</button>
              </div>
              {driverList.map((d) => (
                <div key={d.id} style={{ padding: '1rem', borderRadius: '1rem', marginBottom: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: 'white', fontSize: '0.9rem' }}>{d.driver_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.vehicle_id}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => { setEditingDriver(d); setIsModalOpen(true); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Edit2 size={14} /></button>
                        <button onClick={() => { if(window.confirm('Delete?')) onDeleteDriver(d.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                      </div>
                   </div>
                </div>
              ))}
            </>
          )}

          {activeTab === 'stops' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                  Trip Progress
                </div>
                {user.role === 'admin' && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '600' }}>Click map to add</span>
                )}
              </div>
              
              {selectedVehicle ? (
                <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px dashed rgba(255,255,255,0.1)', marginLeft: '0.5rem' }}>
                  {(stops || []).map((stop, index) => {
                    const distance = calculateDistance(selectedVehicle.lat, selectedVehicle.lng, stop.lat, stop.lng);
                    const isArrived = distance < 100;

                    return (
                      <div key={stop.id} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <div style={{
                          position: 'absolute', left: '-1.9rem', top: '0', width: '12px', height: '12px',
                          borderRadius: '50%', backgroundColor: isArrived ? '#10b981' : '#334155',
                          border: `2px solid ${isArrived ? '#10b981' : '#475569'}`,
                          boxShadow: isArrived ? '0 0 10px #10b981' : 'none'
                        }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: '700', color: isArrived ? '#10b981' : 'white', fontSize: '0.85rem' }}>{stop.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                              <Clock size={10} /> {isArrived ? 'Arrived' : `${(distance/1000).toFixed(1)} km away`}
                            </div>
                          </div>
                          {user.role === 'admin' && (
                            <button onClick={() => onDeleteStop(stop.id)} style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.5, cursor: 'pointer' }}><Trash2 size={12} /></button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed var(--glass-border)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select a vehicle to see progress</p>
                </div>
              )}
            </>
          )}
        </div>
        <DriverModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editingDriver={editingDriver} onSave={(data) => { if (editingDriver) onUpdateDriver(data); else onCreateDriver(data); }} />
      </aside>
    </>
  );
};

export default Sidebar;
