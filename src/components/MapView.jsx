import React, { useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon Component
const createCustomIcon = (vehicleId, role) => {
  const isStaff = role === 'superadmin' || role === 'employee';
  const color = isStaff ? '#10b981' : '#3b82f6';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container">
        <div class="marker-pulse" style="background-color: ${color}"></div>
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

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], map.getZoom(), { duration: 1.5 });
    }
  }, [lat, lng, map]);
  return null;
};

const createViewerIcon = () => {
  return L.divIcon({
    className: 'viewer-marker',
    html: `
      <div class="marker-container">
        <div class="blue-dot-pulse"></div>
        <div class="marker-icon" style="background-color: white; overflow: hidden; padding: 2px; border: 2px solid #2563eb; box-shadow: 0 0 15px rgba(37, 99, 235, 0.8);">
          <img src="/employee-logo.jpg" style="width: 100%; height: 100%; object-fit: contain; image-rendering: -webkit-optimize-contrast;" alt="Viewer" />
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

const MapView = ({ vehicles, selectedId, user, isTracking, viewerCoords }) => {
  const defaultCenter = [25.2048, 55.2708]; // Dubai
  const selectedVehicle = selectedId ? vehicles[selectedId] : null;

  return (
    <div className="map-container">
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
          <Marker 
            key={vehicle.vehicle_id}
            position={[vehicle.lat, vehicle.lng]}
            icon={createCustomIcon(vehicle.vehicle_id, vehicle.role)}
          >
            <Popup>
              <div style={{ color: '#000' }}>
                <strong>{vehicle.vehicle_id}</strong><br />
                Driver: {vehicle.driver_name}<br />
                Speed: {vehicle.speed} km/h<br />
                Last Update: {new Date(vehicle.timestamp).toLocaleTimeString()}<br />
                {user.role === 'superadmin' && (
                  <div style={{ marginTop: '0.5rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                    <span style={{ color: 'blue', fontSize: '0.75rem' }}>Admin Tools Active</span>
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
            icon={createViewerIcon()}
            zIndexOffset={1000}
          >
            <Popup><div style={{ color: '#000' }}>You are here</div></Popup>
          </Marker>
        )}

        {selectedVehicle && (
          <RecenterMap lat={selectedVehicle.lat} lng={selectedVehicle.lng} />
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
