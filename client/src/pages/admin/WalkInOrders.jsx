import React, { useEffect, useMemo, useState } from 'react';
import API from '../../api/api';
import { useAdminBranch } from '../../context/AdminBranchContext.jsx';

const BRANCH_OPTIONS = [
  { id: 'vijaynagar-mysuru', name: 'Vijayanagar 2nd Stage' },
  { id: 'vijaynagar-2nd-stage-mysuru', name: 'Vijayanagar 4th Stage' }
];

const STATUS_OPTIONS = [
  'Pending',
  'Picked Up',
  'Processing',
  'Washing',
  'Ironing',
  'Ready',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const PAYMENT_METHOD_OPTIONS = [
  'Cash',
  'UPI QR',
  'Card',
  'Online Payment',
  'WhatsApp Checkout',
  'Other'
];

const PAYMENT_STATUS_OPTIONS = ['Paid', 'Partially Paid', 'Pending'];

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const emptyOrderForm = {
  customer: {
    name: '',
    phone: '',
    altPhone: '',
    email: '',
    address: '',
    area: '',
    city: '',
    pincode: '',
    mapsLink: '',
    notes: ''
  },
  branch: {
    id: 'vijaynagar-mysuru',
    name: 'Vijayanagar 2nd Stage'
  },
  services: [
    {
      name: '',
      quantity: 1,
      unit: 'Kg',
      price: 0,
      subtotal: 0
    }
  ],
  subtotal: 0,
  grandTotal: 0,
  discount: 0,
  gst: 0,
  payment: {
    method: 'Cash',
    status: 'Pending',
    amountPaid: 0,
    balanceDue: 0,
    transactionId: '',
    paymentDate: ''
  },
  status: 'Pending',
  delivery: {
    pickupDate: '',
    expectedDeliveryDate: '',
    actualDeliveryDate: '',
    deliveryType: 'Customer Pickup',
    specialInstructions: ''
  }
};

const getNumericValue = (value) => {
  const numericValue = Number.parseFloat(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const calculateServiceSubtotal = (service) => {
  const quantity = getNumericValue(service?.quantity);
  const price = getNumericValue(service?.price);
  return quantity * price;
};

export default function WalkInOrders() {
  const { selectedBranchId } = useAdminBranch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sortOrder, setSortOrder] = useState('latest');
  const [activeOrder, setActiveOrder] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [orderForm, setOrderForm] = useState(emptyOrderForm);
  const [saving, setSaving] = useState(false);
  const [customerLookup, setCustomerLookup] = useState(null);
  const [lookupError, setLookupError] = useState('');

  const calculateSummary = (nextForm) => {
    const form = nextForm || orderForm;
    const services = form.services || [];
    const subtotal = services.reduce((sum, item) => sum + calculateServiceSubtotal(item), 0);
    const discount = getNumericValue(form.discount);
    const gst = getNumericValue(form.gst);
    const grandTotal = Math.max(0, subtotal - discount + gst);
    const amountPaid = getNumericValue(form.payment?.amountPaid);
    const balanceDue = Math.max(0, grandTotal - amountPaid);
    return { subtotal, grandTotal, balanceDue };
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          sort: sortOrder,
          search: search.trim(),
          branch: branchFilter,
          status: statusFilter,
          paymentMethod: paymentMethodFilter,
          paymentStatus: paymentStatusFilter,
          from: dateRange.from,
          to: dateRange.to
        };

        if (selectedBranchId && selectedBranchId !== 'all') {
          params.branch = selectedBranchId;
        }

        const response = await API.get('/api/walkin-orders', { params });
        setOrders(response.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Unable to load walk-in orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [selectedBranchId, search, branchFilter, statusFilter, paymentMethodFilter, paymentStatusFilter, dateRange, sortOrder]);

  const handleFormChange = (path, value) => {
    const nextForm = { ...orderForm };
    const keys = path.split('.');
    let target = nextForm;
    while (keys.length > 1) {
      const key = keys.shift();
      target[key] = target[key] || {};
      target = target[key];
    }
    target[keys[0]] = value;

    if (path.startsWith('services') || path === 'discount' || path === 'gst' || path === 'payment.amountPaid') {
      const summary = calculateSummary(nextForm);
      nextForm.subtotal = summary.subtotal;
      nextForm.grandTotal = summary.grandTotal;
      nextForm.payment.balanceDue = summary.balanceDue;
    }

    setOrderForm(nextForm);
  };

  const addServiceRow = () => {
    const nextForm = {
      ...orderForm,
      services: [...orderForm.services, { name: '', quantity: 1, unit: 'Kg', price: 0, subtotal: 0 }]
    };
    setOrderForm(nextForm);
  };

  const removeServiceRow = (index) => {
    const nextForm = { ...orderForm };
    nextForm.services = nextForm.services.filter((_, idx) => idx !== index);
    const summary = calculateSummary(nextForm);
    nextForm.subtotal = summary.subtotal;
    nextForm.grandTotal = summary.grandTotal;
    nextForm.payment.balanceDue = summary.balanceDue;
    setOrderForm(nextForm);
  };

  const updateServiceRow = (index, field, value) => {
    const nextForm = { ...orderForm };
    const service = { ...nextForm.services[index], [field]: value };
    service.subtotal = calculateServiceSubtotal(service);
    nextForm.services[index] = service;
    const summary = calculateSummary(nextForm);
    nextForm.subtotal = summary.subtotal;
    nextForm.grandTotal = summary.grandTotal;
    nextForm.payment.balanceDue = summary.balanceDue;
    setOrderForm(nextForm);
  };

  const resetForm = () => {
    setOrderForm(emptyOrderForm);
    setCustomerLookup(null);
    setLookupError('');
    setFormMode('create');
  };

  const openCreateForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditForm = async (order) => {
    setOrderForm({ ...order });
    const summary = calculateSummary({ ...order });
    setOrderForm((prev) => ({ ...prev, subtotal: summary.subtotal, grandTotal: summary.grandTotal, payment: { ...prev.payment, balanceDue: summary.balanceDue } }));
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleSaveOrder = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (formMode === 'create') {
        await API.post('/api/walkin-orders', orderForm);
      } else {
        await API.patch(`/api/walkin-orders/${orderForm.orderId}`, orderForm);
      }
      setFormOpen(false);
      resetForm();
      const response = await API.get('/api/walkin-orders', { params: { branch: selectedBranchId !== 'all' ? selectedBranchId : undefined, sort: sortOrder } });
      setOrders(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to save walk-in order');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Delete this walk-in order? This cannot be undone.')) return;

    try {
      await API.delete(`/api/walkin-orders/${orderId}`);
      setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to delete walk-in order');
    }
  };

  const handleLookupPhone = async (phone) => {
    if (!phone.trim()) {
      setCustomerLookup(null);
      setLookupError('');
      return;
    }
    try {
      const response = await API.get('/api/walkin-orders/lookup/customer', { params: { phone: phone.trim() } });
      if (response.data?.found) {
        setCustomerLookup(response.data.data);
        setOrderForm((prev) => ({
          ...prev,
          customer: {
            ...prev.customer,
            ...response.data.data.latestCustomer
          }
        }));
      } else {
        setCustomerLookup(null);
      }
    } catch (err) {
      setLookupError(err?.response?.data?.message || err.message || 'Lookup failed');
    }
  };

  const filteredOrders = useMemo(() => orders, [orders]);

  return (
    <div className="admin-section">
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card__title">Walk-in Orders</div>
        <div className="admin-filter-row">
          <button className="admin-button" type="button" onClick={openCreateForm}>
            + New Walk-in Order
          </button>
          <input
            className="admin-input"
            type="search"
            placeholder="Search by order ID, customer, phone, branch"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="admin-select" value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)}>
            <option value="all">All Branches</option>
            {BRANCH_OPTIONS.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
          <select className="admin-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select className="admin-select" value={paymentStatusFilter} onChange={(event) => setPaymentStatusFilter(event.target.value)}>
            <option value="All">All Payments</option>
            {PAYMENT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select className="admin-select" value={paymentMethodFilter} onChange={(event) => setPaymentMethodFilter(event.target.value)}>
            <option value="All">All Methods</option>
            {PAYMENT_METHOD_OPTIONS.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          <select className="admin-select" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="latest">Sort by Latest</option>
            <option value="oldest">Sort by Oldest</option>
          </select>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__title">Order List</div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Branch</th>
                <th>Order Summary</th>
                <th>Grand Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Pickup</th>
                <th>Delivery</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.orderId}>
                  <td>{order.orderId}</td>
                  <td>{order.customer.name || '—'}</td>
                  <td>{order.customer.phone}</td>
                  <td>{order.branch.name}</td>
                  <td>{order.orderSummary}</td>
                  <td>₹{order.grandTotal.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'grid', gap: 4 }}>
                      <span>{order.payment.method}</span>
                      <span className="status-pill {order.payment.status.toLowerCase()}">{order.payment.status}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${order.status.replace(/\s+/g, '').toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.delivery.pickupDate || '—'}</td>
                  <td>{order.delivery.expectedDeliveryDate || '—'}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="admin-button" type="button" onClick={() => setActiveOrder(order)}>
                      View
                    </button>
                    <button className="admin-button" type="button" onClick={() => openEditForm(order)}>
                      Edit
                    </button>
                    <button className="admin-button" type="button" onClick={() => handleDeleteOrder(order.orderId)} style={{ background: '#ef4444' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {formOpen && (
        <div className="admin-modal-backdrop" onClick={() => setFormOpen(false)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2>{formMode === 'create' ? 'New Walk-in Order' : 'Edit Walk-in Order'}</h2>
                <p className="admin-muted-text">Use this form to record walk-in orders from outlet staff.</p>
              </div>
              <button className="admin-button admin-modal-close" type="button" onClick={() => setFormOpen(false)}>
                Close
              </button>
            </div>
            <form className="admin-form" onSubmit={handleSaveOrder}>
              <div className="admin-card">
                <div className="admin-card__title">Customer Information</div>
                <div className="admin-filter-row">
                  <label>
                    <span>Name</span>
                    <input
                      className="admin-input"
                      value={orderForm.customer.name}
                      onChange={(event) => handleFormChange('customer.name', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Mobile Number</span>
                    <input
                      className="admin-input"
                      required
                      value={orderForm.customer.phone}
                      onBlur={(event) => handleLookupPhone(event.target.value)}
                      onChange={(event) => handleFormChange('customer.phone', event.target.value)}
                    />
                  </label>
                </div>
                <div className="admin-filter-row">
                  <label>
                    <span>Alternate Mobile</span>
                    <input
                      className="admin-input"
                      value={orderForm.customer.altPhone}
                      onChange={(event) => handleFormChange('customer.altPhone', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                      className="admin-input"
                      value={orderForm.customer.email}
                      onChange={(event) => handleFormChange('customer.email', event.target.value)}
                    />
                  </label>
                </div>
                <div className="admin-filter-row">
                  <label>
                    <span>Address</span>
                    <textarea
                      className="admin-textarea"
                      value={orderForm.customer.address}
                      onChange={(event) => handleFormChange('customer.address', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Area / Locality</span>
                    <input
                      className="admin-input"
                      value={orderForm.customer.area}
                      onChange={(event) => handleFormChange('customer.area', event.target.value)}
                    />
                  </label>
                </div>
                <div className="admin-filter-row">
                  <label>
                    <span>City</span>
                    <input
                      className="admin-input"
                      value={orderForm.customer.city}
                      onChange={(event) => handleFormChange('customer.city', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Pincode</span>
                    <input
                      className="admin-input"
                      value={orderForm.customer.pincode}
                      onChange={(event) => handleFormChange('customer.pincode', event.target.value)}
                    />
                  </label>
                </div>
                <div className="admin-filter-row">
                  <label>
                    <span>Google Maps Link</span>
                    <input
                      className="admin-input"
                      value={orderForm.customer.mapsLink}
                      onChange={(event) => handleFormChange('customer.mapsLink', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Customer Notes</span>
                    <textarea
                      className="admin-textarea"
                      value={orderForm.customer.notes}
                      onChange={(event) => handleFormChange('customer.notes', event.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card__title">Branch Selection</div>
                <select
                  className="admin-select"
                  value={orderForm.branch.id}
                  onChange={(event) => {
                    const selected = BRANCH_OPTIONS.find((branch) => branch.id === event.target.value);
                    handleFormChange('branch', selected || BRANCH_OPTIONS[0]);
                  }}
                >
                  {BRANCH_OPTIONS.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-card">
                <div className="admin-card__title">Order Details</div>
                <div className="admin-service-list">
                  {orderForm.services.map((service, index) => (
                    <div className="admin-service-row" key={index}>
                      <div className="admin-service-field admin-service-field--full">
                        <span className="admin-service-field__label">Service</span>
                        <input
                          className="admin-input"
                          value={service.name}
                          onChange={(event) => updateServiceRow(index, 'name', event.target.value)}
                        />
                      </div>
                      <div className="admin-service-field">
                        <span className="admin-service-field__label">Qty</span>
                        <input
                          className="admin-input"
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(event) => updateServiceRow(index, 'quantity', Number(event.target.value))}
                        />
                      </div>
                      <div className="admin-service-field">
                        <span className="admin-service-field__label">Unit</span>
                        <select
                          className="admin-select"
                          value={service.unit}
                          onChange={(event) => updateServiceRow(index, 'unit', event.target.value)}
                        >
                          <option value="Kg">Kg</option>
                          <option value="Piece">Piece</option>
                        </select>
                      </div>
                      <div className="admin-service-field">
                        <span className="admin-service-field__label">Price</span>
                        <input
                          className="admin-input"
                          type="number"
                          min="0"
                          value={service.price}
                          onChange={(event) => updateServiceRow(index, 'price', Number(event.target.value))}
                        />
                      </div>
                      <div className="admin-service-field">
                        <span className="admin-service-field__label">Subtotal</span>
                        <div className="admin-service-total">{formatCurrency(service.subtotal)}</div>
                      </div>
                      <div className="admin-service-field admin-service-field--actions">
                        <span className="admin-service-field__label">Remove</span>
                        <button
                          type="button"
                          className="admin-button"
                          onClick={() => removeServiceRow(index)}
                          style={{ background: '#ef4444' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="admin-button" onClick={addServiceRow} style={{ marginTop: 12 }}>
                  + Add Service
                </button>
                <div className="admin-form-grid" style={{ marginTop: 16 }}>
                  <label>
                    <span>Discount</span>
                    <input
                      className="admin-input"
                      type="number"
                      min="0"
                      value={orderForm.discount}
                      onChange={(event) => handleFormChange('discount', Number(event.target.value))}
                    />
                  </label>
                  <label>
                    <span>GST</span>
                    <input
                      className="admin-input"
                      type="number"
                      min="0"
                      value={orderForm.gst}
                      onChange={(event) => handleFormChange('gst', Number(event.target.value))}
                    />
                  </label>
                </div>
                <div className="admin-summary-card">
                  <div className="admin-summary-card__row"><span>Subtotal</span><strong>{formatCurrency(calculateSummary().subtotal)}</strong></div>
                  <div className="admin-summary-card__row"><span>GST</span><strong>{formatCurrency(orderForm.gst)}</strong></div>
                  <div className="admin-summary-card__row"><span>Discount</span><strong>- {formatCurrency(orderForm.discount)}</strong></div>
                  <div className="admin-summary-card__row admin-summary-card__row--total"><span>Grand Total</span><strong>{formatCurrency(calculateSummary().grandTotal)}</strong></div>
                  <div className="admin-summary-card__row"><span>Paid</span><strong>{formatCurrency(orderForm.payment.amountPaid)}</strong></div>
                  <div className="admin-summary-card__row"><span>Balance Due</span><strong>{formatCurrency(calculateSummary().balanceDue)}</strong></div>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card__title">Payment Details</div>
                <div className="admin-filter-row">
                  <select
                    className="admin-select"
                    value={orderForm.payment.method}
                    onChange={(event) => handleFormChange('payment.method', event.target.value)}
                  >
                    {PAYMENT_METHOD_OPTIONS.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                  <select
                    className="admin-select"
                    value={orderForm.payment.status}
                    onChange={(event) => handleFormChange('payment.status', event.target.value)}
                  >
                    {PAYMENT_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <input
                    className="admin-input"
                    type="number"
                    min="0"
                    value={orderForm.payment.amountPaid}
                    onChange={(event) => handleFormChange('payment.amountPaid', Number(event.target.value))}
                    placeholder="Amount Paid"
                  />
                </div>
                <div className="admin-filter-row" style={{ marginTop: 16 }}>
                  <input
                    className="admin-input"
                    value={orderForm.payment.transactionId}
                    onChange={(event) => handleFormChange('payment.transactionId', event.target.value)}
                    placeholder="Transaction ID"
                  />
                  <input
                    className="admin-input"
                    type="date"
                    value={orderForm.payment.paymentDate}
                    onChange={(event) => handleFormChange('payment.paymentDate', event.target.value)}
                  />
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card__title">Order Status</div>
                <select
                  className="admin-select"
                  value={orderForm.status}
                  onChange={(event) => handleFormChange('status', event.target.value)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {error && <div className="admin-empty-state">{error}</div>}

              <div className="admin-filter-row" style={{ justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="admin-button" onClick={resetForm} style={{ background: '#64748b' }}>
                  Reset
                </button>
                <button type="submit" className="admin-button" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeOrder && (
        <div className="admin-drawer-backdrop" onClick={() => setActiveOrder(null)}>
          <aside className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer-header">
              <div>
                <h2>{activeOrder.orderId}</h2>
                <p className="admin-muted-text">{activeOrder.customer.name} — {activeOrder.customer.phone}</p>
              </div>
              <button className="admin-button admin-modal-close" type="button" onClick={() => setActiveOrder(null)}>
                Close
              </button>
            </div>
            <div className="admin-drawer-body">
              <section className="admin-card">
                <div className="admin-card__title">Customer Details</div>
                <p><strong>Name:</strong> {activeOrder.customer.name || '—'}</p>
                <p><strong>Phone:</strong> {activeOrder.customer.phone}</p>
                <p><strong>Alternate:</strong> {activeOrder.customer.altPhone || '—'}</p>
                <p><strong>Email:</strong> {activeOrder.customer.email || '—'}</p>
                <p><strong>Address:</strong> {activeOrder.customer.address || '—'}</p>
                <p><strong>Area:</strong> {activeOrder.customer.area || '—'}</p>
                <p><strong>City:</strong> {activeOrder.customer.city || '—'}</p>
                <p><strong>Pincode:</strong> {activeOrder.customer.pincode || '—'}</p>
                {activeOrder.customer.mapsLink && (
                  <p><strong>Maps:</strong> <a href={activeOrder.customer.mapsLink} target="_blank" rel="noreferrer">View map</a></p>
                )}
                <p><strong>Notes:</strong> {activeOrder.customer.notes || '—'}</p>
              </section>

              <section className="admin-card">
                <div className="admin-card__title">Payment Information</div>
                <p><strong>Method:</strong> {activeOrder.payment.method}</p>
                <p><strong>Status:</strong> {activeOrder.payment.status}</p>
                <p><strong>Amount Paid:</strong> ₹{activeOrder.payment.amountPaid.toLocaleString()}</p>
                <p><strong>Balance Due:</strong> ₹{activeOrder.payment.balanceDue.toLocaleString()}</p>
                <p><strong>Transaction ID:</strong> {activeOrder.payment.transactionId || '—'}</p>
                <p><strong>Payment Date:</strong> {activeOrder.payment.paymentDate || '—'}</p>
              </section>

              <section className="admin-card">
                <div className="admin-card__title">Order Summary</div>
                <p><strong>Branch:</strong> {activeOrder.branch.name}</p>
                <p><strong>Status:</strong> {activeOrder.status}</p>
                <p><strong>Grand Total:</strong> ₹{activeOrder.grandTotal.toLocaleString()}</p>
                <p><strong>Subtotal:</strong> ₹{activeOrder.subtotal.toLocaleString()}</p>
                <p><strong>Discount:</strong> ₹{activeOrder.discount.toLocaleString()}</p>
                <p><strong>GST:</strong> ₹{activeOrder.gst.toLocaleString()}</p>
                <p><strong>Summary:</strong> {activeOrder.orderSummary || '—'}</p>
              </section>

              <section className="admin-card">
                <div className="admin-card__title">Timeline & Delivery</div>
                <p><strong>Pickup Date:</strong> {activeOrder.delivery.pickupDate || '—'}</p>
                <p><strong>Expected Delivery:</strong> {activeOrder.delivery.expectedDeliveryDate || '—'}</p>
                <p><strong>Actual Delivery:</strong> {activeOrder.delivery.actualDeliveryDate || '—'}</p>
                <p><strong>Delivery Type:</strong> {activeOrder.delivery.deliveryType}</p>
                <p><strong>Special Instructions:</strong> {activeOrder.delivery.specialInstructions || '—'}</p>
              </section>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
