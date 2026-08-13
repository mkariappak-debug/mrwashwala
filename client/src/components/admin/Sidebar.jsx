import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

const links = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/walkin-orders', label: 'Walk-in Orders' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/franchise-leads', label: 'Franchise Leads' }
];

export default function Sidebar({ open, onClose }) {
  const { logout } = useAdminAuth();

  return (
    <aside className={`admin-sidebar ${open ? 'mobile-visible' : ''}`}>
      <div className="admin-sidebar__brand">
        <span className="admin-badge">MrWashWala</span>
      </div>

      <div className="admin-sidebar__section-title">Navigation</div>
      <div className="admin-sidebar__menu">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `admin-sidebar__link${isActive ? ' active' : ''}`
            }
            onClick={onClose}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="admin-sidebar__section-title">Account</div>
      <button type="button" className="admin-button" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
