import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

const links = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/processing', label: 'Order Processing', icon: '⚡' },
  { to: '/admin/walkin-orders', label: 'Walk-in Orders', icon: '🏪' },
  { to: '/admin/customers', label: 'Customers', icon: '👥' },
  { to: '/admin/services', label: 'Services', icon: '🧺' },
  { to: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { to: '/admin/franchise-leads', label: 'Franchise Leads', icon: '💼' }
];

export default function Sidebar({ open, onClose }) {
  const { logout } = useAdminAuth();

  return (
    <aside className={`admin-sidebar ${open ? 'mobile-visible' : ''}`}>
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__brand-logo">
          <img src="/logo.png" alt="MrWashWala Logo" style={{ width: '48px', height: 'auto', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>Admin Dashboard</h1>
        </div>
      </div>

      <div className="admin-sidebar__section-title">Navigation</div>
      <nav className="admin-sidebar__menu">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) =>
              `admin-sidebar__link${isActive ? ' active' : ''}`
            }
            onClick={onClose}
          >
            <span className="admin-sidebar__link-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__section-title">Session</div>
        <button
          type="button"
          className="admin-button admin-button--secondary"
          onClick={logout}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
