import React, { useEffect, useMemo, useState } from 'react';
import API from '../../api/api';
import { useAdminBranch } from '../../context/AdminBranchContext.jsx';

export default function AdminCustomers() {
  const { selectedBranchId } = useAdminBranch();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedBranchId && selectedBranchId !== 'all') params.branch = selectedBranchId;
        const response = await API.get('/api/admin/customers', { params });
        setCustomers(response.data.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Unable to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [selectedBranchId]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const query = search.trim().toLowerCase();
      return [customer.name, customer.phone, customer.address]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [customers, search]);

  if (loading) {
    return <div className="admin-empty-state">Loading customers…</div>;
  }

  if (error) {
    return <div className="admin-empty-state">{error}</div>;
  }

  return (
    <div className="admin-section">
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card__title">Search Customers</div>
        <input
          className="admin-input"
          placeholder="Search by name, phone, address"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="admin-card">
        <div className="admin-card__title">Customer Overview</div>
        {filteredCustomers.length === 0 ? (
          <div className="admin-empty-state">No customers found.</div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Total Orders</th>
                <th>Total Spending</th>
                <th>Last Order</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer._id || customer.phone}>
                  <td>
                    <strong>{customer.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace' }}>{customer.phone}</span>
                  </td>
                  <td>
                    <span className="status-pill pending" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--admin-primary)', border: 'none' }}>
                      {customer.totalOrders} Orders
                    </span>
                  </td>
                  <td>
                    <strong>₹{customer.totalSpent.toLocaleString()}</strong>
                  </td>
                  <td>{new Date(customer.lastOrder).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
