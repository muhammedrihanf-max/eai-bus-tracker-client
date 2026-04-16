import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon Component
const createCustomIcon = (vehicleId, role, vehicles) => {
  const isStaff = role === 'admin' || role === 'employee';
  const isSpeeding = !isStaff && (vehicles?.[vehicleId]?.speed > 80);
  const color = isStaff ? '#10b981' : (isSpeeding ? '#ef4444' : '#3b82f6');
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container">
        <div class="marker-pulse" style="background-color: ${color}; ${isSpeeding ? 'animation: pulse-danger 1.5s infinite;' : ''}"></div>
        <div class="marker-icon" style="background-color: white; overflow: hidden; padding: 2px; border: 2px solid ${color}; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
          ${isStaff 
            ? `<img src="/employee-logo.jpg" style="width: 100%; height: 100%; object-fit: contain; image-rendering: -webkit-optimize-contrast;" alt="Staff" />`
            : `<img src="/driver-logo.png" style="width: 100%; height: 100%; object-fit: contain; image-rendering: -webkit-optimize-contrast;" alt="Driver" />`
          }
        </div>
      </div>
    `,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
};

const createStopIcon = () => {
  return L.divIcon({
    className: 'stop-marker',
    html: `
      <div class="marker-container">
        <div class="marker-icon" style="background-color: white; overflow: hidden; padding: 2px; border: 2px solid #ef4444; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);">
          <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #ef4444;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const createViewerIcon = (role) => {
  const isStaff = role === 'admin' || role === 'employee';
  const color = isStaff ? '#2563eb' : '#3b82f6';
  
  return L.divIcon({
    className: 'viewer-marker',
    html: `
      <div class="marker-container">
        <div class="blue-dot-pulse"></div>
        <div class="marker-icon" style="background-color: white; overflow: hidden; padding: 2px; border: 2px solid ${color}; box-shadow: 0 0 15px rgba(37, 99, 235, 0.8);">
          ${isStaff 
            ? `<img src="/employee-logo.jpg" style="width: 100%; height: 100%; object-fit: contain; image-rendering: -webkit-optimize-contrast;" alt="Viewer" />`
            : `<img src="/driver-logo.png" style="width: 100%; height: 100%; object-fit: contain; image-rendering: -webkit-optimize-contrast;" alt="Viewer" />`
          }
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

const RecenterMap = ({ lat, lng, isTracking }) => {
  const map = useMap();
  const lastCenter = useRef(null);

  useEffect(() => {
    if (lat && lng) {
      const currentPos = L.latLng(lat, lng);
      
      // Only re-center if tracking is active AND either:
      // 1. No last center exists
      // 2. The distance moved is > 100 meters
      if (isTracking) {
        const shouldFly = !lastCenter.current || currentPos.distanceTo(lastCenter.current) > 100;
        
        if (shouldFly) {
          map.flyTo([lat, lng], map.getZoom(), { duration: 1.5 });
          lastCenter.current = currentPos;
        }
      }
    }
  }, [lat, lng, map, isTracking]);
  return null;
};

const MapClickHandler = ({ user, onCreateStop }) => {
  const map = useMap();
  useEffect(() => {
    if (user?.role === 'admin') {
      const handleClick = (e) => {
        const name = window.prompt('New Bus Stop Name:');
        if (name) {
          onCreateStop({
            name,
            lat: e.latlng.lat,
            lng: e.latlng.lng
          });
        }
      };
      map.on('click', handleClick);
      return () => map.off('click', handleClick);
    }
  }, [user, onCreateStop, map]);
  return null;
};

const MapView = ({ vehicles, selectedId, user, isTracking, viewerCoords, stops, onCreateStop }) => {
  const defaultCenter = [25.2048, 55.2708]; // Dubai
  const selectedVehicle = selectedId ? vehicles[selectedId] : null;

  return (
    <div className="map-container">
      <style>{`
        @keyframes pulse-danger {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {Object.values(vehicles).map((vehicle) => (
          <React.Fragment key={vehicle.vehicle_id}>
            <Marker 
              position={[vehicle.lat, vehicle.lng]}
              icon={createCustomIcon(vehicle.vehicle_id, vehicle.role, vehicles)}
            >
              <Popup>
                <div style={{ color: '#000' }}>
                  <strong>{vehicle.vehicle_id}</strong><br />
                  Driver: {vehicle.driver_name}<br />
                  {vehicle.phone && <>Mobile: {vehicle.phone}<br /></>}
                  Speed: {vehicle.speed} km/h<br />
                  Last Update: {new Date(vehicle.timestamp).toLocaleTimeString()}
                </div>
              </Popup>
            </Marker>
            
            {/* Traveled Path (Line) */}
            {vehicle.path && vehicle.path.length > 1 && (
              <Polyline 
                positions={vehicle.path}
                pathOptions={{ 
                  color: (vehicle.role === 'admin' || vehicle.role === 'employee') ? '#10b981' : '#3b82f6',
                  weight: 4,
                  opacity: 0.6,
                  dashArray: '10, 10'
                }}
              />
            )}
          </React.Fragment>
        ))}

        {/* Bus Stops */}
        {(stops || []).map((stop) => (
          <Marker 
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={createStopIcon()}
          >
            <Popup>
              <div style={{ color: '#000' }}>
                <strong>Bus Stop: {stop.name}</strong><br />
                {user.role === 'admin' && (
                  <div style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.75rem' }}>
                    Tip: Click elsewhere on map to add more stops.
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Local Viewer Marker */}
        {viewerCoords && (
          <Marker 
            position={[viewerCoords.lat, viewerCoords.lng]} 
            icon={createViewerIcon(user?.role)}
            zIndexOffset={1000}
          >
            <Popup><div style={{ color: '#000' }}>You are here</div></Popup>
          </Marker>
        )}

        {selectedVehicle && (
          <RecenterMap lat={selectedVehicle.lat} lng={selectedVehicle.lng} isTracking={isTracking} />
        )}

        {user.role === 'admin' && (
          <MapClickHandler user={user} onCreateStop={onCreateStop} />
        )}

        <MapControls 
          viewerCoords={viewerCoords} 
          isTracking={isTracking} 
        />
      </MapContainer>
    </div>
  );
};

const MapControls = ({ viewerCoords, isTracking }) => {
  const map = useMap();

  const handleRecenter = () => {
    if (viewerCoords) {
      map.flyTo([viewerCoords.lat, viewerCoords.lng], 15, { duration: 1.5 });
    }
  };

  return (
    <div className="map-controls-overlay">
      <button 
        className={`control-btn ${isTracking ? 'active' : ''}`}
        onClick={handleRecenter}
        title="Find My Location"
        disabled={!viewerCoords}
        style={{ opacity: viewerCoords ? 1 : 0.5 }}
      >
        <Crosshair size={24} />
      </button>
    </div>
  );
};

export default MapView;
