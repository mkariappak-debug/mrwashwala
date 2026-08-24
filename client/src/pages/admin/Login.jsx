import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import '../../styles/admin-login.css';
import desktopVideo from '../../assets/background-video.mp4';
import mobileVideo from '../../assets/mobile-background-video.mp4';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="admin-login-container">
      <div className="admin-login-video-wrapper">
        <video 
          className="admin-login-video"
          src={isMobile ? mobileVideo : desktopVideo}
          autoPlay 
          loop 
          muted 
          playsInline
        />
        <div className="admin-login-overlay" />
      </div>

      <div className="admin-login-card-wrapper">
        <div className="admin-login-glass-card">
          <div className="admin-login-header-group">
            <h1>Admin Login</h1>
            <p>Secure access to the Mr. WashWala dashboard.</p>
          </div>

          <form className="admin-login-glass-form" onSubmit={handleSubmit} autoComplete="off">
            <label className="admin-login-field-group">
              <span>Email</span>
              <input
                className="admin-login-glass-input"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="admin@mrwashwala.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="admin-login-field-group">
              <span>Password</span>
              <input
                className="admin-login-glass-input"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {error && <div className="admin-login-error-msg">{error}</div>}

            <button className="admin-login-glass-button" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
