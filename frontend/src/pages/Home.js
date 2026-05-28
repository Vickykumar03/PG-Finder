import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PGCard from '../components/PGCard';
import './Home.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [featuredPGs, setFeaturedPGs] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await axios.get(`${API}/pgs?limit=6`);
      setFeaturedPGs(res.data.data);
    } catch (err) {}
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?city=${city}`);
  };

  const handleNearbySearch = () => {
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationLoading(false);
        navigate(`/search?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&nearby=true`);
      },
      (err) => {
        setLocationLoading(false);
        setLocationError('Location access denied. Please enable location in your browser.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1"></div>
          <div className="hero-orb orb-2"></div>
          <div className="hero-orb orb-3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">🎓 Trusted by 10,000+ students</div>
          <h1 className="hero-title">
            Find Your Perfect<br />
            <span className="hero-highlight">PG Stay</span> Nearby
          </h1>
          <p className="hero-sub">
            Discover verified PGs, hostels, and shared rooms near your college or workplace.
            Real locations, real reviews, real homes.
          </p>

          <div className="hero-search-card">
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-wrap">
                <span>🏙️</span>
                <input
                  type="text"
                  placeholder="Search by city, area, or college..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary search-btn">Search PGs</button>
            </form>

            <div className="search-divider"><span>or</span></div>

            <button
              className="location-btn"
              onClick={handleNearbySearch}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <><span className="loc-spinner"></span> Getting your location...</>
              ) : (
                <><span>📍</span> Find PGs Near My Location</>
              )}
            </button>
            {locationError && <p className="location-error">{locationError}</p>}
          </div>

          <div className="hero-stats">
            <div className="stat"><span>500+</span><p>Verified PGs</p></div>
            <div className="stat-divider"></div>
            <div className="stat"><span>50+</span><p>Cities</p></div>
            <div className="stat-divider"></div>
            <div className="stat"><span>10K+</span><p>Happy Students</p></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose <span>PGFinder</span>?</h2>
          <div className="features-grid">
            {[
              { icon: '📍', title: 'Live Location Search', desc: 'Find PGs within walking distance using your real-time GPS location.' },
              { icon: '✅', title: 'Verified Listings', desc: 'All PGs are verified by our team. No fake listings, no surprises.' },
              { icon: '💰', title: 'Best Prices', desc: 'Compare prices across hundreds of PGs. Find the best deal in your budget.' },
              { icon: '⭐', title: 'Real Reviews', desc: 'Read genuine reviews from students who actually stayed there.' },
              { icon: '🔒', title: 'Safe & Secure', desc: 'CCTV, security guards – filter by safety features that matter to you.' },
              { icon: '🍽️', title: 'Meals Included', desc: 'Filter by meal availability. Home-cooked food, no more instant noodles.' },
            ].map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured PGs */}
      {featuredPGs.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Recently Listed PGs</h2>
              <button className="btn-outline" onClick={() => navigate('/search')}>View All →</button>
            </div>
            <div className="pg-grid">
              {featuredPGs.map((pg) => (
                <PGCard key={pg._id} pg={pg} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Own a PG? List it for FREE!</h2>
            <p>Reach thousands of students looking for PGs in your area. Verified listings get 3x more inquiries.</p>
            <button className="btn-primary" onClick={() => navigate('/register')}>List Your PG →</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-brand">
            <span className="logo-icon">🏠</span>
            <span>PG<span style={{color: 'var(--primary)'}}>Finder</span></span>
          </div>
          <p>© 2024 PGFinder. Making student life easier, one PG at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
