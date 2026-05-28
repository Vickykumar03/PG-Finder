import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pgfinder_token');
    const savedUser = localStorage.getItem('pgfinder_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    const { token, ...userData } = res.data.data;
    localStorage.setItem('pgfinder_token', token);
    localStorage.setItem('pgfinder_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, phone, role) => {
    const res = await axios.post(`${API}/auth/register`, { name, email, password, phone, role });
    const { token, ...userData } = res.data.data;
    localStorage.setItem('pgfinder_token', token);
    localStorage.setItem('pgfinder_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('pgfinder_token');
    localStorage.removeItem('pgfinder_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const savePG = async (pgId) => {
    const res = await axios.put(`${API}/auth/save-pg/${pgId}`);
    const updatedUser = { ...user };
    if (res.data.saved) {
      updatedUser.savedPGs = [...(user.savedPGs || []), pgId];
    } else {
      updatedUser.savedPGs = (user.savedPGs || []).filter((id) => id !== pgId);
    }
    setUser(updatedUser);
    localStorage.setItem('pgfinder_user', JSON.stringify(updatedUser));
    return res.data.saved;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, savePG, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
