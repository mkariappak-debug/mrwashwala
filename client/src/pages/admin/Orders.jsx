import React, { useEffect, useMemo, useState } from 'react';
import API from '../../api/api';
import { useAdminBranch } from '../../context/AdminBranchContext.jsx';

const STATUS_OPTIONS = [
  'All',
  'Pending',
  'Picked Up',
  'In Process',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const PAYMENT_METHOD_OPTIONS = ['All', 'Cash', 'QR Payment', 'WhatsApp Checkout', 'Online Payment'];
const PAYMENT_STATUS_OPTIONS = ['All', 'Paid', 'Pending', 'Refunded'];

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const normalizePaymentStatus = (order) => {
  if (order.paymentStatus && order.paymentStatus !== 'Pending') return order.paymentStatus;
  if (['QR Payment', 'Online Payment'].includes(order.paymentMethod)) return 'Paid';
  if (order.paymentMethod === 'WhatsApp Checkout') return 'Pending';
  return 'Pending';
};

const buildOrderSummary = (order) => {
  if (order.orderSummary && order.orderSummary.trim()) {
    return order.orderSummary;
  }

  if (!order.items || !order.items.length) {
    return 'No items listed';
  }

  return order.items
    .map((item) => {
      const metric = item.unit ? `${item.quantity} ${item.unit}` : `${item.quantity}`;
      return `${item.name} (${metric})`;
    })
    .join(', ');
};

const buildServiceList = (order) => {
  if (!order.items || !order.items.length) {
    return '—';
  }
  return [...new Set(order.items.map((item) => item.name))].join(', ');
};

const buildTotalQuantity = (order) => {
  if (!order.items || !order.items.length) return 0;
  return order.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
};

export default function AdminOrders() {
  const { selectedBranchId, availableBranches, setSelectedBranchId } = useAdminBranch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (selectedBranchId && selectedBranchId !== 'all') params.branch = selectedBranchId;
        if (statusFilter !== 'All') params.status = statusFilter;
        if (paymentMethodFilter !== 'All') params.paymentMethod = paymentMethodFilter;
        if (paymentStatusFilter !== 'All') params.paymentStatus = paymentStatusFilter;
        if (search.trim()) params.search = search.trim();

        const response = await API.get('/api/orders', { params });
        setOrders(response.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Unable to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [selectedBranchId, statusFilter, paymentMethodFilter, paymentStatusFilter, search]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const createdAt = order.createdAt ? new Date(order.createdAt) : null;
      const fromDate = dateRange.from ? new Date(dateRange.from) : null;
      const toDate = dateRange.to ? new Date(dateRange.to) : null;

      if (fromDate && createdAt && createdAt < fromDate) return false;
      if (toDate && createdAt && createdAt > toDate) return false;
      return true;
    });
  }, [orders, dateRange]);

  const handleStatusUpdate = async (orderId, nextStatus) => {
    try {
      const response = await API.patch(`/api/orders/${encodeURIComponent(orderId)}/status`, { status: nextStatus });
      setOrders((prev) => prev.map((order) => (order.orderId === orderId ? response.data : order)));
      if (activeOrder?.orderId === orderId) {
        setActiveOrder(response.data);
      }
      setError(null);
      setSuccessMessage(`Order ${orderId} updated to ${nextStatus}`);
      window.setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setSuccessMessage(null);
      setError(err?.response?.data?.message || 'Failed to update status');
    }
  };

  const handleBranchChange = (value) => {
    setSelectedBranchId(value);
  };

  if (loading) {
    return <div className="admin-empty-state">Loading orders…</div>;
  }

  if (error) {
    return <div className="admin-empty-state">{error}</div>;
  }

  return (
    <div className="admin-section">
      <div className="admin-card">
        <div className="admin-card__title">Order Filters</div>
        <div className="admin-filter-row">
          <select
            className="admin-select"
            value={selectedBranchId}
            onChange={(event) => handleBranchChange(event.target.value)}
          >
            {availableBranches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.shortName}
              </option>
            ))}
          </select>

          <select
            className="admin-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            className="admin-select"
            value={paymentStatusFilter}
            onChange={(event) => setPaymentStatusFilter(event.target.value)}
          >
            {PAYMENT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            className="admin-select"
            value={paymentMethodFilter}
            onChange={(event) => setPaymentMethodFilter(event.target.value)}
          >
            {PAYMENT_METHOD_OPTIONS.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>

          <input
            className="admin-input"
            type="date"
            value={dateRange.from}
            onChange={(event) => setDateRange((prev) => ({ ...prev, from: event.target.value }))}
          />

          <input
            className="admin-input"
            type="date"
            value={dateRange.to}
            onChange={(event) => setDateRange((prev) => ({ ...prev, to: event.target.value }))}
          />

          <input
            className="admin-input"
            type="search"
            placeholder="Search by name, phone, order ID, address"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ minWidth: 240 }}
          />
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__title">Orders</div>
        {successMessage && <div className="admin-card__title" style={{ color: 'var(--admin-success)', marginBottom: '12px', fontSize: '0.95rem' }}>{successMessage}</div>}
        {filteredOrders.length === 0 ? (
          <div className="admin-empty-state">No orders match your filters.</div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Pickup</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const paymentStatus = normalizePaymentStatus(order);
                  const branchName = order.selectedBranch?.name || order.selectedBranch?.id || 'All Branches';
                  return (
                    <tr key={order._id}>
                      <td>{order.orderId}</td>
                      <td>
                        <div style={{ display: 'grid', gap: 4 }}>
                          <strong>{order.customer.name}</strong>
                          <span className="admin-muted-text">{order.customer.phone || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="branch-badge" style={{ padding: '6px 10px' }}>
                          {branchName}
                        </span>
                      </td>
                      <td>
                        <select
                          className="admin-select"
                          value={order.status}
                          onChange={(event) => handleStatusUpdate(order.orderId, event.target.value)}
                          aria-label={`Change status for order ${order.orderId}`}
                        >
                          {STATUS_OPTIONS.filter((status) => status !== 'All').map((statusOption) => (
                            <option key={statusOption} value={statusOption}>
                              {statusOption}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>₹{Number(order.totalAmount || 0).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'grid', gap: 4 }}>
                          <span>{paymentStatus}</span>
                          <span className="admin-muted-text">{order.paymentMethod || '—'}</span>
                        </div>
                      </td>
                      <td>{order.pickupDate || '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-button"
                          onClick={() => setActiveOrder(order)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeOrder && (
        <div className="admin-drawer-backdrop" onClick={() => setActiveOrder(null)}>
          <aside className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer-header">
              <div>
                <h2>{activeOrder.orderId}</h2>
                <p className="admin-muted-text">{activeOrder.customer.name}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="admin-button" type="button" onClick={() => window.print()} style={{ background: '#64748b' }}>
                  Print
                </button>
                <button className="admin-button admin-modal-close" type="button" onClick={() => setActiveOrder(null)}>
                  Close
                </button>
              </div>
            </div>

            <div className="admin-drawer-body">
              <section className="admin-card">
                <div className="admin-card__title">Customer</div>
                <p><strong>Name:</strong> {activeOrder.customer.name}</p>
                <p><strong>Phone:</strong> {activeOrder.customer.phone}</p>
                <p><strong>Address:</strong> {activeOrder.customer.address}</p>
                <p><strong>Pickup Branch:</strong> {activeOrder.selectedBranch?.name || '—'}</p>
              </section>

              <section className="admin-card">
                <div className="admin-card__title">Payment</div>
                <p><strong>Method:</strong> {activeOrder.paymentMethod || '—'}</p>
                <p><strong>Status:</strong> {normalizePaymentStatus(activeOrder)}</p>
                <p><strong>Total:</strong> ₹{Number(activeOrder.totalAmount || 0).toLocaleString()}</p>
                {activeOrder.paymentId && <p><strong>Transaction:</strong> {activeOrder.paymentId}</p>}
              </section>

              <section className="admin-card">
                <div className="admin-card__title">Order Summary</div>
                <p>{buildOrderSummary(activeOrder)}</p>
              </section>

              <section className="admin-card">
                <div className="admin-card__title">Timeline & Notes</div>
                <p><strong>Status:</strong> {activeOrder.status}</p>
                <p><strong>Placed:</strong> {formatDate(activeOrder.createdAt)}</p>
                <p><strong>Pickup Date:</strong> {activeOrder.pickupDate || '—'}</p>
                <p><strong>Delivery Date:</strong> {activeOrder.deliveryDate || '—'}</p>
                <p><strong>Notes:</strong> {activeOrder.customer.instructions || 'No notes provided.'}</p>
              </section>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
