import React, { useState } from 'react';
import { Truck, Navigation, Shield, User, LogOut, Search, Users, Plus, Edit2, Trash2, X, Phone } from 'lucide-react';
import DriverModal from './DriverModal';

const Sidebar = ({ 
  vehicles, drivers, onSelect, selectedId, user, onLogout, 
  isTracking, startTracking, stopTracking, geoError,
  onCreateDriver, onUpdateDriver, onDeleteDriver
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('fleet'); // 'fleet' or 'users'
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

  return (
    <>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'fixed', left: isCollapsed ? '1rem' : 'calc(var(--sidebar-width) + 1rem)', top: '1.5rem',
          zIndex: 10000, padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)',
          backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', color: 'white',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        title={isCollapsed ? "Show Sidebar" : "Hide Sidebar"}
      >
        {isCollapsed ? <Plus size={20} style={{ transform: 'rotate(45deg)' }} /> : <X size={20} />}
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
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Fleet Management</div>
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
          
          {user.role === 'admin' && (
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
                <Truck size={14} /> Fleet
              </button>
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
            </div>
          )}

          <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" placeholder="Search vehicles or drivers..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)',
                  color: 'white', fontSize: '0.875rem', outline: 'none'
                }}
              />
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>GPS TRACKING</span>
                <span style={{ 
                  fontSize: '0.6rem', backgroundColor: isTracking ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: isTracking ? '#10b981' : '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: '700'
                }}>
                  {isTracking ? 'ACTIVE' : 'OFFLINE'}
                </span>
              </div>
              <button
                onClick={isTracking ? stopTracking : startTracking}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '0.6rem', border: 'none',
                  backgroundColor: isTracking ? '#ef4444' : 'var(--primary)', color: 'white',
                  fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s'
                }}
              >
                {isTracking ? 'Stop Tracking' : 'Start My Location Tracking'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="vehicle-list" style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
              {activeTab === 'fleet' ? `Active Fleet (${vehicleList.length})` : `Driver Accounts (${driverList.length})`}
            </div>
            {activeTab === 'users' && user.role === 'admin' && (
              <button 
                onClick={() => { setEditingDriver(null); setIsModalOpen(true); }}
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
                  color: 'var(--primary)', padding: '0.3rem 0.6rem', borderRadius: '0.5rem',
                  fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem'
                }}
              >
                <Plus size={14} /> Add Driver
              </button>
            )}
          </div>
          
          {activeTab === 'fleet' ? (
            vehicleList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Truck size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.85rem' }}>No active vehicles</p>
              </div>
            ) : (
              vehicleList.map((item) => (
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <User size={14} /> <span>{item.driver_name}</span>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            driverList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Users size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.85rem' }}>No driver accounts found</p>
              </div>
            ) : (
              driverList.map((d) => (
                <div key={d.id} style={{ padding: '1rem', borderRadius: '1rem', marginBottom: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--primary)' }}>
                        <User size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'white', fontSize: '0.9rem' }}>{d.driver_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.vehicle_id}</div>
                        {d.mobile_number && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                            <Phone size={10} />
                            <span>{d.mobile_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setEditingDriver(d); setIsModalOpen(true); }} style={{ padding: '0.4rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#94a3b8', cursor: 'pointer' }}><Edit2 size={14} /></button>
                      <button onClick={() => { if(window.confirm('Delete this account?')) onDeleteDriver(d.id); }} style={{ padding: '0.4rem', borderRadius: '0.4rem', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
        <DriverModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editingDriver={editingDriver} onSave={(data) => { if (editingDriver) onUpdateDriver(data); else onCreateDriver(data); }} />
      </aside>
    </>
  );
};

export default Sidebar;
