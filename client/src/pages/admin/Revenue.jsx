import React, { useEffect, useState, useMemo } from 'react';
import API from '../../api/api';
import { useAdminBranch } from '../../context/AdminBranchContext.jsx';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import { adminBranches } from '../../config/branches.js';
import '../../styles/admin.css';

export default function AdminRevenue() {
  const { selectedBranchId } = useAdminBranch();
  const { logout } = useAdminAuth();
  const [summary, setSummary] = useState({ today: {}, monthly: {} });
  const [detailData, setDetailData] = useState({ summary: {}, orders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Date Selection State
  // Modes: 'range', 'multiple'
  const [selectionMode, setSelectionMode] = useState('range');
  const [selectedRange, setSelectedRange] = useState({ from: '', to: '' });
  const [selectedDates, setSelectedDates] = useState([]); // array of 'YYYY-MM-DD' strings
  const [activeTab, setActiveTab] = useState('Today'); // predefined period
  const [hoveredDate, setHoveredDate] = useState(null); // for live range hover preview

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed

  // Format Helper
  const formatVal = (num) => `₹${Number(num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Load Dashboard Summary (Today vs Month Overview)
  const fetchSummary = async () => {
    try {
      const response = await API.get('/api/revenue/summary', {
        params: { branch: selectedBranchId }
      });
      setSummary(response.data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to fetch summary stats');
    }
  };

  // Load Selected Dates Detail
  const fetchDetails = async () => {
    setLoading(true);
    try {
      const params = { branch: selectedBranchId };
      if (selectionMode === 'range') {
        if (selectedRange.from) params.from = selectedRange.from;
        if (selectedRange.to) params.to = selectedRange.to;
      } else if (selectionMode === 'multiple') {
        if (selectedDates.length > 0) {
          params.dates = selectedDates.join(',');
        }
      }
      const response = await API.get('/api/revenue/details', { params });
      setDetailData(response.data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to fetch revenue details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedBranchId]);

  useEffect(() => {
    fetchDetails();
  }, [selectedBranchId, selectedRange, selectedDates, selectionMode]);

  // Calendar Utilities
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayIndex = (y, m) => new Date(y, m, 1).getDay();

  const handleDateClick = (dateStr) => {
    setActiveTab('Custom');
    if (selectionMode === 'multiple') {
      setSelectedDates(prev => {
        if (prev.includes(dateStr)) {
          return prev.filter(d => d !== dateStr);
        } else {
          return [...prev, dateStr];
        }
      });
    } else {
      // Range mode selection logic
      const { from, to } = selectedRange;
      if (!from || (from && to && from !== to)) {
        // First click of a new selection
        setSelectedRange({ from: dateStr, to: dateStr });
      } else {
        // Second click to form a range
        const fromDate = new Date(from);
        const clickedDate = new Date(dateStr);
        if (clickedDate < fromDate) {
          setSelectedRange({ from: dateStr, to: from });
        } else {
          setSelectedRange({ from, to: dateStr });
        }
      }
    }
  };

  const handlePredefinedPeriod = (period) => {
    setActiveTab(period);
    setSelectionMode('range');
    const today = new Date();
    
    if (period === 'Today') {
      const dStr = today.toISOString().slice(0, 10);
      setSelectedRange({ from: dStr, to: dStr });
    } else if (period === 'Yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const dStr = yesterday.toISOString().slice(0, 10);
      setSelectedRange({ from: dStr, to: dStr });
    } else if (period === 'This Week') {
      const currentDay = today.getDay();
      const first = today.getDate() - currentDay;
      const start = new Date(today.setDate(first));
      const end = new Date(today.setDate(first + 6));
      setSelectedRange({
        from: start.toISOString().slice(0, 10),
        to: end.toISOString().slice(0, 10)
      });
    } else if (period === 'This Month') {
      const startStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
      const endVal = daysInMonth(today.getFullYear(), today.getMonth());
      const endStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(endVal).padStart(2, '0')}`;
      setSelectedRange({ from: startStr, to: endStr });
    } else if (period === 'This Year') {
      setSelectedRange({
        from: `${today.getFullYear()}-01-01`,
        to: `${today.getFullYear()}-12-31`
      });
    }
  };

  // Helper to check if a calendar cell is selected
  const isSelected = (dateStr) => {
    if (selectionMode === 'multiple') {
      return selectedDates.includes(dateStr);
    }
    if (selectedRange.from && !selectedRange.to) {
      return selectedRange.from === dateStr;
    }
    if (selectedRange.from && selectedRange.to) {
      return dateStr >= selectedRange.from && dateStr <= selectedRange.to;
    }
    return false;
  };

  // Predefined initial range to Today
  useEffect(() => {
    handlePredefinedPeriod('Today');
  }, []);

  const changeMonth = (offset) => {
    let nextMonth = currentMonth + offset;
    let nextYear = currentYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  // Export to Excel trigger
  const handleExport = async () => {
    setError(null);
    let filenameLabel = activeTab;
    if (activeTab === 'Custom') {
      if (selectionMode === 'range') {
        filenameLabel = `${selectedRange.from}_to_${selectedRange.to}`;
      } else {
        filenameLabel = `Multiple_Dates_${selectedDates.length}`;
      }
    }

    const params = {};
    params.branch = selectedBranchId;
    params.label = filenameLabel;
    
    if (selectionMode === 'range') {
      if (selectedRange.from) params.from = selectedRange.from;
      if (selectedRange.to) params.to = selectedRange.to;
    } else {
      if (selectedDates.length > 0) params.dates = selectedDates.join(',');
    }

    try {
      const response = await API.get('/api/revenue/export-excel', {
        params,
        responseType: 'blob'
      });

      // Construct file download
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Determine proper file name
      let fileName = 'MrWashWala_Revenue';
      if (activeTab === 'Custom') {
        if (selectionMode === 'range') {
          if (selectedRange.from && selectedRange.to) {
            fileName += `_${selectedRange.from}_to_${selectedRange.to}`;
          } else {
            fileName += `_${selectedRange.from || 'report'}`;
          }
        } else {
          fileName += `_Multiple_Dates_${selectedDates.length}`;
        }
      } else {
        fileName += `_${activeTab.replace(/\s+/g, '_')}`;
      }
      fileName += '.xlsx';

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Your session has expired. Redirecting to login…');
        setTimeout(() => {
          logout();
        }, 2000);
      } else if (err.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsed = JSON.parse(e.target.result);
            setError(parsed.message || 'Failed to download report. Please try again.');
          } catch {
            setError('Failed to download report. Please try again.');
          }
        };
        reader.onerror = () => {
          setError('Failed to download report. Please try again.');
        };
        reader.readAsText(err.response.data);
      } else {
        setError(err.response?.data?.message || 'Failed to download report. Please try again.');
      }
    }
  };

  const getDayClasses = (dateStr) => {
    const isToday = new Date().toISOString().slice(0, 10) === dateStr;
    let classes = ['calendar-cell', 'day'];
    
    if (isToday) classes.push('today');
    
    if (selectionMode === 'multiple') {
      if (selectedDates.includes(dateStr)) {
        classes.push('selected');
      }
    } else {
      const { from, to } = selectedRange;
      if (from && to) {
        if (from === to) {
          if (hoveredDate && hoveredDate !== from) {
            const start = from < hoveredDate ? from : hoveredDate;
            const end = from < hoveredDate ? hoveredDate : from;
            if (dateStr === start) {
              classes.push('range-start');
            } else if (dateStr === end) {
              classes.push('range-end');
            } else if (dateStr > start && dateStr < end) {
              classes.push('in-range');
            }
          } else {
            if (dateStr === from) {
              classes.push('selected');
            }
          }
        } else {
          if (dateStr === from) {
            classes.push('range-start');
          } else if (dateStr === to) {
            classes.push('range-end');
          } else if (dateStr > from && dateStr < to) {
            classes.push('in-range');
          }
        }
      }
    }
    return classes.join(' ');
  };

  // Render Calendar Month Grid
  const renderCalendarCells = () => {
    const totalDays = daysInMonth(currentYear, currentMonth);
    const startOffset = firstDayIndex(currentYear, currentMonth);
    const cells = [];

    // Empty offset cells
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty" />);
    }

    // Days cells
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cellClass = getDayClasses(dateStr);

      cells.push(
        <button
          key={dateStr}
          type="button"
          onClick={() => handleDateClick(dateStr)}
          onMouseEnter={() => setHoveredDate(dateStr)}
          onMouseLeave={() => setHoveredDate(null)}
          className={cellClass}
        >
          {day}
        </button>
      );
    }

    return cells;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentBranchName = useMemo(() => {
    if (selectedBranchId === 'all') return 'All Outlets';
    const br = adminBranches.find(b => b.id === selectedBranchId);
    return br ? br.shortName : 'Outlets';
  }, [selectedBranchId]);

  return (
    <div className="admin-section">
      {error && (
        <div className="status-pill cancelled" style={{ display: 'block', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.85rem', color: '#fff', backgroundColor: '#ef4444' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      {/* 1. Header Overview Stats */}
      <div className="admin-card__title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <span>Revenue Dashboard — {currentBranchName}</span>
        <button type="button" onClick={handleExport} className="admin-button" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
          📥 Download Detailed Excel Report
        </button>
      </div>

      <div className="admin-grid admin-grid--3" style={{ marginBottom: 20 }}>
        {/* Today Overview Card */}
        <div className="admin-stat-card glass-panel">
          <div className="admin-stat-card__title">Today's Summary</div>
          <div className="admin-stat-card__value" style={{ color: '#10b981' }}>{formatVal(summary.today?.sales)}</div>
          <div style={{ fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '10px' }}>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Collected:</strong> <span style={{ color: '#047857' }}>{formatVal(summary.today?.collected)}</span>
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Outstanding:</strong> <span style={{ color: '#b45309' }}>{formatVal(summary.today?.outstanding)}</span>
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Surahi Cost:</strong> <span style={{ color: '#4b5563' }}>{formatVal(summary.today?.surahiCost)}</span>
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3px' }}>
              <strong>Gross Profit:</strong> <span style={{ color: '#10b981', fontWeight: 'bold' }}>{formatVal(summary.today?.profit)}</span>
            </span>
          </div>
        </div>

        {/* Monthly Overview Card */}
        <div className="admin-stat-card glass-panel">
          <div className="admin-stat-card__title">Monthly Summary</div>
          <div className="admin-stat-card__value" style={{ color: '#3b82f6' }}>{formatVal(summary.monthly?.sales)}</div>
          <div style={{ fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '10px' }}>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Collected:</strong> <span style={{ color: '#047857' }}>{formatVal(summary.monthly?.collected)}</span>
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Outstanding:</strong> <span style={{ color: '#b45309' }}>{formatVal(summary.monthly?.outstanding)}</span>
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Surahi Cost:</strong> <span style={{ color: '#4b5563' }}>{formatVal(summary.monthly?.surahiCost)}</span>
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3px' }}>
              <strong>Gross Profit:</strong> <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{formatVal(summary.monthly?.profit)}</span>
            </span>
          </div>
        </div>

        {/* Selected Period Stats Card */}
        <div className="admin-stat-card glass-panel" style={{ border: '1px solid rgba(16, 185, 129, 0.4)' }}>
          <div className="admin-stat-card__title" style={{ color: '#10b981' }}>Selected Period Summary</div>
          <div className="admin-stat-card__value">{formatVal(detailData.summary?.sales)}</div>
          <div style={{ fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '10px' }}>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Collected:</strong> <span style={{ color: '#047857' }}>{formatVal(detailData.summary?.collected)}</span>
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Outstanding:</strong> <span style={{ color: '#b45309' }}>{formatVal(detailData.summary?.outstanding)}</span>
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Surahi Cost:</strong> <span style={{ color: '#4b5563' }}>{formatVal(detailData.summary?.surahiCost)}</span>
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3px' }}>
              <strong>Gross Profit:</strong> <span style={{ color: '#10b981', fontWeight: 'bold' }}>{formatVal(detailData.summary?.profit)}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="admin-grid admin-grid--3" style={{ alignItems: 'flex-start', gap: 20 }}>
        {/* Calendar Picker Panel */}
        <div className="admin-card glass-panel" style={{ gridColumn: 'span 1' }}>
          <div className="admin-card__title">Select Report Dates</div>
          
          {/* Calendar Predefined Buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '15px' }}>
            {['Today', 'Yesterday', 'This Week', 'This Month', 'This Year'].map(period => (
              <button
                key={period}
                type="button"
                onClick={() => handlePredefinedPeriod(period)}
                className={`admin-button admin-button--compact ${activeTab === period ? '' : 'admin-button--secondary'}`}
                style={{ fontSize: '0.7rem', padding: '4px 8px' }}
              >
                {period}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setSelectedRange({ from: '', to: '' });
                setSelectedDates([]);
                setActiveTab('Custom');
              }}
              className="admin-button admin-button--compact admin-button--secondary"
              style={{ fontSize: '0.7rem', padding: '4px 8px', borderColor: '#ef4444', color: '#ef4444' }}
            >
              Clear
            </button>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: 10, marginBottom: '15px', fontSize: '0.75rem', fontWeight: 600 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#000' }}>
              <input
                type="radio"
                name="selectionMode"
                checked={selectionMode === 'range'}
                onChange={() => {
                  setSelectionMode('range');
                  setSelectedDates([]);
                }}
              />
              Date Range
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#000' }}>
              <input
                type="radio"
                name="selectionMode"
                checked={selectionMode === 'multiple'}
                onChange={() => {
                  setSelectionMode('multiple');
                  setSelectedRange({ from: '', to: '' });
                }}
              />
              Multiple Individual Dates
            </label>
          </div>

          {/* Month Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <button type="button" onClick={() => changeMonth(-1)} className="admin-button admin-button--compact" style={{ padding: '3px 8px' }}>◀</button>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#000' }}>{monthNames[currentMonth]} {currentYear}</span>
            <button type="button" onClick={() => changeMonth(1)} className="admin-button admin-button--compact" style={{ padding: '3px 8px' }}>▶</button>
          </div>

          {/* Calendar Widget */}
          <div className="calendar-grid">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="calendar-header-cell">{day}</div>
            ))}
            {renderCalendarCells()}
          </div>

          <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: '10px', lineHeight: 1.3 }}>
            {selectionMode === 'range' ? (
              <span><strong>Selected Range:</strong> {selectedRange.from || 'None'} to {selectedRange.to || 'None'}</span>
            ) : (
              <span><strong>Selected Dates ({selectedDates.length}):</strong> {selectedDates.slice(0, 3).join(', ')}{selectedDates.length > 3 ? '...' : ''}</span>
            )}
          </div>
        </div>

        {/* Selected Date(s) Orders Summary Table */}
        <div className="admin-card glass-panel" style={{ gridColumn: 'span 2' }}>
          <div className="admin-card__title">Orders in Selection ({detailData.orders?.length || 0})</div>
          
          {loading ? (
            <div className="admin-empty-state">Loading selection data…</div>
          ) : detailData.orders?.length === 0 ? (
            <div className="admin-empty-state">No order transactions found for this period.</div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table" style={{ fontSize: '0.78rem' }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Source</th>
                    <th>Date</th>
                    <th>Total Bill</th>
                    <th>Collected</th>
                    <th>Surahi Cost</th>
                    <th>Gross Profit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detailData.orders.map(order => (
                    <tr key={order.orderId} className={order.status === 'Cancelled' ? 'cancelled-row-opacity' : ''}>
                      <td style={{ fontWeight: 'bold' }}>{order.orderId}</td>
                      <td>{order.customerName}</td>
                      <td>
                        <span className={`source-badge ${order.type === 'Website' ? 'website' : 'walkin'}`}>
                          {order.type}
                        </span>
                      </td>
                      <td>{new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                      <td>{formatVal(order.bill)}</td>
                      <td style={{ color: '#047857' }}>{formatVal(order.collected)}</td>
                      <td style={{ color: '#4b5563' }}>{formatVal(order.surahiCost)}</td>
                      <td style={{ fontWeight: 'bold', color: order.status === 'Cancelled' ? '#94a3b8' : '#10b981' }}>
                        {order.status === 'Cancelled' ? '—' : formatVal(order.bill - order.surahiCost)}
                      </td>
                      <td>
                        <span className={`status-pill ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
