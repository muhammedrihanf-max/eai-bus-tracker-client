import { useState, useEffect, useRef } from 'react';

const useGeolocation = (onLocationUpdate) => {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const watchId = useRef(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setError(null);

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        onLocationUpdate({
          lat: latitude,
          lng: longitude,
          speed: speed ? Math.round(speed * 3.6) : 0, // Convert m/s to km/h
          heading: heading || 0,
          timestamp: position.timestamp
        });
      },
      (err) => {
        setError(err.message);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return { isTracking, startTracking, stopTracking, error };
};

export default useGeolocation;
