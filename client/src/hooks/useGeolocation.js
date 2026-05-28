
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'Freiwilliger/1.0';
const CACHE_KEY = 'geolocation_cache';
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    const fetchGeolocation = async () => {
      try {
        // Check cache first
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { timestamp, data } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
            if (isMounted.current) {
              setLocation(data);
              setLoading(false);
            }
            return;
          }
        }

        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by your browser.');
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            try {
              const response = await axios.get(NOMINATIM_BASE_URL, {
                params: {
                  lat: latitude,
                  lon: longitude,
                  format: 'json',
                },
                headers: {
                  'User-Agent': USER_AGENT,
                },
              });

              const address = response.data.address;
              const city = address.city || address.town || address.village || null;
              const state = address.state || null;

              const geoData = { lat: latitude, lng: longitude, city, state };

              // Cache the result
              localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: geoData }));

              if (isMounted.current) {
                setLocation(geoData);
              }
            } catch (nominatimError) {
              console.error('Nominatim API error:', nominatimError);
              if (isMounted.current) {
                setError('Failed to get location details from Nominatim.');
              }
            } finally {
              if (isMounted.current) {
                setLoading(false);
              }
            }
          },
          (geoError) => {
            console.error('Geolocation error:', geoError);
            let errorMessage = 'Geolocation permission denied.';
            if (geoError.code === geoError.PERMISSION_DENIED) {
              errorMessage = 'Geolocation permission denied. Please enable location services.';
            } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
              errorMessage = 'Location information is unavailable.';
            } else if (geoError.code === geoError.TIMEOUT) {
              errorMessage = 'The request to get user location timed out.';
            }
            if (isMounted.current) {
              setError(errorMessage);
              setLoading(false);
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } catch (err) {
        console.error('Geolocation setup error:', err);
        if (isMounted.current) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchGeolocation();

    return () => {
      isMounted.current = false;
    };
  }, []);

  return { location, loading, error };
};

export default useGeolocation;
