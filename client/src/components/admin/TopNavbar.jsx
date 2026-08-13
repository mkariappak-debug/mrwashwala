import React from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import { useAdminBranch } from '../../context/AdminBranchContext.jsx';

export default function TopNavbar({ onOpenSidebar }) {
  const { user } = useAdminAuth();
  const { selectedBranchId, availableBranches, setSelectedBranchId } = useAdminBranch();

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <button className="admin-toggle-sidebar" type="button" onClick={onOpenSidebar}>
          ☰
        </button>
        <div className="admin-header__search">
          <span>🔍</span>
          <input type="search" placeholder="Search dashboard…" aria-label="Search dashboard" />
        </div>
      </div>
      <div className="admin-header__actions">
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
    </header>
  );
}
