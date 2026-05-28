import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password, form.phone, form.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">🏠 PGFinder</div>
          <h1>Create Account</h1>
          <p className="auth-sub">Join thousands of students finding great PGs</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Your full name" value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@email.com" value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min 6 characters" value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})} required minLength="6" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="10-digit mobile number" value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>I am a...</label>
              <div className="role-select">
                <label className={`role-option ${form.role === 'student' ? 'active' : ''}`}>
                  <input type="radio" value="student" checked={form.role === 'student'}
                    onChange={(e) => setForm({...form, role: e.target.value})} />
                  <span className="role-icon">👨‍🎓</span>
                  <span>Student / Tenant</span>
                </label>
                <label className={`role-option ${form.role === 'owner' ? 'active' : ''}`}>
                  <input type="radio" value="owner" checked={form.role === 'owner'}
                    onChange={(e) => setForm({...form, role: e.target.value})} />
                  <span className="role-icon">🏠</span>
                  <span>PG Owner</span>
                </label>
              </div>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
