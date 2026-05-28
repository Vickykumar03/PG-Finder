import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import './PGDetail.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const amenityLabels = {
  wifi: ['📶', 'WiFi'], ac: ['❄️', 'Air Conditioning'], parking: ['🚗', 'Parking'],
  laundry: ['👕', 'Laundry'], meals: ['🍽️', 'Meals Included'], security: ['🔒', 'Security Guard'],
  powerBackup: ['⚡', 'Power Backup'], gym: ['💪', 'Gym'], cctv: ['📷', 'CCTV'], hotWater: ['🚿', 'Hot Water'],
};

const PGDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, savePG } = useAuth();
  const [pg, setPG] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchPG = async () => {
      try {
        const res = await axios.get(`${API}/pgs/${id}`);
        setPG(res.data.data);
        if (user) setIsSaved(user.savedPGs?.includes(id));
      } catch (err) {
        navigate('/search');
      } finally {
        setLoading(false);
      }
    };
    fetchPG();
  }, [id, user]);

  const handleSave = async () => {
    if (!user) return navigate('/login');
    try {
      const saved = await savePG(pg._id);
      setIsSaved(saved);
    } catch (err) {}
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmitting(true);
    setReviewError('');
    try {
      const res = await axios.post(`${API}/pgs/${id}/reviews`, review);
      setPG(res.data.data);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-wrapper"><div className="spinner"></div></div>;
  if (!pg) return null;

  const [lng, lat] = pg.location.coordinates;
  const activeAmenities = Object.entries(pg.amenities || {}).filter(([, v]) => v);

  return (
    <div className="pg-detail page-wrapper">
      <div className="container">
        {/* Back */}
        <button className="back-btn" onClick={() => navigate(-1)}>← Back to Search</button>

        {/* Header */}
        <div className="detail-header">
          <div className="detail-title-section">
            <div className="detail-badges">
              <span className={`badge badge-${pg.type}`}>
                {pg.type === 'boys' ? '👦 Boys' : pg.type === 'girls' ? '👧 Girls' : '👥 Co-ed'}
              </span>
              {pg.isVerified && <span className="badge badge-verified">✓ Verified</span>}
            </div>
            <h1 className="detail-name">{pg.name}</h1>
            <p className="detail-address">📍 {pg.address?.street}, {pg.address?.area}, {pg.address?.city} - {pg.address?.pincode}</p>
            <div className="detail-rating">
              <span className="stars">{'★'.repeat(Math.round(pg.rating))}{'☆'.repeat(5 - Math.round(pg.rating))}</span>
              <span className="rating-num">{pg.rating?.toFixed(1)}</span>
              <span className="rating-count">({pg.totalReviews} reviews)</span>
            </div>
          </div>
          <div className="detail-price-box">
            <p>Starting from</p>
            <span className="big-price">₹{pg.price?.min?.toLocaleString()}</span>
            <span>/month</span>
            <p className="price-range">₹{pg.price?.min?.toLocaleString()} – ₹{pg.price?.max?.toLocaleString()}</p>
            <button className="btn-primary contact-btn" onClick={() => window.open(`tel:${pg.contactPhone}`)}>
              📞 Call Owner
            </button>
            <button className={`save-detail-btn ${isSaved ? 'saved' : ''}`} onClick={handleSave}>
              {isSaved ? '❤️ Saved' : '🤍 Save PG'}
            </button>
          </div>
        </div>

        {/* Image Placeholder */}
        <div className="detail-image-hero">
          <span>🏠</span>
          <h2>{pg.name}</h2>
          <p>{pg.address?.area}, {pg.address?.city}</p>
        </div>

        <div className="detail-grid">
          {/* Left column */}
          <div>
            {/* Description */}
            <section className="detail-section">
              <h2>About this PG</h2>
              <p className="description-text">{pg.description}</p>
            </section>

            {/* Room Types */}
            {pg.roomTypes?.length > 0 && (
              <section className="detail-section">
                <h2>Room Options</h2>
                <div className="room-types">
                  {pg.roomTypes.map((r, i) => (
                    <div key={i} className={`room-card ${!r.available ? 'unavailable' : ''}`}>
                      <div className="room-header">
                        <span className="room-type">{r.type?.charAt(0).toUpperCase() + r.type?.slice(1)} Room</span>
                        {!r.available && <span className="full-badge">Full</span>}
                      </div>
                      <div className="room-price">₹{r.price?.toLocaleString()}<span>/mo</span></div>
                      <div className="room-amenities">
                        {r.amenities?.map((a) => <span key={a} className="room-amenity">{a}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Amenities */}
            <section className="detail-section">
              <h2>Amenities</h2>
              <div className="amenities-grid">
                {activeAmenities.map(([key]) => (
                  <div key={key} className="amenity-item">
                    <span className="amenity-icon">{amenityLabels[key]?.[0]}</span>
                    <span>{amenityLabels[key]?.[1] || key}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Nearby Places */}
            {pg.nearbyPlaces?.length > 0 && (
              <section className="detail-section">
                <h2>Nearby Places</h2>
                <div className="nearby-list">
                  {pg.nearbyPlaces.map((place, i) => (
                    <div key={i} className="nearby-item">
                      <span className="nearby-type">{place.type === 'college' ? '🎓' : place.type === 'hospital' ? '🏥' : place.type === 'market' ? '🛒' : place.type === 'mall' ? '🏬' : '📍'}</span>
                      <span className="nearby-name">{place.name}</span>
                      <span className="nearby-dist">{place.distance}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Rules */}
            {pg.rules?.length > 0 && (
              <section className="detail-section">
                <h2>PG Rules</h2>
                <ul className="rules-list">
                  {pg.rules.map((r, i) => <li key={i}>📌 {r}</li>)}
                </ul>
              </section>
            )}

            {/* Reviews */}
            <section className="detail-section">
              <h2>Reviews ({pg.totalReviews})</h2>
              {pg.reviews?.slice(-5).reverse().map((r, i) => (
                <div key={i} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-avatar">{r.userName?.[0]}</div>
                    <div>
                      <strong>{r.userName}</strong>
                      <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    </div>
                    <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="review-comment">{r.comment}</p>}
                </div>
              ))}

              {user && (
                <form className="review-form" onSubmit={handleReview}>
                  <h3>Write a Review</h3>
                  <div className="star-select">
                    {[1,2,3,4,5].map((s) => (
                      <button type="button" key={s} onClick={() => setReview({...review, rating: s})}
                        className={s <= review.rating ? 'star active' : 'star'}>★</button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Share your experience..."
                    value={review.comment}
                    onChange={(e) => setReview({...review, comment: e.target.value})}
                    rows="3"
                  />
                  {reviewError && <p className="review-error">{reviewError}</p>}
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </section>
          </div>

          {/* Right column - Map + Contact */}
          <div>
            <section className="detail-section sticky-map">
              <h2>Location on Map</h2>
              <MapContainer center={[lat, lng]} zoom={15} style={{ height: '300px', width: '100%', borderRadius: '12px' }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]}>
                  <Popup><strong>{pg.name}</strong><br />{pg.address?.area}</Popup>
                </Marker>
              </MapContainer>
            </section>

            <section className="detail-section contact-section">
              <h2>Contact Owner</h2>
              <div className="owner-info">
                <div className="owner-avatar">{pg.owner?.name?.[0]}</div>
                <div>
                  <p className="owner-name">{pg.owner?.name}</p>
                  <p className="owner-sub">PG Owner</p>
                </div>
              </div>
              <div className="contact-details">
                <a href={`tel:${pg.contactPhone}`} className="contact-item">
                  <span>📞</span> {pg.contactPhone}
                </a>
                {pg.contactEmail && (
                  <a href={`mailto:${pg.contactEmail}`} className="contact-item">
                    <span>✉️</span> {pg.contactEmail}
                  </a>
                )}
              </div>
              <button className="btn-primary full-width-btn" onClick={() => window.open(`tel:${pg.contactPhone}`)}>
                📞 Call Now
              </button>
              <button className="btn-outline full-width-btn" onClick={() => window.open(`https://wa.me/91${pg.contactPhone}`)}>
                💬 WhatsApp
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PGDetail;
