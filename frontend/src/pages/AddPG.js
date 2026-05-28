import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddPG.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const STEPS = ['Basic Info', 'Location', 'Rooms & Pricing', 'Amenities', 'Rules & Contact'];

const AddPG = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'boys',
    address: { street: '', area: '', city: '', state: '', pincode: '' },
    location: { type: 'Point', coordinates: [77.4126, 23.2599] },
    price: { min: '', max: '' },
    roomTypes: [{ type: 'single', price: '', available: true, amenities: [] }],
    amenities: {
      wifi: false, ac: false, parking: false, laundry: false,
      meals: false, security: false, powerBackup: false, gym: false,
      cctv: false, hotWater: false,
    },
    nearbyPlaces: [{ name: '', type: 'college', distance: '' }],
    rules: [''],
    contactPhone: '',
    contactEmail: '',
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const setAddr = (field, value) => setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));
  const setPrice = (field, value) => setForm((prev) => ({ ...prev, price: { ...prev.price, [field]: value } }));
  const toggleAmenity = (key) => setForm((prev) => ({ ...prev, amenities: { ...prev.amenities, [key]: !prev.amenities[key] } }));

  const detectLocation = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          location: { type: 'Point', coordinates: [pos.coords.longitude, pos.coords.latitude] },
        }));
        setGeoLoading(false);
      },
      () => { setGeoLoading(false); setError('Could not detect location.'); },
      { enableHighAccuracy: true }
    );
  };

  const addRoom = () => setForm((prev) => ({
    ...prev,
    roomTypes: [...prev.roomTypes, { type: 'single', price: '', available: true, amenities: [] }],
  }));

  const updateRoom = (i, field, value) => {
    const rooms = [...form.roomTypes];
    rooms[i] = { ...rooms[i], [field]: value };
    setForm((prev) => ({ ...prev, roomTypes: rooms }));
  };

  const removeRoom = (i) => setForm((prev) => ({ ...prev, roomTypes: prev.roomTypes.filter((_, idx) => idx !== i) }));

  const addNearby = () => setForm((prev) => ({ ...prev, nearbyPlaces: [...prev.nearbyPlaces, { name: '', type: 'college', distance: '' }] }));
  const updateNearby = (i, field, value) => {
    const places = [...form.nearbyPlaces];
    places[i] = { ...places[i], [field]: value };
    setForm((prev) => ({ ...prev, nearbyPlaces: places }));
  };

  const updateRule = (i, value) => {
    const rules = [...form.rules];
    rules[i] = value;
    setForm((prev) => ({ ...prev, rules }));
  };

  const addRule = () => setForm((prev) => ({ ...prev, rules: [...prev.rules, ''] }));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: { min: Number(form.price.min), max: Number(form.price.max) },
        roomTypes: form.roomTypes.map((r) => ({ ...r, price: Number(r.price) })),
        rules: form.rules.filter((r) => r.trim()),
        nearbyPlaces: form.nearbyPlaces.filter((p) => p.name.trim()),
      };
      await axios.post(`${API}/pgs`, payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  const amenityList = [
    ['wifi', '📶', 'WiFi'], ['ac', '❄️', 'Air Conditioning'], ['meals', '🍽️', 'Meals'],
    ['parking', '🚗', 'Parking'], ['laundry', '👕', 'Laundry'], ['security', '🔒', 'Security'],
    ['powerBackup', '⚡', 'Power Backup'], ['gym', '💪', 'Gym'],
    ['cctv', '📷', 'CCTV'], ['hotWater', '🚿', 'Hot Water'],
  ];

  return (
    <div className="add-pg page-wrapper">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        <h1 className="add-pg-title">List Your PG</h1>
        <p className="add-pg-sub">Fill in the details to list your PG and reach thousands of students</p>

        {/* Step Indicator */}
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => i < step && setStep(i)}>
              <div className="step-circle">{i < step ? '✓' : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-card">
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="form-step">
              <h2>Basic Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>PG Name *</label>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Sunrise Boys PG" />
                </div>
                <div className="form-group">
                  <label>PG Type *</label>
                  <select value={form.type} onChange={(e) => set('type', e.target.value)}>
                    <option value="boys">Boys Only</option>
                    <option value="girls">Girls Only</option>
                    <option value="coed">Co-ed</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                  placeholder="Describe your PG – location highlights, facilities, target tenants..." rows="4" />
              </div>
            </div>
          )}

          {/* Step 1: Location */}
          {step === 1 && (
            <div className="form-step">
              <h2>Address & Location</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Street Address *</label>
                  <input value={form.address.street} onChange={(e) => setAddr('street', e.target.value)} placeholder="e.g. 12 Polytechnic Square" />
                </div>
                <div className="form-group">
                  <label>Area / Locality *</label>
                  <input value={form.address.area} onChange={(e) => setAddr('area', e.target.value)} placeholder="e.g. Awadhpuri" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input value={form.address.city} onChange={(e) => setAddr('city', e.target.value)} placeholder="e.g. Bhopal" />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input value={form.address.state} onChange={(e) => setAddr('state', e.target.value)} placeholder="e.g. Madhya Pradesh" />
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input value={form.address.pincode} onChange={(e) => setAddr('pincode', e.target.value)} placeholder="462026" />
                </div>
              </div>

              <div className="geo-section">
                <h3>GPS Coordinates *</h3>
                <p className="geo-hint">These coordinates power the "Find Nearby" feature. Use your current location or enter manually.</p>
                <div className="form-row">
                  <div className="form-group">
                    <label>Longitude</label>
                    <input type="number" step="any"
                      value={form.location.coordinates[0]}
                      onChange={(e) => set('location', { type: 'Point', coordinates: [parseFloat(e.target.value), form.location.coordinates[1]] })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Latitude</label>
                    <input type="number" step="any"
                      value={form.location.coordinates[1]}
                      onChange={(e) => set('location', { type: 'Point', coordinates: [form.location.coordinates[0], parseFloat(e.target.value)] })}
                    />
                  </div>
                </div>
                <button className="geo-btn" onClick={detectLocation} disabled={geoLoading}>
                  {geoLoading ? '⏳ Detecting...' : '📍 Auto-detect My Location'}
                </button>
                {form.location.coordinates[0] && (
                  <div className="geo-success">
                    ✅ Coordinates set: [{form.location.coordinates[1].toFixed(4)}, {form.location.coordinates[0].toFixed(4)}]
                  </div>
                )}
              </div>

              <div className="nearby-section">
                <h3>Nearby Places <span>(optional)</span></h3>
                {form.nearbyPlaces.map((p, i) => (
                  <div key={i} className="form-row nearby-row">
                    <div className="form-group">
                      <input value={p.name} onChange={(e) => updateNearby(i, 'name', e.target.value)} placeholder="Place name (e.g. MANIT Bhopal)" />
                    </div>
                    <div className="form-group">
                      <select value={p.type} onChange={(e) => updateNearby(i, 'type', e.target.value)}>
                        <option value="college">College</option>
                        <option value="hospital">Hospital</option>
                        <option value="market">Market</option>
                        <option value="mall">Mall</option>
                        <option value="transport">Transport</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <input value={p.distance} onChange={(e) => updateNearby(i, 'distance', e.target.value)} placeholder="Distance (e.g. 0.5 km)" />
                    </div>
                  </div>
                ))}
                <button className="add-more-btn" onClick={addNearby}>+ Add Place</button>
              </div>
            </div>
          )}

          {/* Step 2: Rooms & Pricing */}
          {step === 2 && (
            <div className="form-step">
              <h2>Rooms & Pricing</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Rent (₹/month) *</label>
                  <input type="number" value={form.price.min} onChange={(e) => setPrice('min', e.target.value)} placeholder="4000" />
                </div>
                <div className="form-group">
                  <label>Maximum Rent (₹/month) *</label>
                  <input type="number" value={form.price.max} onChange={(e) => setPrice('max', e.target.value)} placeholder="10000" />
                </div>
              </div>

              <h3 className="rooms-title">Room Types</h3>
              {form.roomTypes.map((room, i) => (
                <div key={i} className="room-form-card">
                  <div className="room-form-header">
                    <h4>Room {i + 1}</h4>
                    {i > 0 && <button className="remove-btn" onClick={() => removeRoom(i)}>✕ Remove</button>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Room Type</label>
                      <select value={room.type} onChange={(e) => updateRoom(i, 'type', e.target.value)}>
                        <option value="single">Single</option>
                        <option value="double">Double Sharing</option>
                        <option value="triple">Triple Sharing</option>
                        <option value="dormitory">Dormitory</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price (₹/month)</label>
                      <input type="number" value={room.price} onChange={(e) => updateRoom(i, 'price', e.target.value)} placeholder="7000" />
                    </div>
                    <div className="form-group">
                      <label>Availability</label>
                      <select value={room.available} onChange={(e) => updateRoom(i, 'available', e.target.value === 'true')}>
                        <option value="true">Available</option>
                        <option value="false">Full / Occupied</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Room Amenities (comma separated)</label>
                    <input
                      value={room.amenities?.join(', ')}
                      onChange={(e) => updateRoom(i, 'amenities', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                      placeholder="AC, Attached Bathroom, Study Table, Balcony"
                    />
                  </div>
                </div>
              ))}
              <button className="add-more-btn" onClick={addRoom}>+ Add Room Type</button>
            </div>
          )}

          {/* Step 3: Amenities */}
          {step === 3 && (
            <div className="form-step">
              <h2>Amenities & Facilities</h2>
              <p className="step-hint">Select all amenities available at your PG</p>
              <div className="amenities-select-grid">
                {amenityList.map(([key, icon, label]) => (
                  <label key={key} className={`amenity-select-item ${form.amenities[key] ? 'selected' : ''}`}>
                    <input type="checkbox" checked={form.amenities[key]} onChange={() => toggleAmenity(key)} />
                    <span className="amenity-select-icon">{icon}</span>
                    <span>{label}</span>
                    {form.amenities[key] && <span className="amenity-check">✓</span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Rules & Contact */}
          {step === 4 && (
            <div className="form-step">
              <h2>Rules & Contact</h2>

              <div className="form-group">
                <label>Contact Phone *</label>
                <input value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} placeholder="10-digit mobile number" />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} placeholder="your@email.com" />
              </div>

              <h3 className="rules-heading">PG Rules <span>(optional)</span></h3>
              {form.rules.map((rule, i) => (
                <div key={i} className="rule-row">
                  <input value={rule} onChange={(e) => updateRule(i, e.target.value)} placeholder={`Rule ${i + 1}: e.g. No smoking inside`} />
                </div>
              ))}
              <button className="add-more-btn" onClick={addRule}>+ Add Rule</button>

              <div className="submit-section">
                <div className="submit-preview">
                  <h3>Ready to publish?</h3>
                  <p>Your PG <strong>{form.name}</strong> in <strong>{form.address?.city}</strong> will be listed immediately.</p>
                </div>
                <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                  {loading ? '⏳ Publishing...' : '🚀 Publish PG Listing'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="step-nav">
          <button className="nav-btn prev" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            ← Previous
          </button>
          <span className="step-count">Step {step + 1} of {STEPS.length}</span>
          {step < STEPS.length - 1 && (
            <button className="nav-btn next" onClick={() => setStep((s) => s + 1)}>
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPG;
