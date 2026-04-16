import React, { useEffect, useState } from 'react';
import { Bell, X, Info } from 'lucide-react';

const NotificationToast = ({ message, type = 'info', onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for transition
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification-toast glass-panel ${isVisible ? 'visible' : ''}`} style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      padding: '1rem',
      minWidth: '320px',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      borderRadius: '1rem',
      borderLeft: '4px solid var(--primary)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
      transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}>
      <div style={{
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        padding: '0.6rem',
        borderRadius: '0.75rem',
        color: 'var(--primary)'
      }}>
        <Bell size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'white' }}>Alert</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{message}</div>
      </div>
      <button onClick={() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }} style={{
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '0.2rem'
      }}>
        <X size={16} />
      </button>
    </div>
  );
};

export default NotificationToast;
