import React, { useEffect, useState, useMemo } from 'react';
import API from '../../api/api';
import { useAdminBranch } from '../../context/AdminBranchContext.jsx';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import '../../styles/admin.css';

// --- PIE / DONUT ARC CALCULATORS ---
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

// --- SUBCOMPONENT: BUSINESS HEALTH ITEM ---
function BusinessHealthItem({ title, status, value, change }) {
  const statusColors = {
    GOOD: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', text: '#065f46', emoji: '🟢' },
    WATCH: { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', text: '#78350f', emoji: '🟡' },
    ATTENTION: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#7f1d1d', emoji: '🔴' }
  };
  const config = statusColors[status] || statusColors.WATCH;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid rgba(15, 23, 42, 0.12)',
      borderRadius: '12px',
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      position: 'relative',
      zIndex: 5
    }}>
      <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{value}</span>
        <span style={{
          fontSize: '0.9rem',
          fontWeight: 800,
          padding: '2px 6px',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>{config.emoji}</span>
      </div>
      {change && <span style={{ fontSize: '0.66rem', color: '#64748b' }}>{change}</span>}
    </div>
  );
}

// --- SUBCOMPONENT: SEGMENTED CHART SWITCHER ---
function ChartSwitcher({ selected, options, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
      {options.map(opt => {
        const isActive = selected === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              fontSize: '0.66rem',
              border: 'none',
              padding: '3px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 700,
              transition: 'all 0.15s ease',
              background: isActive ? '#ffffff' : 'transparent',
              color: isActive ? '#0f172a' : '#64748b',
              boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// --- SUBCOMPONENT: PIE / DONUT VECTOR CHART ---
function SVGDonutPie({ data, isDonut = false, formatValFn }) {
  const total = data.reduce((sum, item) => sum + item.val, 0);
  if (total <= 0) {
    return (
      <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
        No data in this period
      </div>
    );
  }

  const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#64748b'];
  let accumulatedAngle = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, width: '100%', minHeight: '180px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <div style={{ width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {data.map((item, idx) => {
            const percentage = (item.val / total) * 100;
            const sliceAngle = (item.val / total) * 360;
            const startAngle = accumulatedAngle;
            const endAngle = accumulatedAngle + sliceAngle;
            accumulatedAngle = endAngle;

            const radStart = (startAngle - 90) * Math.PI / 180.0;
            const radEnd = (endAngle - 90) * Math.PI / 180.0;

            const x = 100;
            const y = 100;
            const r = 80;
            const rInner = isDonut ? 50 : 0;

            let pathD = '';
            if (isDonut) {
              const x1_outer = x + r * Math.cos(radStart);
              const y1_outer = y + r * Math.sin(radStart);
              const x2_outer = x + r * Math.cos(radEnd);
              const y2_outer = y + r * Math.sin(radEnd);

              const x1_inner = x + rInner * Math.cos(radEnd);
              const y1_inner = y + rInner * Math.sin(radEnd);
              const x2_inner = x + rInner * Math.cos(radStart);
              const y2_inner = y + rInner * Math.sin(radStart);

              const largeArcOuter = sliceAngle > 180 ? '1' : '0';

              pathD = `
                M ${x1_outer} ${y1_outer}
                A ${r} ${r} 0 ${largeArcOuter} 1 ${x2_outer} ${y2_outer}
                L ${x1_inner} ${y1_inner}
                A ${rInner} ${rInner} 0 ${largeArcOuter} 0 ${x2_inner} ${y2_inner}
                Z
              `;
            } else {
              const x1 = x + r * Math.cos(radStart);
              const y1 = y + r * Math.sin(radStart);
              const x2 = x + r * Math.cos(radEnd);
              const y2 = y + r * Math.sin(radEnd);

              const largeArc = sliceAngle > 180 ? '1' : '0';

              pathD = `
                M ${x} ${y}
                L ${x1} ${y1}
                A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}
                Z
              `;
            }

            return (
              <path
                key={idx}
                d={pathD}
                fill={colors[idx % colors.length]}
                stroke="#ffffff"
                strokeWidth="1.5"
                style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
              >
                <title>{`${item.label}: ${formatValFn ? formatValFn(item.val) : item.val} (${percentage.toFixed(0)}%)`}</title>
              </path>
            );
          })}
        </svg>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '145px', overflowY: 'auto', fontSize: '0.72rem', minWidth: '135px' }}>
        {data.map((item, idx) => {
          const percentage = (item.val / total) * 100;
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155' }}>
              <div style={{ width: 10, height: 10, borderRadius: '2px', flexShrink: 0, background: colors[idx % colors.length] }} />
              <span style={{ fontWeight: 'bold' }}>{percentage.toFixed(0)}%</span>
              <span style={{ color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- SUBCOMPONENT: HORIZONTAL BAR CHART ---
function HorizontalBarChart({ data, formatValFn }) {
  const maxVal = Math.max(...data.map(d => d.val), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '5px 0' }}>
      {data.map((item, idx) => {
        const pct = (item.val / maxVal) * 100;
        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 600, color: '#334155' }}>
              <span>{item.label}</span>
              <span>{formatValFn ? formatValFn(item.val) : item.val}</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(15,23,42,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--admin-primary)', borderRadius: '4px', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- SUBCOMPONENT: UNIVERSAL CHART (LINE, AREA, VERTICAL BAR) ---
function UniversalChart({ points, ticks, tickYPositions, type, color = 'var(--admin-primary)', formatValFn, width, height, paddingLeft, paddingRight, paddingTop, paddingBottom, path, areaPath, isBar = false, typeLabel = 'Value' }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const interval = Math.max(1, Math.ceil(points.length / 7));

  const plotWidth = width - paddingLeft - paddingRight;
  const barWidth = Math.max(4, Math.round((plotWidth / Math.max(points.length, 1)) * 0.5));

  return (
    <div className="chart-container-wrapper" style={{ position: 'relative', width: '100%' }}>
      {/* Tooltip Overlay */}
      {hoveredPoint && (
        <div
          className="custom-chart-tooltip"
          style={{
            left: `${hoveredPoint.x + 10}px`,
            top: `${hoveredPoint.y - 60}px`,
            opacity: 1
          }}
        >
          <div className="custom-chart-tooltip-date">{hoveredPoint.label}</div>
          <div className="custom-chart-tooltip-row">
            <span>{typeLabel}:</span>
            <span style={{ fontWeight: 'bold' }}>{formatValFn ? formatValFn(hoveredPoint.val) : hoveredPoint.val}</span>
          </div>
        </div>
      )}

      <div style={{ position: 'relative', width: '100%', height: '180px' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id={`grad-insights-${typeLabel}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {ticks.map((tick, i) => {
            const y = tickYPositions[i];
            return (
              <g key={i}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(15,23,42,0.06)" strokeDasharray="3 3" />
                <text x={paddingLeft - 8} y={y} textAnchor="end" dominantBaseline="middle" fill="#475569" style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                  {formatValFn ? formatValFn(tick) : tick}
                </text>
              </g>
            );
          })}

          <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Area */}
          {!isBar && areaPath && <path d={areaPath} fill={`url(#grad-insights-${typeLabel})`} />}
          {/* Line */}
          {!isBar && path && <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Bars */}
          {isBar && points.map((pt, idx) => {
            const barHeight = Math.max(2, height - paddingBottom - pt.y);
            return (
              <rect
                key={idx}
                x={pt.x - barWidth / 2}
                y={pt.y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="1"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
              />
            );
          })}

          {/* Data point dots (Line/Area) */}
          {!isBar && points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint && hoveredPoint.label === pt.label ? 6 : 3.5}
              fill="#ffffff"
              stroke={color}
              strokeWidth="2"
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
            />
          ))}

          {/* X Axis Labels */}
          {points.map((pt, idx) => {
            if (idx % interval === 0 || idx === points.length - 1) {
              return (
                <g key={idx}>
                  <line x1={pt.x} y1={height - paddingBottom} x2={pt.x} y2={height - paddingBottom + 4} stroke="#cbd5e1" strokeWidth="1" />
                  <text x={pt.x} y={height - paddingBottom + 16} textAnchor="middle" fill="#475569" style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                    {pt.label}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Axis Titles */}
          <text x={paddingLeft - 10} y={paddingTop - 8} textAnchor="start" fill="#334155" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {typeLabel === 'Revenue' ? 'Revenue (₹)' : 'Orders Count'}
          </text>
          <text x={paddingLeft + (width - paddingLeft - paddingRight) / 2} y={height - 8} textAnchor="middle" fill="#334155" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Timeline Period
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const { selectedBranchId, availableBranches, setSelectedBranchId } = useAdminBranch();
  const { logout } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Filters & periods
  const [activeTab, setActiveTab] = useState('This Month');
  const [selectionMode, setSelectionMode] = useState('range');
  const [comparePrevious, setComparePrevious] = useState(true);
  const [trendMode, setTrendMode] = useState('daily');

  const [selectedRange, setSelectedRange] = useState({ from: '', to: '' });
  const [selectedDates, setSelectedDates] = useState([]);

  // Chart type selections
  const [chartTypes, setChartTypes] = useState({
    revenueTrend: 'Line',
    ordersTrend: 'Line',
    serviceContribution: 'Bar',
    paymentMethods: 'Donut',
    outletPerformance: 'Bar',
    customerAnalytics: 'Donut',
    dryCleaning: 'Bar',
    inventoryTally: 'Bar'
  });

  // Local boundaries calculator
  const handlePredefinedPeriod = (period) => {
    setActiveTab(period);
    setSelectionMode('range');
    const today = new Date();

    if (period === 'Today') {
      const dStr = today.toISOString().slice(0, 10);
      setSelectedRange({ from: dStr, to: dStr });
    } else if (period === 'This Week') {
      const currentDay = today.getDay();
      const first = today.getDate() - currentDay;
      const start = new Date(today.getFullYear(), today.getMonth(), first, 0, 0, 0, 0);
      const end = new Date(today.getFullYear(), today.getMonth(), first + 6, 23, 59, 59, 999);
      setSelectedRange({
        from: start.toISOString().slice(0, 10),
        to: end.toISOString().slice(0, 10)
      });
    } else if (period === 'This Month') {
      const startStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const endStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      setSelectedRange({ from: startStr, to: endStr });
    } else if (period === 'This Year') {
      setSelectedRange({
        from: `${today.getFullYear()}-01-01`,
        to: `${today.getFullYear()}-12-31`
      });
    }
  };

  useEffect(() => {
    handlePredefinedPeriod('This Month');
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          trendMode
        };
        if (selectedBranchId && selectedBranchId !== 'all') {
          params.branch = selectedBranchId;
        }

        if (activeTab === 'Custom') {
          if (selectionMode === 'range') {
            if (selectedRange.from) params.from = selectedRange.from;
            if (selectedRange.to) params.to = selectedRange.to;
          } else {
            if (selectedDates.length > 0) params.dates = selectedDates.join(',');
          }
        } else {
          if (selectedRange.from) params.from = selectedRange.from;
          if (selectedRange.to) params.to = selectedRange.to;
        }

        const response = await API.get('/api/analytics', { params });
        setData(response.data);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Redirecting to login…');
          setTimeout(() => logout(), 2000);
        } else {
          setError(err.response?.data?.message || 'Failed to load analytics. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (activeTab !== 'Custom' || (selectionMode === 'range' && selectedRange.from && selectedRange.to) || (selectionMode === 'multiple' && selectedDates.length > 0)) {
      fetchAnalytics();
    }
  }, [selectedBranchId, activeTab, selectedRange, selectedDates, selectionMode, trendMode]);

  const handleDateClick = (dateStr) => {
    if (selectionMode === 'multiple') {
      setSelectedDates(prev =>
        prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
      );
    }
  };

  // Trend mapping calculations
  const svgChartsData = useMemo(() => {
    if (!data || !data.trends || data.trends.length === 0) return null;
    const trends = data.trends;

    const maxRev = Math.max(...trends.map(t => t.revenue), 100);
    const maxOrders = Math.max(...trends.map(t => t.orders), 5);

    const width = 550;
    const height = 180;
    const paddingLeft = 60;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 45;

    const pointsRev = trends.map((t, idx) => {
      const x = paddingLeft + (idx * (width - paddingLeft - paddingRight)) / Math.max(trends.length - 1, 1);
      const y = height - paddingBottom - (t.revenue * (height - paddingTop - paddingBottom)) / maxRev;
      return { x, y, val: t.revenue, label: t.label };
    });

    const pointsOrders = trends.map((t, idx) => {
      const x = paddingLeft + (idx * (width - paddingLeft - paddingRight)) / Math.max(trends.length - 1, 1);
      const y = height - paddingBottom - (t.orders * (height - paddingTop - paddingBottom)) / maxOrders;
      return { x, y, val: t.orders, label: t.label };
    });

    const pathRev = pointsRev.reduce((acc, p, idx) => {
      return acc + `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }, '');

    const pathOrders = pointsOrders.reduce((acc, p, idx) => {
      return acc + `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }, '');

    const areaRev = pathRev
      ? `${pathRev} L ${pointsRev[pointsRev.length - 1].x.toFixed(1)} ${(height - paddingBottom).toFixed(1)} L ${pointsRev[0].x.toFixed(1)} ${(height - paddingBottom).toFixed(1)} Z`
      : '';

    const areaOrders = pathOrders
      ? `${pathOrders} L ${pointsOrders[pointsOrders.length - 1].x.toFixed(1)} ${(height - paddingBottom).toFixed(1)} L ${pointsOrders[0].x.toFixed(1)} ${(height - paddingBottom).toFixed(1)} Z`
      : '';

    const ticksRev = [0, Math.round(maxRev * 0.25), Math.round(maxRev * 0.5), Math.round(maxRev * 0.75), Math.round(maxRev)];
    const ticksOrders = [0, Math.round(maxOrders * 0.25), Math.round(maxOrders * 0.5), Math.round(maxOrders * 0.75), Math.round(maxOrders)];

    const tickYPositionsRev = ticksRev.map(val => height - paddingBottom - (val * (height - paddingTop - paddingBottom)) / maxRev);
    const tickYPositionsOrders = ticksOrders.map(val => height - paddingBottom - (val * (height - paddingTop - paddingBottom)) / maxOrders);

    return {
      pointsRev,
      pointsOrders,
      pathRev,
      pathOrders,
      areaRev,
      areaOrders,
      ticksRev,
      ticksOrders,
      tickYPositionsRev,
      tickYPositionsOrders,
      width,
      height,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom
    };
  }, [data]);

  const formatCurrency = (val) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

  // Period comparison mapping details
  const renderDetailedComparison = (current, previous, isCurrency = false) => {
    if (!comparePrevious || previous === undefined || previous === null) return null;
    const diff = current - previous;
    let pctLabel = '';
    let isPositive = diff >= 0;

    if (previous <= 0) {
      pctLabel = current > 0 ? 'New Activity' : 'No prior data';
    } else {
      const pct = (diff / previous) * 100;
      pctLabel = `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`;
    }

    const color = diff > 0 ? '#059669' : (diff < 0 ? '#b91c1c' : '#64748b');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 6, fontSize: '0.72rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
          <span>Previous:</span>
          <span style={{ fontWeight: 'bold' }}>{isCurrency ? formatCurrency(previous) : previous.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color }}>
          <span>Change:</span>
          <span>
            {diff > 0 ? '+' : ''}{isCurrency ? formatCurrency(diff) : diff.toLocaleString()} ({pctLabel})
          </span>
        </div>
      </div>
    );
  };

  // Status mapping getters
  const getRevenueHealth = () => {
    if (!data) return { status: 'WATCH', val: '₹0', change: '' };
    const cur = data.kpis.revenue;
    const prev = data.kpis.prevRevenue;
    const diff = cur - prev;
    const rate = prev > 0 ? (diff / prev) * 100 : 0;
    
    let status = 'WATCH';
    if (rate >= 10 || cur > 2000) status = 'GOOD';
    if (rate < 0) status = 'ATTENTION';

    return { status, val: formatCurrency(cur), change: prev > 0 ? `${rate >= 0 ? '+' : ''}${rate.toFixed(0)}% vs prev` : 'First period' };
  };

  const getOrderHealth = () => {
    if (!data) return { status: 'WATCH', val: '0', change: '' };
    const cur = data.kpis.orders;
    const prev = data.kpis.prevOrders;
    const diff = cur - prev;
    const rate = prev > 0 ? (diff / prev) * 100 : 0;

    let status = 'WATCH';
    if (rate >= 10 || cur > 20) status = 'GOOD';
    if (rate < 0) status = 'ATTENTION';

    return { status, val: `${cur} orders`, change: prev > 0 ? `${rate >= 0 ? '+' : ''}${rate.toFixed(0)}% vs prev` : 'First period' };
  };

  const getCustomerHealth = () => {
    if (!data) return { status: 'WATCH', val: '0%', change: '' };
    const rate = data.customers.repeatRate;
    let status = 'WATCH';
    if (rate >= 50) status = 'GOOD';
    if (rate < 30) status = 'ATTENTION';
    return { status, val: `${rate.toFixed(0)}%`, change: 'Repeat Customer Rate' };
  };

  const getProfitHealth = () => {
    if (!data) return { status: 'WATCH', val: '0%', change: '' };
    const rev = data.kpis.revenue;
    const profit = data.kpis.netProfit;
    const rate = rev > 0 ? (profit / rev) * 100 : 0;

    let status = 'WATCH';
    if (rate >= 70) status = 'GOOD';
    if (rate < 50) status = 'ATTENTION';

    return { status, val: `${rate.toFixed(0)}%`, change: `Profit margin` };
  };

  const getCollectionHealth = () => {
    if (!data) return { status: 'WATCH', val: '0%', change: '' };
    const rev = data.kpis.revenue;
    const collected = data.kpis.amountCollected;
    const rate = rev > 0 ? (collected / rev) * 100 : 0;

    let status = 'WATCH';
    if (rate >= 90) status = 'GOOD';
    if (rate < 75) status = 'ATTENTION';

    return { status, val: `${rate.toFixed(0)}%`, change: 'Collection Rate' };
  };

  const getInventoryHealth = () => {
    if (!data) return { status: 'GOOD', val: '0 alerts', change: '' };
    const critical = data.inventory.counts.critical || 0;
    const low = data.inventory.counts.low || 0;

    let status = 'GOOD';
    if (low > 0) status = 'WATCH';
    if (critical > 0) status = 'ATTENTION';

    return { status, val: `${critical} critical`, change: `${low} low stock items` };
  };

  return (
    <div className="analytics-page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="analytics-background-accent" />
      
      {/* 1. HEADER & PERIOD FILTERS */}
      <div className="analytics-filter-bar glass-panel" style={{ background: '#ffffff', border: '1px solid rgba(15, 23, 42, 0.12)', padding: 18, borderRadius: 16, marginBottom: 0 }}>
        <div className="analytics-filter-bar-header">
          <div>
            <h1 className="analytics-title" style={{ fontSize: '1.45rem', fontWeight: 800 }}>💡 Insights & Intelligence</h1>
            <p className="analytics-subtitle" style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0' }}>Professional Business Intelligence and Decision Support Dashboard</p>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            {/* Inactive button solid dark text, Active button strong blue/white text selector tabs */}
            <div style={{ display: 'flex', gap: '6px', padding: '3px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {['Today', 'This Week', 'This Month', 'Custom'].map(period => {
                const isActive = activeTab === period;
                return (
                  <button
                    key={period}
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      border: 'none',
                      outline: 'none',
                      background: isActive ? '#2563eb' : 'transparent',
                      color: isActive ? '#ffffff' : '#475569',
                      boxShadow: isActive ? '0 2px 4px rgba(37,99,235,0.3)' : 'none'
                    }}
                    onClick={() => {
                      if (period === 'Custom') {
                        setActiveTab('Custom');
                      } else {
                        handlePredefinedPeriod(period);
                      }
                    }}
                  >
                    {period}
                  </button>
                );
              })}
            </div>

            {/* Branch selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                className="admin-select"
                value={selectedBranchId}
                onChange={(event) => setSelectedBranchId(event.target.value)}
                style={{ padding: '6px 12px', fontSize: '0.82rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontWeight: '700', height: 32 }}
              >
                {availableBranches.map((branch) => (
                  <option key={branch.id} value={branch.id} style={{ color: '#0f172a' }}>
                    {branch.shortName}
                  </option>
                ))}
              </select>
            </div>

            {/* Comparison toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer', color: '#0f172a', fontWeight: '700' }}>
              <input
                type="checkbox"
                checked={comparePrevious}
                onChange={(e) => setComparePrevious(e.target.checked)}
                style={{ width: '15px', height: '15px', accentColor: '#2563eb' }}
              />
              Compare period
            </label>
          </div>
        </div>

        {/* Custom Range selection inputs */}
        {activeTab === 'Custom' && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label style={{ fontSize: '0.78rem', color: '#334155', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="radio"
                  name="customSelectionMode"
                  checked={selectionMode === 'range'}
                  onChange={() => setSelectionMode('range')}
                  style={{ accentColor: '#2563eb' }}
                />
                Range Selector
              </label>
              <label style={{ fontSize: '0.78rem', color: '#334155', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="radio"
                  name="customSelectionMode"
                  checked={selectionMode === 'multiple'}
                  onChange={() => setSelectionMode('multiple')}
                  style={{ accentColor: '#2563eb' }}
                />
                Specific Dates
              </label>
            </div>

            {selectionMode === 'range' ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="date"
                  className="admin-input"
                  style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', height: 28 }}
                  value={selectedRange.from}
                  onChange={(e) => setSelectedRange(prev => ({ ...prev, from: e.target.value }))}
                />
                <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>to</span>
                <input
                  type="date"
                  className="admin-input"
                  style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', height: 28 }}
                  value={selectedRange.to}
                  onChange={(e) => setSelectedRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <input
                  type="date"
                  className="admin-input"
                  style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', height: 28 }}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleDateClick(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedDates.map(d => (
                    <span
                      key={d}
                      onClick={() => handleDateClick(d)}
                      style={{ fontSize: '0.7rem', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}
                    >
                      {d} ✕
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {loading && <div className="analytics-card" style={{ textAlign: 'center', padding: '50px 20px', color: '#0f172a', fontWeight: 'bold', fontSize: '1.1rem', background: '#ffffff', border: '1px solid rgba(15, 23, 42, 0.12)', borderRadius: 20 }}>⌛ Calculating business intelligence analytics…</div>}
      {error && <div className="analytics-card" style={{ color: '#EF4444', textAlign: 'center', padding: '40px 20px', fontWeight: 'bold', background: '#ffffff', border: '1px solid rgba(15, 23, 42, 0.12)', borderRadius: 20 }}>⚠️ {error}</div>}

      {!loading && !error && data && (
        <>
          {/* 2. BUSINESS HEALTH STATUS GRID */}
          <div className="admin-grid admin-grid--6" style={{ position: 'relative', zIndex: 5 }}>
            <BusinessHealthItem title="Revenue Health" {...getRevenueHealth()} />
            <BusinessHealthItem title="Order Health" {...getOrderHealth()} />
            <BusinessHealthItem title="Customer Retention" {...getCustomerHealth()} />
            <BusinessHealthItem title="Profit Margin" {...getProfitHealth()} />
            <BusinessHealthItem title="Collection Health" {...getCollectionHealth()} />
            <BusinessHealthItem title="Inventory Alerts" {...getInventoryHealth()} />
          </div>

          {/* 3. KEY FINANCIAL METRICS */}
          <div className="analytics-kpi-grid">
            <div className="analytics-card analytics-kpi-card glass-panel" style={{ marginBottom: 0 }}>
              <div className="analytics-kpi-header">
                <span className="analytics-card-title">Total Revenue</span>
                <div className="analytics-kpi-icon revenue">💰</div>
              </div>
              <div>
                <div className="analytics-card-value">{formatCurrency(data.kpis.revenue)}</div>
                {renderDetailedComparison(data.kpis.revenue, data.kpis.prevRevenue, true)}
              </div>
              <span className="analytics-card-sublabel" style={{ borderTop: 'none', padding: 0 }}>Gross billing period sales</span>
            </div>

            <div className="analytics-card analytics-kpi-card glass-panel" style={{ marginBottom: 0 }}>
              <div className="analytics-kpi-header">
                <span className="analytics-card-title">Net Profit</span>
                <div className="analytics-kpi-icon profit">💵</div>
              </div>
              <div>
                <div className="analytics-card-value" style={{ color: data.kpis.netProfit >= 0 ? '#059669' : '#b91c1c' }}>
                  {formatCurrency(data.kpis.netProfit)}
                </div>
                {renderDetailedComparison(data.kpis.netProfit, data.kpis.prevNetProfit, true)}
              </div>
              <span className="analytics-card-sublabel" style={{ borderTop: 'none', padding: 0 }}>Revenue minus Surahi cost</span>
            </div>

            <div className="analytics-card analytics-kpi-card glass-panel" style={{ marginBottom: 0 }}>
              <div className="analytics-kpi-header">
                <span className="analytics-card-title">Average Order Value</span>
                <div className="analytics-kpi-icon aov">🧺</div>
              </div>
              <div>
                <div className="analytics-card-value">{formatCurrency(data.kpis.aov)}</div>
                {renderDetailedComparison(data.kpis.aov, data.kpis.prevAov, true)}
              </div>
              <span className="analytics-card-sublabel" style={{ borderTop: 'none', padding: 0 }}>Average invoice ticket size</span>
            </div>

            <div className="analytics-card analytics-kpi-card glass-panel" style={{ marginBottom: 0 }}>
              <div className="analytics-kpi-header">
                <span className="analytics-card-title">Amount Collected</span>
                <div className="analytics-kpi-icon revenue" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)' }}>💸</div>
              </div>
              <div>
                <div className="analytics-card-value" style={{ color: '#059669' }}>{formatCurrency(data.kpis.amountCollected)}</div>
                {renderDetailedComparison(data.kpis.amountCollected, data.kpis.prevWebsiteRevenue, true)}
              </div>
              <span className="analytics-card-sublabel" style={{ borderTop: 'none', padding: 0 }}>Cash received in hand</span>
            </div>

            <div className="analytics-card analytics-kpi-card glass-panel" style={{ marginBottom: 0 }}>
              <div className="analytics-kpi-header">
                <span className="analytics-card-title">Outstanding Amount</span>
                <div className="analytics-kpi-icon profit" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>⚠️</div>
              </div>
              <div>
                <div className="analytics-card-value" style={{ color: '#ef4444' }}>{formatCurrency(data.kpis.outstandingAmount)}</div>
                {renderDetailedComparison(data.kpis.outstandingAmount, data.kpis.prevPendingOrders, true)}
              </div>
              <span className="analytics-card-sublabel" style={{ borderTop: 'none', padding: 0 }}>Billed dues yet to collect</span>
            </div>

            <div className="analytics-card analytics-kpi-card glass-panel" style={{ marginBottom: 0 }}>
              <div className="analytics-kpi-header">
                <span className="analytics-card-title">Revenue Growth %</span>
                <div className="analytics-kpi-icon growth">📈</div>
              </div>
              <div>
                <div className="analytics-card-value" style={{ color: data.kpis.revenueGrowth >= 0 ? '#10B981' : '#EF4444' }}>
                  {data.kpis.revenueGrowth.toFixed(0)}%
                </div>
                {renderDetailedComparison(data.kpis.revenueGrowth, 0, false)}
              </div>
              <span className="analytics-card-sublabel" style={{ borderTop: 'none', padding: 0 }}>Period over period growth</span>
            </div>
          </div>

          {/* 4. REVENUE ANALYTICS */}
          <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>Revenue Trend</span>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0' }}>Timeline distribution of total billing revenue generated</p>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Segmented Daily/Weekly/Monthly switcher */}
                <div style={{ display: 'flex', gap: '5px', padding: '2px', background: '#f1f5f9', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  {['daily', 'weekly', 'monthly'].map(mode => {
                    const isActive = trendMode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => setTrendMode(mode)}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.66rem',
                          fontWeight: '700',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          border: 'none',
                          outline: 'none',
                          background: isActive ? '#ffffff' : 'transparent',
                          color: isActive ? '#0f172a' : '#64748b',
                          boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                        }}
                      >
                        {mode.toUpperCase()}
                      </button>
                    );
                  })}
                </div>

                <ChartSwitcher
                  selected={chartTypes.revenueTrend}
                  options={['Line', 'Area', 'Bar']}
                  onChange={val => setChartTypes({ ...chartTypes, revenueTrend: val })}
                />
              </div>
            </div>

            {svgChartsData && svgChartsData.pathRev ? (
              <UniversalChart
                points={svgChartsData.pointsRev}
                ticks={svgChartsData.ticksRev}
                tickYPositions={svgChartsData.tickYPositionsRev}
                type={chartTypes.revenueTrend}
                color="var(--admin-primary)"
                formatValFn={formatCurrency}
                width={svgChartsData.width}
                height={svgChartsData.height}
                paddingLeft={svgChartsData.paddingLeft}
                paddingRight={svgChartsData.paddingRight}
                paddingTop={svgChartsData.paddingTop}
                paddingBottom={svgChartsData.paddingBottom}
                path={svgChartsData.pathRev}
                areaPath={svgChartsData.areaRev}
                isBar={chartTypes.revenueTrend === 'Bar'}
                typeLabel="Revenue"
              />
            ) : (
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', border: '1px dashed rgba(0,0,0,0.1)' }}>
                No data available for this period.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, fontSize: '0.78rem', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span>Total: <strong>{formatCurrency(data.kpis.revenue)}</strong></span>
              <span>AOV: <strong>{formatCurrency(data.kpis.aov)}</strong></span>
              <span>Collected: <strong>{formatCurrency(data.kpis.amountCollected)}</strong></span>
              <span>Outstanding: <strong style={{ color: '#ef4444' }}>{formatCurrency(data.kpis.outstandingAmount)}</strong></span>
            </div>
          </div>

          {/* 5. ORDER ANALYTICS */}
          <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>Orders Trend</span>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0' }}>Timeline distribution of total order volumes processed</p>
              </div>

              <ChartSwitcher
                selected={chartTypes.ordersTrend}
                options={['Line', 'Area', 'Bar']}
                onChange={val => setChartTypes({ ...chartTypes, ordersTrend: val })}
              />
            </div>

            {svgChartsData && svgChartsData.pathOrders ? (
              <UniversalChart
                points={svgChartsData.pointsOrders}
                ticks={svgChartsData.ticksOrders}
                tickYPositions={svgChartsData.tickYPositionsOrders}
                type={chartTypes.ordersTrend}
                color="#3B82F6"
                width={svgChartsData.width}
                height={svgChartsData.height}
                paddingLeft={svgChartsData.paddingLeft}
                paddingRight={svgChartsData.paddingRight}
                paddingTop={svgChartsData.paddingTop}
                paddingBottom={svgChartsData.paddingBottom}
                path={svgChartsData.pathOrders}
                areaPath={svgChartsData.areaOrders}
                isBar={chartTypes.ordersTrend === 'Bar'}
                typeLabel="Orders"
              />
            ) : (
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', border: '1px dashed rgba(0,0,0,0.1)' }}>
                No data available for this period.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, fontSize: '0.78rem', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span>Total Orders: <strong>{data.kpis.orders}</strong></span>
              <span>Pending Orders: <strong>{data.kpis.pendingOrders}</strong></span>
              <span>Completion Rate: <strong>{data.kpis.orders > 0 ? (((data.kpis.orders - data.kpis.pendingOrders) / data.kpis.orders) * 100).toFixed(0) : 100}%</strong></span>
              <span>Cancellation Rate: <strong>0%</strong></span>
            </div>
          </div>

          {/* 6. SERVICE PERFORMANCE */}
          <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>🏆 Service Contribution</span>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0' }}>Revenue contribution and profitability shares per service type</p>
              </div>

              <ChartSwitcher
                selected={chartTypes.serviceContribution}
                options={['Bar', 'Horizontal Bar', 'Pie', 'Donut']}
                onChange={val => setChartTypes({ ...chartTypes, serviceContribution: val })}
              />
            </div>

            {data.services.list.length === 0 ? (
              <div className="admin-empty-state">No services recorded in this period.</div>
            ) : (
              <div className="admin-grid admin-grid--2" style={{ gap: 24, alignItems: 'center' }}>
                <div>
                  {chartTypes.serviceContribution === 'Horizontal Bar' ? (
                    <HorizontalBarChart
                      data={data.services.list.map(s => ({ label: s.name, val: s.revenue }))}
                      formatValFn={formatCurrency}
                    />
                  ) : (
                    chartTypes.serviceContribution === 'Bar' ? (
                      <UniversalChart
                        points={data.services.list.map((s, idx) => {
                          const width = 550;
                          const paddingLeft = 60;
                          const paddingRight = 20;
                          const plotWidth = width - paddingLeft - paddingRight;
                          const x = paddingLeft + (idx * plotWidth) / Math.max(data.services.list.length - 1, 1);
                          const max = Math.max(...data.services.list.map(i => i.revenue), 10);
                          const y = 180 - 45 - (s.revenue * (180 - 25 - 45)) / max;
                          return { x, y, val: s.revenue, label: s.name };
                        })}
                        ticks={[0, Math.round(Math.max(...data.services.list.map(i => i.revenue), 10) * 0.5), Math.round(Math.max(...data.services.list.map(i => i.revenue), 10))]}
                        tickYPositions={[180 - 45, 25 + (180-25-45)/2, 25]}
                        type="Bar"
                        color="var(--admin-primary)"
                        formatValFn={formatCurrency}
                        width={550}
                        height={180}
                        paddingLeft={60}
                        paddingRight={20}
                        paddingTop={25}
                        paddingBottom={45}
                        typeLabel="Revenue"
                      />
                    ) : (
                      <SVGDonutPie
                        data={data.services.list.map(s => ({ label: s.name, val: s.revenue }))}
                        isDonut={chartTypes.serviceContribution === 'Donut'}
                        formatValFn={formatCurrency}
                      />
                    )
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.services.list.slice(0, 3).map((s, idx) => (
                    <div key={s.name} style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#1e293b', marginBottom: 4 }}>
                        <span>#{idx + 1} {s.name}</span>
                        <span>{formatCurrency(s.revenue)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.72rem' }}>
                        <span>Share: <strong>{s.revenuePercentage.toFixed(0)}%</strong> ({s.orders} orders)</span>
                        <span>Profit: <strong style={{ color: '#059669' }}>{formatCurrency(s.profit)}</strong> ({((s.profit / (s.revenue || 1)) * 100).toFixed(0)}% margin)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7. OUTLET PERFORMANCE */}
          <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>🏢 Outlet / Branch Performance</span>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0' }}>Operational billing details of valid store outlets</p>
              </div>

              <ChartSwitcher
                selected={chartTypes.outletPerformance}
                options={['Bar', 'Donut']}
                onChange={val => setChartTypes({ ...chartTypes, outletPerformance: val })}
              />
            </div>

            <div className="admin-grid admin-grid--2" style={{ gap: 24, alignItems: 'center' }}>
              <div>
                {chartTypes.outletPerformance === 'Bar' ? (
                  <HorizontalBarChart
                    data={data.outlets.list.map(o => {
                      let cleanName = o.name.replace('Mr. WashWala - ', '');
                      if (cleanName.includes('2nd Stage')) cleanName = 'Vijayanagar 2nd Stage';
                      if (cleanName.includes('4th Stage')) cleanName = 'Vijayanagar 4th Stage';
                      if (cleanName.includes('1st Stage')) cleanName = 'Kuvempunagar 1st Stage';
                      return { label: cleanName, val: o.revenue };
                    })}
                    formatValFn={formatCurrency}
                  />
                ) : (
                  <SVGDonutPie
                    data={data.outlets.list.map(o => {
                      let cleanName = o.name.replace('Mr. WashWala - ', '');
                      if (cleanName.includes('2nd Stage')) cleanName = 'Vijayanagar 2nd Stage';
                      if (cleanName.includes('4th Stage')) cleanName = 'Vijayanagar 4th Stage';
                      if (cleanName.includes('1st Stage')) cleanName = 'Kuvempunagar 1st Stage';
                      return { label: cleanName, val: o.revenue };
                    })}
                    isDonut={true}
                    formatValFn={formatCurrency}
                  />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.outlets.best && (
                  <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)', padding: 12, borderRadius: 8, fontSize: '0.78rem' }}>
                    👑 <strong>Star Branch:</strong> {data.outlets.best.name.replace('Mr. WashWala - ', '')}
                    <div style={{ color: '#047857', fontSize: '0.72rem', marginTop: 4 }}>
                      Max Net Profit: <strong>{formatCurrency(data.outlets.best.profit)}</strong>
                    </div>
                  </div>
                )}
                {data.outlets.list.length > 1 && (
                  <div style={{ background: 'rgba(100,116,139,0.04)', border: '1px solid rgba(100,116,139,0.2)', padding: 12, borderRadius: 8, fontSize: '0.78rem' }}>
                    🏪 <strong>Branch Comparison Summary:</strong>
                    <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: 4 }}>
                      {data.outlets.list[0].name.replace('Mr. WashWala - ', '')} generated highest billing of <strong>{formatCurrency(data.outlets.list[0].revenue)}</strong>.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-table-wrapper" style={{ marginTop: 8 }}>
              <table className="admin-table" style={{ background: 'transparent', fontSize: '0.76rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#0f172a' }}>
                    <th>Outlet Branch</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>AOV</th>
                    <th>Collected</th>
                    <th>Outstanding</th>
                    <th>Surahi Cost</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.outlets.list.map(out => {
                    const isBest = data.outlets.best?.id === out.id;
                    let cleanName = out.name.replace('Mr. WashWala - ', '');
                    if (cleanName.includes('2nd Stage')) cleanName = 'Vijayanagar 2nd';
                    if (cleanName.includes('4th Stage')) cleanName = 'Vijayanagar 4th';
                    if (cleanName.includes('1st Stage')) cleanName = 'Kuvempunagar 1st';
                    return (
                      <tr key={out.id} style={{ background: isBest ? 'rgba(16, 185, 129, 0.03)' : '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ fontWeight: 'bold', color: '#0f172a' }}>
                          {cleanName}
                          {isBest && <span style={{ marginLeft: '6px', fontSize: '0.64rem', background: '#10b981', color: '#fff', padding: '1px 5px', borderRadius: '3px' }}>Top</span>}
                        </td>
                        <td>{out.orders}</td>
                        <td style={{ fontWeight: '600' }}>{formatCurrency(out.revenue)}</td>
                        <td>{formatCurrency(out.aov)}</td>
                        <td>{formatCurrency(out.collected)}</td>
                        <td style={{ color: out.outstanding > 0 ? '#ef4444' : '#0f172a', fontWeight: 'bold' }}>{formatCurrency(out.outstanding)}</td>
                        <td>{formatCurrency(out.surahiCost)}</td>
                        <td style={{ fontWeight: 'bold', color: out.profit >= 0 ? '#059669' : '#b91c1c' }}>
                          {formatCurrency(out.profit)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 8. CUSTOMER ANALYTICS */}
          <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>👥 Customer Analytics & Retention</span>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0' }}>Customer type distributions and spending behavioral analytics</p>
              </div>

              <ChartSwitcher
                selected={chartTypes.customerAnalytics}
                options={['Donut', 'Bar', 'Pie']}
                onChange={val => setChartTypes({ ...chartTypes, customerAnalytics: val })}
              />
            </div>

            <div className="admin-grid admin-grid--2" style={{ gap: 24, alignItems: 'center' }}>
              <div>
                {chartTypes.customerAnalytics === 'Bar' ? (
                  <HorizontalBarChart
                    data={[
                      { label: 'New Customers', val: data.customers.new },
                      { label: 'Returning Customers', val: data.customers.returning }
                    ]}
                  />
                ) : (
                  <SVGDonutPie
                    data={[
                      { label: 'New Customers', val: data.customers.new },
                      { label: 'Returning Customers', val: data.customers.returning }
                    ]}
                    isDonut={chartTypes.customerAnalytics === 'Donut'}
                  />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ color: '#475569' }}>Total Unique Customers</span>
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{data.customers.total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ color: '#475569' }}>Repeat Customer Rate</span>
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{data.customers.repeatRate.toFixed(0)}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ color: '#475569' }}>Average Spend</span>
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(data.customers.avgSpend)}</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', marginTop: 4 }}>
                  👥 Returning clients represent <strong>{data.customers.repeatRate.toFixed(0)}%</strong> of your customer base.
                </span>
              </div>
            </div>
          </div>

          {/* 9. COLLECTION & PAYMENT METHOD breakdown */}
          <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>💳 Collection & Payment Methods</span>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0' }}>Collected vs Outstanding billing and transaction channels breakdown</p>
              </div>

              <ChartSwitcher
                selected={chartTypes.paymentMethods}
                options={['Donut', 'Bar', 'Pie']}
                onChange={val => setChartTypes({ ...chartTypes, paymentMethods: val })}
              />
            </div>

            <div className="admin-grid admin-grid--2" style={{ gap: 24, alignItems: 'center' }}>
              <div>
                {chartTypes.paymentMethods === 'Bar' ? (
                  <HorizontalBarChart
                    data={Object.entries(data.payment).map(([key, val]) => ({ label: key, val }))}
                    formatValFn={formatCurrency}
                  />
                ) : (
                  <SVGDonutPie
                    data={Object.entries(data.payment).map(([key, val]) => ({ label: key, val }))}
                    isDonut={chartTypes.paymentMethods === 'Donut'}
                    formatValFn={formatCurrency}
                  />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ color: '#475569' }}>Total Collected Cash</span>
                  <span style={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(data.kpis.amountCollected)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ color: '#EF4444', fontWeight: 'bold' }}>Outstanding Payments</span>
                  <span style={{ fontWeight: 'bold', color: '#EF4444' }}>{formatCurrency(data.kpis.outstandingAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ color: '#475569' }}>Collection Rate</span>
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{data.kpis.revenue > 0 ? ((data.kpis.amountCollected / data.kpis.revenue) * 100).toFixed(0) : 100}%</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', marginTop: 4 }}>
                  ⚠️ Outstanding payments of <strong style={{ color: '#ef4444' }}>{formatCurrency(data.kpis.outstandingAmount)}</strong> are pending collections.
                </span>
              </div>
            </div>
          </div>

          {/* 10. INVENTORY HEALTH */}
          <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>📋 Inventory Stock & Consumption</span>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0' }}>Inventory item consumption levels and stock tally alerts</p>
              </div>

              <ChartSwitcher
                selected={chartTypes.inventoryTally}
                options={['Bar', 'Horizontal Bar']}
                onChange={val => setChartTypes({ ...chartTypes, inventoryTally: val })}
              />
            </div>

            <div className="admin-grid admin-grid--2" style={{ gap: 24, alignItems: 'center' }}>
              <div>
                {data.inventory.mostUsed.length > 0 ? (
                  chartTypes.inventoryTally === 'Horizontal Bar' ? (
                    <HorizontalBarChart
                      data={data.inventory.mostUsed.map(item => ({ label: item.name, val: item.quantity }))}
                    />
                  ) : (
                    <UniversalChart
                      points={data.inventory.mostUsed.map((item, idx) => {
                        const width = 550;
                        const paddingLeft = 60;
                        const paddingRight = 20;
                        const plotWidth = width - paddingLeft - paddingRight;
                        const x = paddingLeft + (idx * plotWidth) / Math.max(data.inventory.mostUsed.length - 1, 1);
                        const max = Math.max(...data.inventory.mostUsed.map(i => i.quantity), 10);
                        const y = 180 - 45 - (item.quantity * (180 - 25 - 45)) / max;
                        return { x, y, val: item.quantity, label: item.name };
                      })}
                      ticks={[0, Math.round(Math.max(...data.inventory.mostUsed.map(i => i.quantity), 10) * 0.5), Math.round(Math.max(...data.inventory.mostUsed.map(i => i.quantity), 10))]}
                      tickYPositions={[180 - 45, 25 + (180-25-45)/2, 25]}
                      type="Bar"
                      color="#f59e0b"
                      width={550}
                      height={180}
                      paddingLeft={60}
                      paddingRight={20}
                      paddingTop={25}
                      paddingBottom={45}
                      typeLabel="Quantity"
                    />
                  )
                ) : (
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                    No stock transaction consumption logged in this period.
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  <div className="analytics-status-pill healthy" style={{ flex: 1, justifyContent: 'center', fontSize: '0.7rem' }}>
                    <span className="analytics-status-pill-dot" />
                    <span>{data.inventory.counts.healthy} Healthy</span>
                  </div>
                  <div className="analytics-status-pill low" style={{ flex: 1, justifyContent: 'center', fontSize: '0.7rem' }}>
                    <span className="analytics-status-pill-dot" />
                    <span>{data.inventory.counts.low} Low</span>
                  </div>
                  <div className="analytics-status-pill critical" style={{ flex: 1, justifyContent: 'center', fontSize: '0.7rem' }}>
                    <span className="analytics-status-pill-dot" />
                    <span>{data.inventory.counts.critical} Critical</span>
                  </div>
                </div>

                {data.inventory.criticalAlerts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '110px', overflowY: 'auto' }}>
                    {data.inventory.criticalAlerts.map(alert => (
                      <div key={alert.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', padding: '6px 12px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.08)', borderRadius: '6px' }}>
                        <span style={{ fontWeight: '600', color: '#0f172a' }}>{alert.name}</span>
                        <span style={{ fontWeight: 'bold', color: alert.status.includes('🔴') ? '#b91c1c' : '#b45309' }}>
                          {alert.currentStock} remaining {alert.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: '#047857', fontStyle: 'italic', textAlign: 'center', padding: '16px', background: 'rgba(16,185,129,0.03)', border: '1px dashed rgba(16,185,129,0.2)', borderRadius: '8px', fontWeight: '600' }}>✓ All stock levels are healthy</div>
                )}
              </div>
            </div>
          </div>

          {/* 11. DRY CLEANING / SURAHI */}
          <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>🧺 Dry Cleaning (Surahi Outsourcing)</span>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0' }}>Revenue, outsourcing costs, and net dry cleaning profit margins</p>
              </div>

              <ChartSwitcher
                selected={chartTypes.dryCleaning}
                options={['Bar', 'Donut']}
                onChange={val => setChartTypes({ ...chartTypes, dryCleaning: val })}
              />
            </div>

            <div className="admin-grid admin-grid--2" style={{ gap: 24, alignItems: 'center' }}>
              <div>
                {data.dryCleaning.revenue > 0 ? (
                  chartTypes.dryCleaning === 'Bar' ? (
                    <HorizontalBarChart
                      data={[
                        { label: 'Customer Billed Amount', val: data.dryCleaning.revenue },
                        { label: 'Surahi Vendor Cost', val: data.dryCleaning.cost },
                        { label: 'Dry Cleaning Net Profit', val: data.dryCleaning.profit }
                      ]}
                      formatValFn={formatCurrency}
                    />
                  ) : (
                    <SVGDonutPie
                      data={[
                        { label: 'Customer Billed Amount', val: data.dryCleaning.revenue },
                        { label: 'Surahi Vendor Cost', val: data.dryCleaning.cost },
                        { label: 'Dry Cleaning Net Profit', val: data.dryCleaning.profit }
                      ]}
                      isDonut={true}
                      formatValFn={formatCurrency}
                    />
                  )
                ) : (
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                    No Dry Cleaning orders logged in this period.
                  </div>
                )}
              </div>

              <div className="analytics-surahi-flow" style={{ marginTop: 0 }}>
                <div className="analytics-surahi-step">
                  <span style={{ color: '#475569', fontWeight: '700', fontSize: '0.74rem' }}>Billed Dry Clean Revenue</span>
                  <span style={{ fontWeight: '800', color: '#2563eb', fontSize: '1.05rem' }}>{formatCurrency(data.dryCleaning.revenue)}</span>
                </div>
                <div className="analytics-surahi-arrow" style={{ margin: '2px auto' }}>↓</div>
                <div className="analytics-surahi-step" style={{ background: 'rgba(239, 68, 68, 0.03)' }}>
                  <span style={{ color: '#475569', fontWeight: '700', fontSize: '0.74rem' }}>Surahi Outsourcing Cost</span>
                  <span style={{ fontWeight: '800', color: '#ef4444', fontSize: '1.05rem' }}>{formatCurrency(data.dryCleaning.cost)}</span>
                </div>
                <div className="analytics-surahi-arrow" style={{ margin: '2px auto' }}>↓</div>
                <div className="analytics-surahi-step" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <span style={{ color: '#065f46', fontWeight: '800', fontSize: '0.74rem' }}>Outsourced Profit Margin</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                    <span style={{ fontWeight: '800', color: '#10b981', fontSize: '1.1rem' }}>{formatCurrency(data.dryCleaning.profit)}</span>
                    <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 'bold' }}>Margin: {data.dryCleaning.margin.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 12. ACTIONABLE BUSINESS INSIGHTS */}
          <div className="analytics-card glass-panel" style={{ padding: '24px 20px', borderRadius: 20 }}>
            <div className="analytics-card-title" style={{ fontSize: '1.1rem', marginBottom: 20 }}>
              💡 Actionable Business Insights
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.insights.map((insight, idx) => {
                const isInsufficient = insight.includes("Not enough data");
                
                let icon = "💡";
                let cardClass = "";
                let headline = "Observation";
                let matters = "Explanation of impact";
                let action = "Action Plan";

                if (insight.includes("Revenue")) {
                  icon = "📈";
                  cardClass = "growth";
                  headline = "Revenue Trend Analysis";
                  matters = "Revenue growth indicates increased sales activity.";
                  action = "Identify which service, branch or customer segment contributed most to the change.";
                } else if (insight.includes("highest-revenue")) {
                  icon = "🏆";
                  cardClass = "service";
                  headline = "Top Service Performance";
                  matters = "Matches highest customer demand and service allocation.";
                  action = "Ensure optimal staff allocation and machinery availability to match high demand.";
                } else if (insight.includes("Returning")) {
                  icon = "👥";
                  cardClass = "cohort";
                  headline = "Customer Retention Audit";
                  matters = "Customer lifetime value and repeat purchase metrics.";
                  action = "Consider loyalty offers, repeat-order incentives, or follow-up campaigns.";
                } else if (insight.includes("recommended")) {
                  icon = "⚠️";
                  cardClass = "inventory";
                  headline = "Inventory Replenishment Alert";
                  matters = "Approaching critical inventory safety stock level.";
                  action = "Reorder the item immediately to prevent order fulfillment delays.";
                } else if (insight.includes("Dry Cleaning")) {
                  icon = "💰";
                  cardClass = "dryclean";
                  headline = "Dry Cleaning Profitability";
                  matters = "Surahi outsourcing net profit margins are positive.";
                  action = "Audit outsourced quantities regularly to maintain positive net margins.";
                } else if (insight.includes("highest-performing")) {
                  icon = "🏢";
                  cardClass = "outlet";
                  headline = "Branch Performance Summary";
                  matters = "Maximum sales contribution outlet analysis.";
                  action = "Audit workflows at other outlets to replicate top-performing methods.";
                }

                if (isInsufficient) {
                  return (
                    <div key={idx} className="analytics-insight-item-card" style={{ borderLeftColor: '#94a3b8', background: '#f8fafc', padding: 12, borderRadius: 8, display: 'flex', gap: 12 }}>
                      <div style={{ fontSize: '1.25rem' }}>💡</div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.8rem' }}>Awaiting Metrics</div>
                        <div style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.74rem', marginTop: 4 }}>{insight}</div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={idx} className={`analytics-insight-item-card ${cardClass}`} style={{ display: 'flex', gap: 14, background: '#f8fafc', padding: 16, borderRadius: 10, borderLeft: '4px solid var(--admin-primary)', borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.4rem' }}>{icon}</div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{headline}</div>
                      <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>{insight}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 4 }}>
                        <strong>WHY IT MATTERS:</strong> {matters}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 700 }}>
                        <strong>RECOMMENDED ACTION:</strong> {action}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
