import React from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import { useAdminBranch } from '../../context/AdminBranchContext.jsx';

export default function TopNavbar({ onOpenSidebar }) {
  const { user } = useAdminAuth();
  const { selectedBranchId, availableBranches, setSelectedBranchId } = useAdminBranch();

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <button
          className="admin-toggle-sidebar"
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open sidebar navigation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="admin-header__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="search" placeholder="Search orders, customers, services…" aria-label="Search dashboard" />
        </div>
      </div>
      <div className="admin-header__actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.85rem' }} aria-hidden="true">📍</span>
          <select
            className="admin-select admin-branch-select"
            value={selectedBranchId}
            onChange={(event) => setSelectedBranchId(event.target.value)}
            aria-label="Select branch filter"
          >
            {availableBranches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.shortName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
