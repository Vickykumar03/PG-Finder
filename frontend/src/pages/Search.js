import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import PGCard from '../components/PGCard';
import './Search.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const pgIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [center, map]);
  return null;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [pgs, setPGs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([23.2599, 77.4126]);
  const [total, setTotal] = useState(0);

  // Use a ref to track if initial load from URL params has been done
  const initialLoadDone = useRef(false);

  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    radius: 5000,
    amenities: [],
    city: searchParams.get('city') || '',
  });

  const amenityOptions = ['wifi', 'ac', 'meals', 'parking', 'laundry', 'security', 'gym', 'hotWater'];

  // fetchNearby: always uses latest filters via argument
  const fetchNearby = useCallback(async (lat, lng, currentFilters) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        lat,
        lng,
        radius: currentFilters.radius,
        ...(currentFilters.type && { type: currentFilters.type }),
        ...(currentFilters.minPrice && { minPrice: currentFilters.minPrice }),
        ...(currentFilters.maxPrice && { maxPrice: currentFilters.maxPrice }),
        ...(currentFilters.amenities.length && { amenities: currentFilters.amenities.join(',') }),
      });
      const res = await axios.get(`${API}/pgs/nearby?${params}`);
      setPGs(res.data.data || []);
      setTotal(res.data.count || 0);
      setMapCenter([lat, lng]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch nearby PGs');
      setPGs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByCity = useCallback(async (currentFilters) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        ...(currentFilters.city && { city: currentFilters.city }),
        ...(currentFilters.type && { type: currentFilters.type }),
        ...(currentFilters.minPrice && { minPrice: currentFilters.minPrice }),
        ...(currentFilters.maxPrice && { maxPrice: currentFilters.maxPrice }),
      });
      const res = await axios.get(`${API}/pgs?${params}`);
      setPGs(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch PGs');
      setPGs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load from URL params — runs only once
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const nearby = searchParams.get('nearby');

    if (lat && lng && nearby) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      setUserLocation([parsedLat, parsedLng]);
      fetchNearby(parsedLat, parsedLng, filters);
    } else {
      fetchByCity(filters);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        fetchNearby(latitude, longitude, filters);
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        setError('Location access denied. Please enable it in browser settings.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const applyFilters = () => {
    if (userLocation) {
      fetchNearby(userLocation[0], userLocation[1], filters);
    } else {
      fetchByCity(filters);
    }
  };

  const toggleAmenity = (a) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  };

  return (
    <div className="search-page page-wrapper">
      <div className="search-layout">
        {/* Sidebar Filters */}
        <aside className="filter-sidebar">
          <div className="filter-card">
            <h3>🔍 Search & Filters</h3>

            <div className="filter-section">
              <label>City / Area</label>
              <input
                type="text"
                placeholder="Enter city..."
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
            </div>

            <button
              className={`location-find-btn ${locationLoading ? 'loading' : ''}`}
              onClick={requestLocation}
              disabled={locationLoading}
            >
              {locationLoading ? '⏳ Detecting...' : '📍 Use My Location'}
            </button>

            {userLocation && (
              <div className="location-indicator">
                ✅ Location detected! Showing PGs within {filters.radius / 1000}km
              </div>
            )}

            <div className="filter-section">
              <label>PG Type</label>
              <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                <option value="">All Types</option>
                <option value="boys">Boys Only</option>
                <option value="girls">Girls Only</option>
                <option value="coed">Co-ed</option>
              </select>
            </div>

            {userLocation && (
              <div className="filter-section">
                <label>Search Radius: {filters.radius / 1000}km</label>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={filters.radius}
                  onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
                  className="range-slider"
                />
                <div className="range-labels"><span>0.5km</span><span>20km</span></div>
              </div>
            )}

            <div className="filter-section">
              <label>Price Range (₹/month)</label>
              <div className="price-inputs">
                <input type="number" placeholder="Min" value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
                <span>–</span>
                <input type="number" placeholder="Max" value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
              </div>
            </div>

            <div className="filter-section">
              <label>Amenities</label>
              <div className="amenity-filters">
                {amenityOptions.map((a) => (
                  <label key={a} className={`amenity-toggle ${filters.amenities.includes(a) ? 'active' : ''}`}>
                    <input type="checkbox" checked={filters.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                    {a === 'wifi' ? '📶' : a === 'ac' ? '❄️' : a === 'meals' ? '🍽️' : a === 'parking' ? '🚗'
                      : a === 'laundry' ? '👕' : a === 'security' ? '🔒' : a === 'gym' ? '💪' : '🚿'}
                    {' '}{a.charAt(0).toUpperCase() + a.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <button className="apply-btn" onClick={applyFilters}>Apply Filters</button>
            <button className="clear-btn" onClick={() => {
              setFilters({ type: '', minPrice: '', maxPrice: '', radius: 5000, amenities: [], city: '' });
            }}>Clear All</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="search-main">
          <div className="search-header">
            <div>
              <h2>{loading ? 'Searching...' : `${total} PGs Found`}</h2>
              {userLocation && <p className="search-subtitle">Sorted by distance from your location</p>}
            </div>
            <button className="map-toggle" onClick={() => setShowMap(!showMap)}>
              {showMap ? '📋 List View' : '🗺️ Map View'}
            </button>
          </div>

          {/* No error box shown for geo errors — they surface naturally as 0 results */}

          {/* Map */}
          {showMap && (
            <div className="map-wrapper">
              <MapContainer center={mapCenter} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapRecenter center={mapCenter} />

                {userLocation && (
                  <>
                    <Marker position={userLocation} icon={userIcon}>
                      <Popup>📍 <strong>You are here</strong></Popup>
                    </Marker>
                    <Circle center={userLocation} radius={filters.radius}
                      pathOptions={{ color: '#6C63FF', fillColor: '#6C63FF', fillOpacity: 0.05 }} />
                  </>
                )}

                {pgs.map((pg) => (
                  <Marker
                    key={pg._id}
                    position={[pg.location.coordinates[1], pg.location.coordinates[0]]}
                    icon={pgIcon}
                  >
                    <Popup>
                      <div className="map-popup">
                        <strong>{pg.name}</strong><br />
                        <span className={`badge badge-${pg.type}`}>{pg.type}</span><br />
                        <span>₹{pg.price?.min?.toLocaleString()}/mo</span><br />
                        {pg.distance !== undefined && <span>📍 {pg.distance} km away</span>}<br />
                        <button onClick={() => navigate(`/pg/${pg._id}`)}>View Details →</button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {/* PG Grid */}
          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton-card"></div>)}
            </div>
          ) : pgs.length > 0 ? (
            <div className="search-pg-grid">
              {pgs.map((pg) => (
                <PGCard key={pg._id} pg={pg} showDistance={!!userLocation} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <span>🏠</span>
              <h3>No PGs Found</h3>
              <p>Try adjusting your filters or searching in a different area.</p>
              <button className="location-find-btn" onClick={requestLocation}>
                📍 Try with My Location
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Search;