import React, { useEffect, useState } from 'react';
import API from '../../api/api';
import { useAdminBranch } from '../../context/AdminBranchContext.jsx';
import { adminBranches } from '../../config/branches.js';
import '../../styles/admin.css';

const emptyItem = { name: '', unit: 'Liter', minStock: 0, availableStock: 0, consumedStock: 0 };
const emptyTx = { itemId: '', type: 'Stock In', quantity: 0, unitCost: 0, supplier: '', reason: '', notes: '' };
const emptyExpense = { date: '', category: 'Inventory/Supplies', description: '', amount: 0, paymentMethod: 'Cash', notes: '' };

export default function AdminInventory() {
  const { selectedBranchId } = useAdminBranch();
  const [activeTab, setActiveTab] = useState('Catalog');
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [alerts, setAlerts] = useState({ critical: [], low: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [itemForm, setItemForm] = useState(emptyItem);
  const [txForm, setTxForm] = useState(emptyTx);
  const [expenseForm, setExpenseForm] = useState(emptyExpense);

  // Modals Visibility
  const [showItemModal, setShowItemModal] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  const [showTxModal, setShowTxModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [isEditingExpense, setIsEditingExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  const formatVal = (num) => `₹${Number(num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, txRes, expRes, alertsRes] = await Promise.all([
        API.get('/api/inventory'),
        API.get('/api/inventory/transactions'),
        API.get('/api/expenses', { params: { branch: selectedBranchId } }),
        API.get('/api/inventory/alerts')
      ]);

      setItems(itemsRes.data.data || []);
      setTransactions(txRes.data.data || []);
      setExpenses(expRes.data.data || []);
      setAlerts(alertsRes.data || { critical: [], low: [] });
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBranchId]);

  // Inventory Items Handlers
  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      const branchName = adminBranches.find(b => b.id === selectedBranchId)?.name || 'Store Branch';
      const outlet = { id: selectedBranchId === 'all' ? '' : selectedBranchId, name: branchName };
      
      if (isEditingItem) {
        await API.put(`/api/inventory/${editingItemId}`, itemForm);
      } else {
        await API.post('/api/inventory', { ...itemForm, outlet });
      }
      setShowItemModal(false);
      setItemForm(emptyItem);
      setIsEditingItem(false);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save inventory item');
    }
  };

  const handleEditItem = (item) => {
    setItemForm({
      name: item.name,
      unit: item.unit,
      minStock: item.minStock,
      availableStock: item.availableStock || 0,
      consumedStock: item.consumedStock || 0
    });
    setEditingItemId(item._id);
    setIsEditingItem(true);
    setShowItemModal(true);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await API.delete(`/api/inventory/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  // Stock Transaction Handlers
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    try {
      const branchName = adminBranches.find(b => b.id === selectedBranchId)?.name || 'Central Warehouse';
      const outlet = { id: selectedBranchId === 'all' ? '' : selectedBranchId, name: branchName };

      await API.post('/api/inventory/transaction', { ...txForm, outlet });
      setShowTxModal(false);
      setTxForm(emptyTx);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save transaction');
    }
  };

  const openLogTxModal = (item, type) => {
    setTxForm({
      itemId: item._id,
      type,
      quantity: 0,
      unitCost: item.unitCost,
      supplier: item.supplier || '',
      reason: type === 'Stock Out' ? 'Consumable Usage' : (type === 'Stock In' ? 'Detergent Purchase' : 'Stock Correction'),
      notes: ''
    });
    setShowTxModal(true);
  };

  // Expense Handlers
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    try {
      const branchName = adminBranches.find(b => b.id === selectedBranchId)?.name || 'Central Warehouse';
      const outlet = { id: selectedBranchId === 'all' ? '' : selectedBranchId, name: branchName };

      if (isEditingExpense) {
        await API.put(`/api/expenses/${editingExpenseId}`, { ...expenseForm, outlet });
      } else {
        await API.post('/api/expenses', { ...expenseForm, outlet });
      }
      setShowExpenseModal(false);
      setExpenseForm(emptyExpense);
      setIsEditingExpense(false);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save expense record');
    }
  };

  const handleEditExpense = (exp) => {
    setExpenseForm({
      date: exp.date ? new Date(exp.date).toISOString().slice(0, 10) : '',
      category: exp.category,
      description: exp.description,
      amount: exp.amount,
      paymentMethod: exp.paymentMethod || 'Cash',
      notes: exp.notes || ''
    });
    setEditingExpenseId(exp._id);
    setIsEditingExpense(true);
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await API.delete(`/api/expenses/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete expense record');
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-card__title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <span>Inventory & Expenses</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={() => { setItemForm(emptyItem); setIsEditingItem(false); setShowItemModal(true); }} className="admin-button">
            + Add Inventory Item
          </button>
          <button type="button" onClick={() => { setExpenseForm({ ...emptyExpense, date: new Date().toISOString().slice(0, 10) }); setIsEditingExpense(false); setShowExpenseModal(true); }} className="admin-button admin-button--warning">
            + Record Business Expense
          </button>
        </div>
      </div>

      {/* 1. Inventory Level Alerts Banner */}
      {(alerts.critical?.length > 0 || alerts.low?.length > 0) && (
        <div className="glass-panel" style={{ padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#b91c1c', marginBottom: '8px' }}>⚠️ Inventory Stock Alerts</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {alerts.critical?.map(item => (
              <span key={item.name} className="status-pill cancelled" style={{ fontSize: '0.74rem' }}>
                🔴 Critical: {item.name} ({item.stock} {item.unit} remaining)
              </span>
            ))}
            {alerts.low?.map(item => (
              <span key={item.name} className="status-pill pending" style={{ fontSize: '0.74rem' }}>
                🟠 Low Stock: {item.name} ({item.stock} {item.unit} remaining)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2. Tab Switcher */}
      <div className="admin-filter-row" style={{ marginBottom: '20px', gap: '15px' }}>
        {['Catalog', 'History Logs', 'Business Expenses'].map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`admin-button ${activeTab === tab ? '' : 'admin-button--secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-empty-state">Loading data…</div>
      ) : (
        <div className="admin-card glass-panel">
          {/* TAB 1: STOCK CATALOG */}
          {activeTab === 'Catalog' && (
            <>
              <div className="admin-card__title" style={{ fontSize: '0.9rem' }}>Stock List</div>
              {items.length === 0 ? (
                <div className="admin-empty-state">No inventory items found. Add items to track catalog.</div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table" style={{ fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Unit</th>
                        <th>Available Stock</th>
                        <th>Consumed</th>
                        <th>Remaining Stock</th>
                        <th>Min Stock Threshold</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => {
                        let badgeClass = 'healthy';
                        let badgeLabel = 'Healthy';
                        if (item.currentStock <= 0) {
                          badgeClass = 'critical';
                          badgeLabel = 'Critical';
                        } else if (item.currentStock <= item.minStock) {
                          badgeClass = 'low';
                          badgeLabel = 'Low Stock';
                        }

                        return (
                          <tr key={item._id}>
                            <td style={{ fontWeight: 'bold' }}>{item.name}</td>
                            <td>{item.unit}</td>
                            <td>{item.availableStock || 0}</td>
                            <td>{item.consumedStock || 0}</td>
                            <td style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{item.currentStock}</td>
                            <td>{item.minStock}</td>
                            <td>
                              <span className={`status-badge ${badgeClass}`}>
                                <span className="indicator-dot"></span>
                                {badgeLabel}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <button type="button" onClick={() => openLogTxModal(item, 'Stock In')} className="admin-button admin-button--compact" style={{ padding: '3px 6px', fontSize: '0.7rem' }}>
                                  + In
                                </button>
                                <button type="button" onClick={() => openLogTxModal(item, 'Stock Out')} className="admin-button admin-button--compact admin-button--warning" style={{ padding: '3px 6px', fontSize: '0.7rem' }}>
                                  - Out
                                </button>
                                <button type="button" onClick={() => handleEditItem(item)} className="admin-button admin-button--compact admin-button--secondary" style={{ padding: '3px 6px', fontSize: '0.7rem' }}>
                                  Edit
                                </button>
                                <button type="button" onClick={() => handleDeleteItem(item._id)} className="admin-button admin-button--compact" style={{ padding: '3px 6px', fontSize: '0.7rem', backgroundColor: '#ef4444', color: '#fff' }}>
                                  Del
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* TAB 2: TRANSACTION LOG */}
          {activeTab === 'History Logs' && (
            <>
              <div className="admin-card__title" style={{ fontSize: '0.9rem' }}>Stock Activity Log</div>
              {transactions.length === 0 ? (
                <div className="admin-empty-state">No stock history transactions logged yet.</div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table" style={{ fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Item Name</th>
                        <th>Type</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Unit Cost</th>
                        <th>Total Cost</th>
                        <th>Supplier / Reason</th>
                        <th>Outlet</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(t => (
                        <tr key={t._id}>
                          <td>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                          <td style={{ fontWeight: 'bold' }}>{t.itemName}</td>
                          <td>
                            <span className={`status-pill ${t.type === 'Stock In' ? 'paid' : (t.type === 'Stock Out' ? 'pending' : 'processing')}`} style={{ fontSize: '0.68rem' }}>
                              {t.type}
                            </span>
                          </td>
                          <td>{t.quantity}</td>
                          <td>{t.unit}</td>
                          <td>{formatVal(t.unitCost)}</td>
                          <td>{formatVal(t.totalCost)}</td>
                          <td>{t.supplier || t.reason || '—'}</td>
                          <td>{t.outlet?.name || 'Central'}</td>
                          <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* TAB 3: EXPENSES TRACKER */}
          {activeTab === 'Business Expenses' && (
            <>
              <div className="admin-card__title" style={{ fontSize: '0.9rem' }}>Business Expenses Record</div>
              {expenses.length === 0 ? (
                <div className="admin-empty-state">No expense records logged for this branch.</div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table" style={{ fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Outlet</th>
                        <th>Payment Method</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map(e => (
                        <tr key={e._id}>
                          <td>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                          <td>
                            <span className="status-pill warning" style={{ fontSize: '0.7rem' }}>
                              {e.category}
                            </span>
                          </td>
                          <td style={{ fontWeight: 'bold' }}>{e.description}</td>
                          <td style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ef4444' }}>{formatVal(e.amount)}</td>
                          <td>{e.outlet?.name || 'All Outlets'}</td>
                          <td>{e.paymentMethod || 'Cash'}</td>
                          <td>{e.notes || '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button type="button" onClick={() => handleEditExpense(e)} className="admin-button admin-button--compact admin-button--secondary" style={{ padding: '3px 6px', fontSize: '0.7rem' }}>
                                Edit
                              </button>
                              <button type="button" onClick={() => handleDeleteExpense(e._id)} className="admin-button admin-button--compact" style={{ padding: '3px 6px', fontSize: '0.7rem', backgroundColor: '#ef4444', color: '#fff' }}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* MODAL 1: ADD/EDIT ITEM */}
      {showItemModal && (
        <div className="modal-backdrop">
          <div className="admin-card modal-content glass-panel" style={{ width: '450px', padding: '20px' }}>
            <div className="admin-card__title">{isEditingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</div>
            <form onSubmit={handleSaveItem} className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Item Name</label>
                <input
                  className="admin-input"
                  placeholder="e.g. Detergent"
                  value={itemForm.name}
                  onChange={e => setItemForm({...itemForm, name: e.target.value})}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Unit</label>
                <select
                  className="admin-select"
                  value={itemForm.unit}
                  onChange={e => setItemForm({...itemForm, unit: e.target.value})}
                  required
                >
                  <option value="Liter">Liter</option>
                  <option value="Kg">Kg</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Available Stock</label>
                <input
                  className="admin-input"
                  type="number"
                  placeholder="e.g. 25"
                  value={itemForm.availableStock}
                  onChange={e => setItemForm({...itemForm, availableStock: e.target.value})}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Consumed Quantity</label>
                <input
                  className="admin-input"
                  type="number"
                  placeholder="e.g. 8"
                  value={itemForm.consumedStock}
                  onChange={e => setItemForm({...itemForm, consumedStock: e.target.value})}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Min Stock Threshold (Alert level)</label>
                <input
                  className="admin-input"
                  type="number"
                  placeholder="e.g. 5"
                  value={itemForm.minStock}
                  onChange={e => setItemForm({...itemForm, minStock: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" onClick={() => setShowItemModal(false)} className="admin-button admin-button--secondary">Cancel</button>
                <button type="submit" className="admin-button">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG TRANSACTION (Stock In / Stock Out / Adjustment) */}
      {showTxModal && (
        <div className="modal-backdrop">
          <div className="admin-card modal-content glass-panel" style={{ width: '450px', padding: '20px' }}>
            <div className="admin-card__title">Log Stock Movement ({txForm.type})</div>
            <form onSubmit={handleSaveTransaction} className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                className="admin-input"
                type="number"
                placeholder={`Quantity to ${txForm.type === 'Stock In' ? 'Add' : 'Deduct'}`}
                value={txForm.quantity || ''}
                onChange={e => setTxForm({...txForm, quantity: e.target.value})}
                required
              />
              {txForm.type === 'Stock In' && (
                <input
                  className="admin-input"
                  type="number"
                  step="0.01"
                  placeholder="Purchase Unit Cost (₹)"
                  value={txForm.unitCost || ''}
                  onChange={e => setTxForm({...txForm, unitCost: e.target.value})}
                  required
                />
              )}
              {txForm.type === 'Stock In' && (
                <input
                  className="admin-input"
                  placeholder="Supplier Info"
                  value={txForm.supplier}
                  onChange={e => setTxForm({...txForm, supplier: e.target.value})}
                />
              )}
              <input
                className="admin-input"
                placeholder="Reason (e.g. Wash Load usage, detergent purchase)"
                value={txForm.reason}
                onChange={e => setTxForm({...txForm, reason: e.target.value})}
              />
              <textarea
                className="admin-input"
                placeholder="Additional notes"
                value={txForm.notes}
                onChange={e => setTxForm({...txForm, notes: e.target.value})}
                style={{ height: '60px' }}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" onClick={() => setShowTxModal(false)} className="admin-button admin-button--secondary">Cancel</button>
                <button type="submit" className="admin-button">Submit Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD EXPENSE */}
      {showExpenseModal && (
        <div className="modal-backdrop">
          <div className="admin-card modal-content glass-panel" style={{ width: '450px', padding: '20px' }}>
            <div className="admin-card__title">{isEditingExpense ? 'Edit Expense Record' : 'Record Business Expense'}</div>
            <form onSubmit={handleSaveExpense} className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                className="admin-input"
                type="date"
                value={expenseForm.date}
                onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}
                required
              />
              <select
                className="admin-select"
                value={expenseForm.category}
                onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                required
              >
                <option value="Inventory/Supplies">Inventory & Supplies</option>
                <option value="Transportation">Transportation / Logistics</option>
                <option value="Maintenance">Maintenance & Repair</option>
                <option value="Utilities">Utilities & Rent</option>
                <option value="Outsourcing">Outsourcing & Vendors</option>
                <option value="Other">Other Expenses</option>
              </select>
              <input
                className="admin-input"
                placeholder="Expense Description (e.g. Fabric Softener load)"
                value={expenseForm.description}
                onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                required
              />
              <input
                className="admin-input"
                type="number"
                placeholder="Amount Spent (₹)"
                value={expenseForm.amount || ''}
                onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                required
              />
              <select
                className="admin-select"
                value={expenseForm.paymentMethod}
                onChange={e => setExpenseForm({...expenseForm, paymentMethod: e.target.value})}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Other">Other Mode</option>
              </select>
              <textarea
                className="admin-input"
                placeholder="Notes (optional)"
                value={expenseForm.notes}
                onChange={e => setExpenseForm({...expenseForm, notes: e.target.value})}
                style={{ height: '60px' }}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" onClick={() => setShowExpenseModal(false)} className="admin-button admin-button--secondary">Cancel</button>
                <button type="submit" className="admin-button">Record Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
