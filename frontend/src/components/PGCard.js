import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PGCard.css';

const amenityIcons = {
  wifi: '📶', ac: '❄️', parking: '🚗', laundry: '👕',
  meals: '🍽️', security: '🔒', powerBackup: '⚡', gym: '💪',
  cctv: '📷', hotWater: '🚿',
};

const PGCard = ({ pg, showDistance = false }) => {
  const { user, savePG } = useAuth();
  const isSaved = user?.savedPGs?.includes(pg._id);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    try { await savePG(pg._id); } catch (err) {}
  };

  const activeAmenities = Object.entries(pg.amenities || {})
    .filter(([, v]) => v)
    .slice(0, 4);

  return (
    <Link to={`/pg/${pg._id}`} className="pg-card">
      <div className="pg-card-image">
        <div className="pg-image-placeholder">
          <span>🏠</span>
          <p>{pg.name}</p>
        </div>
        <div className="pg-badges">
          <span className={`badge badge-${pg.type}`}>
            {pg.type === 'boys' ? '👦 Boys' : pg.type === 'girls' ? '👧 Girls' : '👥 Co-ed'}
          </span>
          {pg.isVerified && <span className="badge badge-verified">✓ Verified</span>}
        </div>
        {user && (
          <button className={`save-btn ${isSaved ? 'saved' : ''}`} onClick={handleSave} title={isSaved ? 'Unsave' : 'Save'}>
            {isSaved ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      <div className="pg-card-body">
        <div className="pg-card-header">
          <h3 className="pg-name">{pg.name}</h3>
          {showDistance && pg.distance !== undefined && (
            <span className="pg-distance">📍 {pg.distance} km</span>
          )}
        </div>

        <p className="pg-address">
          📍 {pg.address?.area}, {pg.address?.city}
        </p>

        <div className="pg-rating">
          {'★'.repeat(Math.round(pg.rating || 0))}{'☆'.repeat(5 - Math.round(pg.rating || 0))}
          <span>{pg.rating?.toFixed(1) || '0.0'}</span>
          <span className="reviews-count">({pg.totalReviews || 0})</span>
        </div>

        <div className="pg-amenities">
          {activeAmenities.map(([key]) => (
            <span key={key} className="amenity-chip" title={key}>
              {amenityIcons[key]}
            </span>
          ))}
        </div>

        <div className="pg-footer">
          <div className="pg-price">
            <span className="price-label">Starts from</span>
            <span className="price-value">₹{pg.price?.min?.toLocaleString()}</span>
            <span className="price-per">/month</span>
          </div>
          <span className="view-btn">View Details →</span>
        </div>
      </div>
    </Link>
  );
};

export default PGCard;
