import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PGCard from '../components/PGCard';
import './Dashboard.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myPGs, setMyPGs] = useState([]);
  const [savedPGs, setSavedPGs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(user?.role === 'owner' ? 'myPGs' : 'saved');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (user?.role === 'owner') {
        const res = await axios.get(`${API}/pgs/owner/my-pgs`);
        setMyPGs(res.data.data);
      }
      const meRes = await axios.get(`${API}/auth/me`);
      setSavedPGs(meRes.data.data.savedPGs || []);
    } catch (err) {}
    finally { setLoading(false); }
  };

  const handleDelete = async (pgId) => {
    if (!window.confirm('Delete this PG listing?')) return;
    try {
      await axios.delete(`${API}/pgs/${pgId}`);
      setMyPGs(myPGs.filter((p) => p._id !== pgId));
    } catch (err) {}
  };

  return (
    <div className="dashboard page-wrapper">
      <div className="container">
        {/* Profile Header */}
        <div className="dash-header">
          <div className="dash-profile">
            <div className="dash-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <h1>{user?.name}</h1>
              <p>{user?.email}</p>
              <span className={`role-badge ${user?.role}`}>
                {user?.role === 'owner' ? '🏠 PG Owner' : '👨‍🎓 Student'}
              </span>
            </div>
          </div>
          <div className="dash-actions">
            {user?.role === 'owner' && (
              <button className="btn-primary" onClick={() => navigate('/add-pg')}>+ List New PG</button>
            )}
            <button className="btn-outline" onClick={() => navigate('/search')}>Browse PGs</button>
          </div>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          {user?.role === 'owner' && (
            <>
              <div className="stat-box">
                <span>{myPGs.length}</span>
                <p>Total Listings</p>
              </div>
              <div className="stat-box">
                <span>{myPGs.filter((p) => p.isAvailable).length}</span>
                <p>Available</p>
              </div>
              <div className="stat-box">
                <span>{myPGs.filter((p) => p.isVerified).length}</span>
                <p>Verified</p>
              </div>
            </>
          )}
          <div className="stat-box">
            <span>{savedPGs.length}</span>
            <p>Saved PGs</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          {user?.role === 'owner' && (
            <button className={`tab ${activeTab === 'myPGs' ? 'active' : ''}`} onClick={() => setActiveTab('myPGs')}>
              🏠 My Listings
            </button>
          )}
          <button className={`tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
            ❤️ Saved PGs
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="spinner"></div>
        ) : activeTab === 'myPGs' ? (
          <div>
            {myPGs.length === 0 ? (
              <div className="empty-state">
                <span>🏠</span>
                <h3>No Listings Yet</h3>
                <p>Start by listing your PG and reach thousands of students.</p>
                <button className="btn-primary" onClick={() => navigate('/add-pg')}>List Your PG</button>
              </div>
            ) : (
              <div className="owner-pg-list">
                {myPGs.map((pg) => (
                  <div key={pg._id} className="owner-pg-item">
                    <div className="owner-pg-info">
                      <span className={`badge badge-${pg.type}`}>{pg.type}</span>
                      <h3>{pg.name}</h3>
                      <p>📍 {pg.address?.area}, {pg.address?.city}</p>
                      <p>₹{pg.price?.min?.toLocaleString()} – ₹{pg.price?.max?.toLocaleString()}/mo</p>
                      <div className="pg-status">
                        <span className={pg.isAvailable ? 'status-available' : 'status-full'}>
                          {pg.isAvailable ? '✅ Available' : '❌ Full'}
                        </span>
                        <span className={pg.isVerified ? 'status-verified' : 'status-pending'}>
                          {pg.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                        </span>
                      </div>
                    </div>
                    <div className="owner-pg-actions">
                      <button onClick={() => navigate(`/pg/${pg._id}`)}>👁️ View</button>
                      <button onClick={() => handleDelete(pg._id)} className="delete-btn">🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {savedPGs.length === 0 ? (
              <div className="empty-state">
                <span>❤️</span>
                <h3>No Saved PGs</h3>
                <p>Browse PGs and save your favorites for easy access.</p>
                <button className="btn-primary" onClick={() => navigate('/search')}>Browse PGs</button>
              </div>
            ) : (
              <div className="pg-grid">
                {savedPGs.map((pg) => <PGCard key={pg._id || pg} pg={pg} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
