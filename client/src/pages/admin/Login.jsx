import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    setPassword('');
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setPassword('');
      return;
    }

    navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const result = await login({ email, password });
      if (result?.token) {
        setPassword('');
        navigate(from, { replace: true });
      } else {
        setError(result?.message || 'Login failed');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div>
            <h1 className="admin-login-title">Admin Login</h1>
            <p className="admin-login-subtitle">Secure access to the Mr. WashWala dashboard.</p>
          </div>
        </div>

        <form className="admin-form admin-login-form" onSubmit={handleSubmit} autoComplete="off">
          <label className="admin-login-field">
            <span>Email</span>
            <input
              className="admin-input"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="admin@mrwashwala.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="admin-login-field">
            <span>Password</span>
            <input
              className="admin-input"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <div className="admin-login-error">{error}</div>}

          <button className="admin-button admin-login-actions" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
