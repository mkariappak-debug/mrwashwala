import React, { useEffect, useState } from 'react';
import API from '../../api/api';
import { useAdminBranch } from '../../context/AdminBranchContext.jsx';

export default function AdminDashboard() {
  const { selectedBranchId } = useAdminBranch();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const params = {};
        if (selectedBranchId && selectedBranchId !== 'all') params.branch = selectedBranchId;
        const response = await API.get('/api/admin/dashboard', { params });
        setStats(response.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [selectedBranchId]);

  if (loading) {
    return <div className="admin-empty-state">Loading dashboard stats…</div>;
  }

  if (error) {
    return <div className="admin-empty-state">{error}</div>;
  }

  return (
    <div className="admin-section">
      <div className="admin-grid admin-grid--4">
        <div className="admin-card">
          <div className="admin-card__title">Total Orders</div>
          <div className="admin-card__value">{stats.totalOrders}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card__title">Pending Orders</div>
          <div className="admin-card__value">{stats.pendingOrders}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card__title">Monthly Revenue</div>
          <div className="admin-card__value">₹{stats.monthlyRevenue.toLocaleString()}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card__title">Franchise Leads</div>
          <div className="admin-card__value">{stats.franchiseLeads}</div>
        </div>
      </div>

      <div className="admin-grid admin-grid--4" style={{ marginTop: 20 }}>
        <div className="admin-card">
          <div className="admin-card__title">Today's Orders</div>
          <div className="admin-card__value">{stats.todaysOrders}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card__title">Walk-in Orders</div>
          <div className="admin-card__value">{stats.totalWalkInOrders}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card__title">Walk-in Revenue</div>
          <div className="admin-card__value">₹{stats.walkInMonthlyRevenue.toLocaleString()}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card__title">Website Order Revenue</div>
          <div className="admin-card__value">₹{stats.websiteOrderRevenue.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
