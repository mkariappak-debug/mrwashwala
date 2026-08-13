import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { branches } from '../config/branches';

const AdminBranchContext = createContext(null);
const LOCAL_STORAGE_KEY = 'mrwashwala_admin_branch';
const ALL_BRANCHES_ID = 'all';

export const AdminBranchProvider = ({ children }) => {
  const [selectedBranchId, setSelectedBranchId] = useState(() => {
    if (typeof window === 'undefined') return ALL_BRANCHES_ID;
    return window.localStorage.getItem(LOCAL_STORAGE_KEY) || ALL_BRANCHES_ID;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, selectedBranchId);
    }
  }, [selectedBranchId]);

  const selectedBranch = useMemo(() => {
    if (selectedBranchId === ALL_BRANCHES_ID) return null;
    return branches.find((branch) => branch.id === selectedBranchId) || null;
  }, [selectedBranchId]);

  const availableBranches = useMemo(
    () => [
      { id: ALL_BRANCHES_ID, shortName: 'All Branches', name: 'All Branches' },
      ...branches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        shortName: branch.shortName || branch.name
      }))
    ],
    []
  );

  const value = useMemo(
    () => ({ selectedBranchId, selectedBranch, setSelectedBranchId, availableBranches }),
    [selectedBranchId, selectedBranch, availableBranches]
  );

  return <AdminBranchContext.Provider value={value}>{children}</AdminBranchContext.Provider>;
};

export const useAdminBranch = () => {
  const context = useContext(AdminBranchContext);
  if (!context) {
    throw new Error('useAdminBranch must be used within AdminBranchProvider');
  }
  return context;
};
