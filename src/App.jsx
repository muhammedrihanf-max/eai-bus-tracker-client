import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import Login from './components/Login';
import NotificationToast from './components/NotificationToast';
import useGeolocation from './hooks/useGeolocation';
import './index.css';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const socket = io(SERVER_URL);

// Haversine Distance Helper
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

function App() {
  const [vehicles, setVehicles] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [stops, setStops] = useState([]);
  const [overspeedLogs, setOverspeedLogs] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [user, setUser] = useState(null);
  const [viewerLocation, setViewerLocation] = useState(null);
  const [notifiedVehicles, setNotifiedVehicles] = useState(new Set());
  const [alerts, setAlerts] = useState([]);

  // Function to send location update to server
  const sendLocationUpdate = useCallback((coords) => {
    setViewerLocation(coords);

    if (user) {
      const trackingId = user.role === 'admin' ? 'Admin' : (user.role === 'driver' ? user.vehicle_id : `STAFF-${user.name.replace(/\s+/g, '-')}`);
      socket.emit('update_location', {
        vehicle_id: trackingId,
        driver_name: user.name,
        phone: user.mobile || user.phone || '',
        role: user.role,
        ...coords
      });
    }
  }, [user]);

  const { isTracking, startTracking, stopTracking, error: geoError } = useGeolocation(sendLocationUpdate);

  useEffect(() => {
    socket.on('initial_positions', (data) => setVehicles(data));
    socket.on('drivers_list', (data) => setDrivers(data));
    socket.on('stops_list', (data) => setStops(data));
    socket.on('overspeed_logs', (data) => setOverspeedLogs(data));
    
    socket.on('location_updated', (data) => {
      setVehicles(prev => ({ ...prev, [data.vehicle_id]: data }));
    });

    socket.on('vehicle_removed', (vehicleId) => {
      setVehicles(prev => {
        const newVehicles = { ...prev };
        delete newVehicles[vehicleId];
        return newVehicles;
      });
    });

    return () => {
      socket.off('initial_positions');
      socket.off('drivers_list');
      socket.off('stops_list');
      socket.off('location_updated');
      socket.off('vehicle_removed');
      socket.off('overspeed_logs');
    };
  }, []);

  // Proximity Detection Effect (Unified)
  useEffect(() => {
    if ((user?.role === 'employee' || user?.role === 'admin') && viewerLocation && Object.keys(vehicles).length > 0) {
      Object.entries(vehicles).forEach(([id, vehicle]) => {
        if (!notifiedVehicles.has(id)) {
          const distance = calculateDistance(
            viewerLocation.lat, viewerLocation.lng,
            vehicle.lat, vehicle.lng
          );

          if (distance <= 500) { // 500m Radius
            const message = `Bus ${vehicle.vehicle_id} (${vehicle.driver_name}) is less than 500m away!`;
            setAlerts(prev => [...prev, { id: Date.now() + Math.random(), message }]);
            
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("EAI BUS TRACKER", {
                body: message,
                icon: "/driver-logo.png"
              });
            }
            setNotifiedVehicles(prev => new Set([...prev, id]));
          }
        }
      });
    }
  }, [vehicles, viewerLocation, notifiedVehicles, user]);

  const handleCreateDriver = (driverData) => socket.emit('create_driver', driverData);
  const handleUpdateDriver = (driverData) => socket.emit('update_driver', driverData);
  const handleDeleteDriver = (id) => socket.emit('delete_driver', id);
  
  const handleCreateStop = (stopData) => socket.emit('create_stop', stopData);
  const handleDeleteStop = (id) => socket.emit('delete_stop', id);

  const handleVehicleSelect = (id) => {
    setSelectedVehicleId(id);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'driver') {
      setSelectedVehicleId(userData.vehicle_id);
    }
  };

  const handleLogout = () => {
    if (user && socket) {
      const vehicleId = user.role === 'admin' ? 'Admin' : (user.role === 'driver' ? user.vehicle_id : `STAFF-${user.name.replace(/\s+/g, '-')}`);
      socket.emit('logout', vehicleId);
    }
    setUser(null);
    setSelectedVehicleId(null);
    if (isTracking) stopTracking();
  };

  // Global Notification Permission Request
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Auto-Start Tracking on Login
  useEffect(() => {
    if (user && !isTracking) {
      startTracking();
    }
  }, [user, isTracking, startTracking]);

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const filteredVehicles = user.role === 'driver'
    ? Object.fromEntries(Object.entries(vehicles).filter(([id]) => id === user.vehicle_id))
    : vehicles;

  return (
    <div className="app-container">
      <Sidebar 
        vehicles={filteredVehicles} 
        drivers={drivers}
        selectedId={selectedVehicleId}
        onSelect={handleVehicleSelect}
        user={user}
        onLogout={handleLogout}
        isTracking={isTracking}
        startTracking={startTracking}
        stopTracking={stopTracking}
        geoError={geoError}
        onCreateDriver={handleCreateDriver}
        onUpdateDriver={handleUpdateDriver}
        onDeleteDriver={handleDeleteDriver}
        stops={stops}
        onCreateStop={handleCreateStop}
        onDeleteStop={handleDeleteStop}
        overspeedLogs={overspeedLogs}
      />
      <div className="map-container">
        <MapView 
          vehicles={filteredVehicles} 
          selectedId={selectedVehicleId}
          user={user}
          isTracking={isTracking}
          viewerCoords={viewerLocation}
          stops={stops}
          onCreateStop={handleCreateStop}
        />
      </div>

      {/* Alert Toasts */}
      <div className="alerts-container">
        {alerts.map(alert => (
          <NotificationToast 
            key={alert.id}
            message={alert.message}
            onClose={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
