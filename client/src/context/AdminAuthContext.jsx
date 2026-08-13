import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import API from '../api/api';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('mrwashwala_admin_token');
  });

  const [user, setUser] = useState(() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      return { email: payload.email, role: payload.role };
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      API.defaults.headers.common.Authorization = `Bearer ${token}`;
      window.localStorage.setItem('mrwashwala_admin_token', token);
      try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        setUser({ email: payload.email, role: payload.role });
      } catch {
        setUser(null);
      }
    } else {
      delete API.defaults.headers.common.Authorization;
      window.localStorage.removeItem('mrwashwala_admin_token');
      setUser(null);
    }
  }, [token]);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await API.post('/api/auth/login', { email, password });
      if (response?.data?.token) {
        setToken(response.data.token);
      }
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, loading, login, logout, isAuthenticated: Boolean(token) }),
    [token, user, loading]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
