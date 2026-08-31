import React, { useEffect, useState, useMemo } from 'react';
import API from '../../api/api';
import { useAdminBranch } from '../../context/AdminBranchContext.jsx';
import '../../styles/admin.css';

// --- ARC PATH CALCULATORS FOR PIE/DONUT ---
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function getArcPath(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

// --- SUBCOMPONENT: PIE / DONUT VECTOR CHART ---
function SVGDonutPie({ data, isDonut = false }) {
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, width: '100%', minHeight: '180px', flexWrap: 'wrap' }}>
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
                <title>{`${item.label}: ${item.val.toLocaleString()} (${percentage.toFixed(0)}%)`}</title>
              </path>
            );
          })}
        </svg>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '145px', overflowY: 'auto', fontSize: '0.72rem', minWidth: '130px' }}>
        {data.map((item, idx) => {
          const percentage = (item.val / total) * 100;
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155' }}>
              <div style={{ width: 10, height: 10, borderRadius: '2px', flexShrink: 0, background: colors[idx % colors.length] }} />
              <span style={{ fontWeight: 'bold' }}>{percentage.toFixed(0)}%</span>
              <span style={{ color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{item.label}</span>
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

// --- SUBCOMPONENT: SVG CHART (LINE, AREA, VERTICAL BAR) ---
function SVGLineAreaBar({ points, ticks, tickYPositions, type, color = 'var(--admin-primary)', formatValFn, width, height, paddingLeft, paddingRight, paddingTop, paddingBottom, path, areaPath, isBar = false }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const interval = Math.max(1, Math.ceil(points.length / 6));

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
            <span>{type}:</span>
            <span style={{ fontWeight: 'bold' }}>{formatValFn ? formatValFn(hoveredPoint.val) : hoveredPoint.val}</span>
          </div>
        </div>
      )}

      <div style={{ position: 'relative', width: '100%', height: '180px' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id={`grad-dash-kpi-${type}`} x1="0" y1="0" x2="0" y2="1">
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

          {/* Render Area */}
          {!isBar && areaPath && <path d={areaPath} fill={`url(#grad-dash-kpi-${type})`} />}
          {/* Render Line */}
          {!isBar && path && <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Render Bars */}
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

          {/* Interactive Circle Dots (for line/area charts only) */}
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

          {/* Titles */}
          <text x={paddingLeft - 10} y={paddingTop - 8} textAnchor="start" fill="#334155" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {type === 'Revenue' ? 'Revenue (₹)' : 'Orders Count'}
          </text>
          <text x={paddingLeft + (width - paddingLeft - paddingRight) / 2} y={height - 8} textAnchor="middle" fill="#334155" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Timeline Period
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { selectedBranchId, setSelectedBranchId } = useAdminBranch();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Period filters
  const [periodFilter, setPeriodFilter] = useState('This Month');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  const [appliedRange, setAppliedRange] = useState({ from: '', to: '' });

  // Visualizers chart types selectors
  const [chartTypes, setChartTypes] = useState({
    revenueTrend: 'Line',
    ordersTrend: 'Line',
    revenueService: 'Bar',
    ordersService: 'Bar',
    revenueOutlet: 'Bar',
    walkinWebsite: 'Donut',
    collectionOutstanding: 'Donut',
    revenueSurahi: 'Bar'
  });

  // Local/IST safe predefined calculator
  const calculateBoundaries = (period) => {
    const today = new Date();
    let from = '';
    let to = '';

    if (period === 'Today') {
      const dStr = today.toISOString().slice(0, 10);
      from = dStr;
      to = dStr;
    } else if (period === 'Yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const dStr = yesterday.toISOString().slice(0, 10);
      from = dStr;
      to = dStr;
    } else if (period === 'This Week') {
      const currentDay = today.getDay();
      const first = today.getDate() - currentDay;
      const start = new Date(today.getFullYear(), today.getMonth(), first, 0, 0, 0, 0);
      const end = new Date(today.getFullYear(), today.getMonth(), first + 6, 23, 59, 59, 999);
      from = start.toISOString().slice(0, 10);
      to = end.toISOString().slice(0, 10);
    } else if (period === 'This Month') {
      const startStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const endStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      from = startStr;
      to = endStr;
    } else if (period === 'This Year') {
      const startStr = `${today.getFullYear()}-01-01`;
      const endStr = `${today.getFullYear()}-12-31`;
      from = startStr;
      to = endStr;
    }
    return { from, to };
  };

  // Sync date boundaries when dropdown changes
  useEffect(() => {
    if (periodFilter !== 'Custom') {
      const bounds = calculateBoundaries(periodFilter);
      setAppliedRange(bounds);
    }
  }, [periodFilter]);

  // Fetch Dashboard details from API
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          trendMode: periodFilter === 'Today' || periodFilter === 'Yesterday' ? 'daily' : 'daily'
        };

        if (selectedBranchId && selectedBranchId !== 'all') {
          params.branch = selectedBranchId;
        }

        if (periodFilter === 'Custom') {
          if (customRange.from) params.from = customRange.from;
          if (customRange.to) params.to = customRange.to;
        } else {
          const bounds = calculateBoundaries(periodFilter);
          if (bounds.from) params.from = bounds.from;
          if (bounds.to) params.to = bounds.to;
        }

        const response = await API.get('/api/analytics', { params });
        setData(response.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Unable to fetch analytics dashboard details');
      } finally {
        setLoading(false);
      }
    };

    if (periodFilter !== 'Custom' || (customRange.from && customRange.to)) {
      fetchStats();
    }
  }, [selectedBranchId, periodFilter, appliedRange]);

  const handleCustomRangeSubmit = (e) => {
    e.preventDefault();
    if (customRange.from && customRange.to) {
      setAppliedRange({ from: customRange.from, to: customRange.to });
    }
  };

  // Trend coordinates calculations
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

  const renderComparisonBadge = (current, previous) => {
    if (previous === undefined || previous === null || previous <= 0) return null;
    const diff = current - previous;
    const change = (diff / previous) * 100;
    const isPositive = change >= 0;

    return (
      <span className={`analytics-growth-badge ${isPositive ? 'positive' : 'negative'}`} style={{ marginLeft: 8 }}>
        {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(0)}%
      </span>
    );
  };

  if (loading && !data) {
    return <div className="admin-empty-state">Loading dashboard stats…</div>;
  }

  if (error) {
    return <div className="admin-empty-state">{error}</div>;
  }

  return (
    <div className="admin-section" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* HEADER SECTION */}
      <div className="analytics-filter-bar glass-panel" style={{ background: '#ffffff', border: '1px solid rgba(15, 23, 42, 0.12)', padding: 18, borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="analytics-title" style={{ fontSize: '1.45rem', fontWeight: 800 }}>Dashboard & Analytics</h1>
            <p className="analytics-subtitle" style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0' }}>Comprehensive operational review and data visualizations</p>
          </div>

          {/* Filters Control Group */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            {/* Period Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Time Interval</label>
              <select
                className="admin-select"
                value={periodFilter}
                onChange={e => setPeriodFilter(e.target.value)}
                style={{ fontSize: '0.76rem', height: '32px', padding: '0 8px', borderRadius: '6px', minWidth: '120px' }}
              >
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
                <option value="Custom">Custom Date Range</option>
              </select>
            </div>

            {/* Branch Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Branch Outlet</label>
              <select
                className="admin-select"
                value={selectedBranchId}
                onChange={e => setSelectedBranchId(e.target.value)}
                style={{ fontSize: '0.76rem', height: '32px', padding: '0 8px', borderRadius: '6px', minWidth: '170px' }}
              >
                <option value="all">All Branches</option>
                <option value="vijaynagar-mysuru">Vijayanagar Second Stage</option>
                <option value="vijaynagar-2nd-stage-mysuru">Vijayanagar Fourth Stage</option>
                <option value="kuvempunagar-1st-stage-mysuru">Kuvempunagar First Stage</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Range picker inputs */}
        {periodFilter === 'Custom' && (
          <form onSubmit={handleCustomRangeSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', marginTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569' }}>From</label>
              <input
                type="date"
                className="admin-input"
                value={customRange.from}
                onChange={e => setCustomRange({ ...customRange, from: e.target.value })}
                style={{ height: '30px', padding: '0 8px', fontSize: '0.78rem' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569' }}>To</label>
              <input
                type="date"
                className="admin-input"
                value={customRange.to}
                onChange={e => setCustomRange({ ...customRange, to: e.target.value })}
                style={{ height: '30px', padding: '0 8px', fontSize: '0.78rem' }}
                required
              />
            </div>
            <button type="submit" className="admin-button" style={{ height: '30px', padding: '0 16px', fontSize: '0.78rem' }}>Apply</button>
          </form>
        )}
      </div>

      {/* SECTION 1: 12 COMPACT KPI CARDS */}
      <div className="admin-grid admin-grid--4" style={{ gap: 16 }}>
        {/* Card 1 */}
        <div className="analytics-card analytics-kpi-card glass-panel" style={{ padding: 16, marginBottom: 0 }}>
          <div className="analytics-kpi-header">
            <span className="analytics-card-title" style={{ fontSize: '0.72rem' }}>Total Orders</span>
            <div className="analytics-kpi-icon orders">📦</div>
          </div>
          <div>
            <div className="analytics-card-value" style={{ fontSize: '1.4rem' }}>{data.kpis.orders}</div>
            {renderComparisonBadge(data.kpis.orders, data.kpis.prevOrders)}
          </div>
          <span className="analytics-card-sublabel" style={{ fontSize: '0.65rem' }}>Active & completed period count</span>
        </div>

        {/* Card 2 */}
        <div className="analytics-card analytics-kpi-card glass-panel" style={{ padding: 16, marginBottom: 0 }}>
          <div className="analytics-kpi-header">
            <span className="analytics-card-title" style={{ fontSize: '0.72rem' }}>Pending Orders</span>
            <div className="analytics-kpi-icon orders" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>⚡</div>
          </div>
          <div>
            <div className="analytics-card-value" style={{ fontSize: '1.4rem' }}>{data.kpis.pendingOrders}</div>
            {renderComparisonBadge(data.kpis.pendingOrders, data.kpis.prevPendingOrders)}
          </div>
          <span className="analytics-card-sublabel" style={{ fontSize: '0.65rem' }}>Orders currently in processing</span>
        </div>

        {/* Card 3 */}
        <div className="analytics-card analytics-kpi-card glass-panel" style={{ padding: 16, marginBottom: 0 }}>
          <div className="analytics-kpi-header">
            <span className="analytics-card-title" style={{ fontSize: '0.72rem' }}>Today's Orders</span>
            <div className="analytics-kpi-icon orders" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)' }}>⏰</div>
          </div>
          <div>
            <div className="analytics-card-value" style={{ fontSize: '1.4rem' }}>{data.kpis.todaysOrders}</div>
            {renderComparisonBadge(data.kpis.todaysOrders, data.kpis.prevTodaysOrders)}
          </div>
          <span className="analytics-card-sublabel" style={{ fontSize: '0.65rem' }}>New orders booked today</span>
        </div>

        {/* Card 4 */}
        <div className="analytics-card analytics-kpi-card glass-panel" style={{ padding: 16, marginBottom: 0 }}>
          <div className="analytics-kpi-header">
            <span className="analytics-card-title" style={{ fontSize: '0.72rem' }}>Revenue</span>
            <div className="analytics-kpi-icon revenue">₹</div>
          </div>
          <div>
            <div className="analytics-card-value" style={{ fontSize: '1.4rem' }}>{formatCurrency(data.kpis.revenue)}</div>
            {renderComparisonBadge(data.kpis.revenue, data.kpis.prevRevenue)}
          </div>
          <span className="analytics-card-sublabel" style={{ fontSize: '0.65rem' }}>Total billing for this period</span>
        </div>

        {/* Card 5 */}
        <div className="analytics-card analytics-kpi-card glass-panel" style={{ padding: 16, marginBottom: 0 }}>
          <div className="analytics-kpi-header">
            <span className="analytics-card-title" style={{ fontSize: '0.72rem' }}>Today's Revenue</span>
            <div className="analytics-kpi-icon revenue" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)' }}>💰</div>
          </div>
          <div>
            <div className="analytics-card-value" style={{ fontSize: '1.4rem' }}>{formatCurrency(data.kpis.todaysRevenue)}</div>
            {renderComparisonBadge(data.kpis.todaysRevenue, data.kpis.prevTodaysRevenue)}
          </div>
          <span className="analytics-card-sublabel" style={{ fontSize: '0.65rem' }}>Billed revenue generated today</span>
        </div>

        {/* Card 6 */}
        <div className="analytics-card analytics-kpi-card glass-panel" style={{ padding: 16, marginBottom: 0 }}>
          <div className="analytics-kpi-header">
            <span className="analytics-card-title" style={{ fontSize: '0.72rem' }}>Walk-in Orders</span>
            <div className="analytics-kpi-icon orders" style={{ color: '#6366f1', background: 'rgba(99,102,241,0.1)' }}>🏪</div>
          </div>
          <div>
            <div className="analytics-card-value" style={{ fontSize: '1.4rem' }}>{data.kpis.walkinOrders}</div>
            {renderComparisonBadge(data.kpis.walkinOrders, data.kpis.prevWalkinOrders)}
          </div>
          <span className="analytics-card-sublabel" style={{ fontSize: '0.65rem' }}>Bookings created at store branch</span>
        </div>

        {/* Card 7 */}
        <div className="analytics-card analytics-kpi-card glass-panel" style={{ padding: 16, marginBottom: 0 }}>
          <div className="analytics-kpi-header">
            <span className="analytics-card-title" style={{ fontSize: '0.72rem' }}>Walk-in Revenue</span>
            <div className="analytics-kpi-icon revenue" style={{ color: '#6366f1', background: 'rgba(99,102,241,0.1)' }}>💸</div>
          </div>
          <div>
            <div className="analytics-card-value" style={{ fontSize: '1.4rem' }}>{formatCurrency(data.kpis.walkinRevenue)}</div>
            {renderComparisonBadge(data.kpis.walkinRevenue, data.kpis.prevWalkinRevenue)}
          </div>
          <span className="analytics-card-sublabel" style={{ fontSize: '0.65rem' }}>Billing generated from walk-ins</span>
        </div>

        {/* Card 8 */}
        <div className="analytics-card analytics-kpi-card glass-panel" style={{ padding: 16, marginBottom: 0 }}>
          <div className="analytics-kpi-header">
            <span className="analytics-card-title" style={{ fontSize: '0.72rem' }}>Website Revenue</span>
            <div className="analytics-kpi-icon revenue" style={{ color: '#06b6d4', background: 'rgba(6,182,212,0.1)' }}>🌐</div>
          </div>
          <div>
            <div className="analytics-card-value" style={{ fontSize: '1.4rem' }}>{formatCurrency(data.kpis.websiteRevenue)}</div>
            {renderComparisonBadge(data.kpis.websiteRevenue, data.kpis.prevWebsiteRevenue)}
          </div>
          <span className="analytics-card-sublabel" style={{ fontSize: '0.65rem' }}>Online customer bookings billing</span>
        </div>

        {/* Card 9 */}
        <div className="analytics-card analytics-kpi-card glass-panel" style={{ padding: 16, marginBottom: 0 }}>
          <div className="analytics-kpi-header">
            <span className="analytics-card-title" style={{ fontSize: '0.72rem' }}>Total Customers</span>
            <div className="analytics-kpi-icon unique" style={{ background: 'rgba(15,23,42,0.05)' }}>👥</div>
          </div>
          <div>
            <div className="analytics-card-value" style={{ fontSize: '1.4rem' }}>{data.kpis.uniqueCustomers}</div>
            {renderComparisonBadge(data.kpis.uniqueCustomers, data.kpis.prevUniqueCustomers)}
          </div>
          <span className="analytics-card-sublabel" style={{ fontSize: '0.65rem' }}>Unique client customer profiles</span>
        </div>

        {/* Card 10 */}
        <div className="analytics-card analytics-kpi-card glass-panel" style={{ padding: 16, marginBottom: 0 }}>
          <div className="analytics-kpi-header">
            <span className="analytics-card-title" style={{ fontSize: '0.72rem' }}>Average Order Value</span>
            <div className="analytics-kpi-icon aov">📊</div>
          </div>
          <div>
            <div className="analytics-card-value" style={{ fontSize: '1.4rem' }}>{formatCurrency(data.kpis.aov)}</div>
            {renderComparisonBadge(data.kpis.aov, data.kpis.prevAov)}
          </div>
          <span className="analytics-card-sublabel" style={{ fontSize: '0.65rem' }}>Average billing ticket invoice</span>
        </div>

        {/* Card 11 */}
        <div className="analytics-card analytics-kpi-card glass-panel" style={{ padding: 16, marginBottom: 0 }}>
          <div className="analytics-kpi-header">
            <span className="analytics-card-title" style={{ fontSize: '0.72rem' }}>Surahi Cost (COGS)</span>
            <div className="analytics-kpi-icon profit" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>🛒</div>
          </div>
          <div>
            <div className="analytics-card-value" style={{ fontSize: '1.4rem' }}>{formatCurrency(data.kpis.surahiCost)}</div>
            {renderComparisonBadge(data.kpis.surahiCost, data.kpis.prevSurahiCost)}
          </div>
          <span className="analytics-card-sublabel" style={{ fontSize: '0.65rem' }}>Dry cleaning vendor supply cost</span>
        </div>

        {/* Card 12 */}
        <div className="analytics-card analytics-kpi-card glass-panel" style={{ padding: 16, marginBottom: 0 }}>
          <div className="analytics-kpi-header">
            <span className="analytics-card-title" style={{ fontSize: '0.72rem' }}>Net Profit</span>
            <div className="analytics-kpi-icon profit">💵</div>
          </div>
          <div>
            <div className="analytics-card-value" style={{ fontSize: '1.4rem', color: data.kpis.netProfit >= 0 ? '#059669' : '#b91c1c' }}>
              {formatCurrency(data.kpis.netProfit)}
            </div>
            {renderComparisonBadge(data.kpis.netProfit, data.kpis.prevNetProfit)}
          </div>
          <span className="analytics-card-sublabel" style={{ fontSize: '0.65rem' }}>Revenue minus Surahi cost</span>
        </div>
      </div>

      {/* SECTION 2: REVENUE TREND & ORDERS TREND */}
      <div className="admin-grid admin-grid--2">
        <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>Revenue Trend</span>
            {/* Chart Type Selector */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '4px' }}>
              {['Line', 'Area', 'Bar'].map(type => (
                <button
                  key={type}
                  onClick={() => setChartTypes({ ...chartTypes, revenueTrend: type })}
                  style={{
                    fontSize: '0.64rem',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    background: chartTypes.revenueTrend === type ? '#ffffff' : 'transparent',
                    color: chartTypes.revenueTrend === type ? '#0f172a' : '#64748b',
                    boxShadow: chartTypes.revenueTrend === type ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {svgChartsData && svgChartsData.pathRev ? (
            <SVGLineAreaBar
              points={svgChartsData.pointsRev}
              ticks={svgChartsData.ticksRev}
              tickYPositions={svgChartsData.tickYPositionsRev}
              type="Revenue"
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
            />
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
              No data available for this period.
            </div>
          )}
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 10 }}>
            📉 Selected period revenue total is <strong>{formatCurrency(data.kpis.revenue)}</strong>.
            {data.kpis.prevRevenue > 0 && ` Comparison shows a ${data.kpis.revenue >= data.kpis.prevRevenue ? 'growth' : 'decrease'} of ${Math.abs(((data.kpis.revenue - data.kpis.prevRevenue) / data.kpis.prevRevenue) * 100).toFixed(0)}% relative to prior interval.`}
          </span>
        </div>

        <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>Orders Trend</span>
            {/* Chart Type Selector */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '4px' }}>
              {['Line', 'Area', 'Bar'].map(type => (
                <button
                  key={type}
                  onClick={() => setChartTypes({ ...chartTypes, ordersTrend: type })}
                  style={{
                    fontSize: '0.64rem',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    background: chartTypes.ordersTrend === type ? '#ffffff' : 'transparent',
                    color: chartTypes.ordersTrend === type ? '#0f172a' : '#64748b',
                    boxShadow: chartTypes.ordersTrend === type ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {svgChartsData && svgChartsData.pathOrders ? (
            <SVGLineAreaBar
              points={svgChartsData.pointsOrders}
              ticks={svgChartsData.ticksOrders}
              tickYPositions={svgChartsData.tickYPositionsOrders}
              type="Orders"
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
            />
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
              No data available for this period.
            </div>
          )}
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 10 }}>
            📦 Selected period orders count is <strong>{data.kpis.orders}</strong>.
            {data.kpis.prevOrders > 0 && ` Volume shows a ${data.kpis.orders >= data.kpis.prevOrders ? 'growth' : 'decrease'} of ${Math.abs(((data.kpis.orders - data.kpis.prevOrders) / data.kpis.prevOrders) * 100).toFixed(0)}% relative to prior interval.`}
          </span>
        </div>
      </div>

      {/* SECTION 3: REVENUE BY SERVICE & ORDERS BY SERVICE */}
      <div className="admin-grid admin-grid--2">
        <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>Revenue by Service</span>
            {/* Chart Type Selector */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '4px' }}>
              {['Bar', 'Donut', 'Pie'].map(type => (
                <button
                  key={type}
                  onClick={() => setChartTypes({ ...chartTypes, revenueService: type })}
                  style={{
                    fontSize: '0.64rem',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    background: chartTypes.revenueService === type ? '#ffffff' : 'transparent',
                    color: chartTypes.revenueService === type ? '#0f172a' : '#64748b',
                    boxShadow: chartTypes.revenueService === type ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {data.services && data.services.list.length > 0 ? (
            chartTypes.revenueService === 'Bar' ? (
              <HorizontalBarChart
                data={data.services.list.map(s => ({ label: s.name, val: s.revenue }))}
                formatValFn={formatCurrency}
              />
            ) : (
              <SVGDonutPie
                data={data.services.list.map(s => ({ label: s.name, val: s.revenue }))}
                isDonut={chartTypes.revenueService === 'Donut'}
              />
            )
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic' }}>No service sales found</div>
          )}

          {data.services && data.services.top && (
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 10 }}>
              🏆 <strong>{data.services.top.name}</strong> is the highest-revenue service generated (<strong>{formatCurrency(data.services.top.revenue)}</strong> billing).
            </span>
          )}
        </div>

        <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>Orders by Service</span>
            {/* Chart Type Selector */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '4px' }}>
              {['Bar', 'Donut', 'Pie'].map(type => (
                <button
                  key={type}
                  onClick={() => setChartTypes({ ...chartTypes, ordersService: type })}
                  style={{
                    fontSize: '0.64rem',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    background: chartTypes.ordersService === type ? '#ffffff' : 'transparent',
                    color: chartTypes.ordersService === type ? '#0f172a' : '#64748b',
                    boxShadow: chartTypes.ordersService === type ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {data.services && data.services.list.length > 0 ? (
            chartTypes.ordersService === 'Bar' ? (
              <HorizontalBarChart
                data={data.services.list.map(s => ({ label: s.name, val: s.orders }))}
              />
            ) : (
              <SVGDonutPie
                data={data.services.list.map(s => ({ label: s.name, val: s.orders }))}
                isDonut={chartTypes.ordersService === 'Donut'}
              />
            )
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic' }}>No service orders found</div>
          )}

          {data.services && data.services.top && (
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 10 }}>
              🧺 <strong>{data.services.top.name}</strong> was ordered most frequently (<strong>{data.services.top.orders}</strong> transactions).
            </span>
          )}
        </div>
      </div>

      {/* SECTION 4: REVENUE BY OUTLET & WALK-IN VS WEBSITE REVENUE */}
      <div className="admin-grid admin-grid--2">
        <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>Revenue by Outlet</span>
            {/* Chart Type Selector */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '4px' }}>
              {['Bar', 'Donut'].map(type => (
                <button
                  key={type}
                  onClick={() => setChartTypes({ ...chartTypes, revenueOutlet: type })}
                  style={{
                    fontSize: '0.64rem',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    background: chartTypes.revenueOutlet === type ? '#ffffff' : 'transparent',
                    color: chartTypes.revenueOutlet === type ? '#0f172a' : '#64748b',
                    boxShadow: chartTypes.revenueOutlet === type ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {data.outlets && data.outlets.list.length > 0 ? (
            chartTypes.revenueOutlet === 'Bar' ? (
              <HorizontalBarChart
                data={data.outlets.list.map(o => {
                  let cleanName = o.name.replace('Mr. WashWala - ', '');
                  if (cleanName.includes('2nd Stage')) cleanName = 'Vijayanagar Second Stage';
                  if (cleanName.includes('4th Stage')) cleanName = 'Vijayanagar Fourth Stage';
                  if (cleanName.includes('1st Stage')) cleanName = 'Kuvempunagar First Stage';
                  return { label: cleanName, val: o.revenue };
                })}
                formatValFn={formatCurrency}
              />
            ) : (
              <SVGDonutPie
                data={data.outlets.list.map(o => {
                  let cleanName = o.name.replace('Mr. WashWala - ', '');
                  if (cleanName.includes('2nd Stage')) cleanName = 'Vijayanagar Second Stage';
                  if (cleanName.includes('4th Stage')) cleanName = 'Vijayanagar Fourth Stage';
                  if (cleanName.includes('1st Stage')) cleanName = 'Kuvempunagar First Stage';
                  return { label: cleanName, val: o.revenue };
                })}
                isDonut={true}
              />
            )
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic' }}>No outlet sales found</div>
          )}

          {data.outlets && data.outlets.best && (
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 10 }}>
              🏪 <strong>{data.outlets.best.name.replace('Mr. WashWala - ', '')}</strong> is the highest-performing outlet for this period.
            </span>
          )}
        </div>

        <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>Walk-in vs Website Revenue</span>
            {/* Chart Type Selector */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '4px' }}>
              {['Bar', 'Donut', 'Pie'].map(type => (
                <button
                  key={type}
                  onClick={() => setChartTypes({ ...chartTypes, walkinWebsite: type })}
                  style={{
                    fontSize: '0.64rem',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    background: chartTypes.walkinWebsite === type ? '#ffffff' : 'transparent',
                    color: chartTypes.walkinWebsite === type ? '#0f172a' : '#64748b',
                    boxShadow: chartTypes.walkinWebsite === type ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {chartTypes.walkinWebsite === 'Bar' ? (
            <HorizontalBarChart
              data={[
                { label: 'Walk-in Store', val: data.kpis.walkinRevenue },
                { label: 'Online Website', val: data.kpis.websiteRevenue }
              ]}
              formatValFn={formatCurrency}
            />
          ) : (
            <SVGDonutPie
              data={[
                { label: 'Walk-in Store', val: data.kpis.walkinRevenue },
                { label: 'Online Website', val: data.kpis.websiteRevenue }
              ]}
              isDonut={chartTypes.walkinWebsite === 'Donut'}
            />
          )}

          <span style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 10 }}>
            🌐 Website booking shares <strong>{((data.kpis.websiteRevenue / (data.kpis.revenue || 1)) * 100).toFixed(0)}%</strong> of total billing revenue.
          </span>
        </div>
      </div>

      {/* SECTION 5: COLLECTION VS OUTSTANDING & REVENUE VS SURAHI COST */}
      <div className="admin-grid admin-grid--2">
        <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>Collection vs Outstanding</span>
            {/* Chart Type Selector */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '4px' }}>
              {['Bar', 'Donut'].map(type => (
                <button
                  key={type}
                  onClick={() => setChartTypes({ ...chartTypes, collectionOutstanding: type })}
                  style={{
                    fontSize: '0.64rem',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    background: chartTypes.collectionOutstanding === type ? '#ffffff' : 'transparent',
                    color: chartTypes.collectionOutstanding === type ? '#0f172a' : '#64748b',
                    boxShadow: chartTypes.collectionOutstanding === type ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {chartTypes.collectionOutstanding === 'Bar' ? (
            <HorizontalBarChart
              data={[
                { label: 'Amount Collected', val: data.kpis.amountCollected },
                { label: 'Outstanding Balance', val: data.kpis.outstandingAmount }
              ]}
              formatValFn={formatCurrency}
            />
          ) : (
            <SVGDonutPie
              data={[
                { label: 'Amount Collected', val: data.kpis.amountCollected },
                { label: 'Outstanding Balance', val: data.kpis.outstandingAmount }
              ]}
              isDonut={true}
            />
          )}

          <span style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 10 }}>
            💰 Outstanding balance is <strong>{formatCurrency(data.kpis.outstandingAmount)}</strong> across period billing.
          </span>
        </div>

        <div className="analytics-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="analytics-card-title" style={{ fontSize: '1.05rem', margin: 0 }}>Revenue vs Surahi Cost (Dry Clean)</span>
            {/* Chart Type Selector */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '4px' }}>
              {['Bar', 'Donut'].map(type => (
                <button
                  key={type}
                  onClick={() => setChartTypes({ ...chartTypes, revenueSurahi: type })}
                  style={{
                    fontSize: '0.64rem',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    background: chartTypes.revenueSurahi === type ? '#ffffff' : 'transparent',
                    color: chartTypes.revenueSurahi === type ? '#0f172a' : '#64748b',
                    boxShadow: chartTypes.revenueSurahi === type ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {data.dryCleaning.revenue > 0 ? (
            chartTypes.revenueSurahi === 'Bar' ? (
              <HorizontalBarChart
                data={[
                  { label: 'Dry Cleaning Revenue', val: data.dryCleaning.revenue },
                  { label: 'Surahi Vendor Cost', val: data.dryCleaning.cost }
                ]}
                formatValFn={formatCurrency}
              />
            ) : (
              <SVGDonutPie
                data={[
                  { label: 'Dry Cleaning Revenue', val: data.dryCleaning.revenue },
                  { label: 'Surahi Vendor Cost', val: data.dryCleaning.cost }
                ]}
                isDonut={true}
              />
            )
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic' }}>
              No Dry Cleaning data found in this period
            </div>
          )}

          {data.dryCleaning.revenue > 0 && (
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 10 }}>
              🛒 Surahi dry-cleaning cost was <strong>{formatCurrency(data.dryCleaning.cost)}</strong>, generating <strong>{formatCurrency(data.dryCleaning.profit)}</strong> profit.
            </span>
          )}
        </div>
      </div>

      {/* SECTION 6: LEADERBOARDS DETAILS */}
      <div className="admin-grid admin-grid--2">
        {/* Service list catalog */}
        <div className="analytics-card glass-panel">
          <div className="analytics-card-title" style={{ fontSize: '1.05rem', marginBottom: 15 }}>Top Services Leaderboard</div>
          {data.services && data.services.list.length > 0 ? (
            <div className="admin-table-wrapper">
              <table className="admin-table" style={{ fontSize: '0.76rem' }}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Service Name</th>
                    <th>Billing Revenue</th>
                    <th>Order Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {data.services.list.map((s, idx) => (
                    <tr key={s.name}>
                      <td style={{ fontWeight: 'bold' }}>#{idx + 1}</td>
                      <td style={{ fontWeight: 'bold' }}>{s.name}</td>
                      <td>{formatCurrency(s.revenue)}</td>
                      <td>{s.orders} orders</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>No service bookings found</div>
          )}
        </div>

        {/* Outlet leaderboard */}
        <div className="analytics-card glass-panel">
          <div className="analytics-card-title" style={{ fontSize: '1.05rem', marginBottom: 15 }}>Outlet Performance Details</div>
          {data.outlets && data.outlets.list.length > 0 ? (
            <div className="admin-table-wrapper">
              <table className="admin-table" style={{ fontSize: '0.76rem' }}>
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>Collected</th>
                    <th>Outstanding</th>
                    <th>COGS</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.outlets.list.map(outlet => {
                    let cleanName = outlet.name.replace('Mr. WashWala - ', '');
                    if (cleanName.includes('2nd Stage')) cleanName = 'Vijayanagar 2nd';
                    if (cleanName.includes('4th Stage')) cleanName = 'Vijayanagar 4th';
                    if (cleanName.includes('1st Stage')) cleanName = 'Kuvempunagar 1st';
                    return (
                      <tr key={outlet.id}>
                        <td style={{ fontWeight: 'bold' }}>{cleanName}</td>
                        <td>{outlet.orders}</td>
                        <td>{formatCurrency(outlet.revenue)}</td>
                        <td>{formatCurrency(outlet.collected)}</td>
                        <td style={{ color: '#d97706' }}>{formatCurrency(outlet.outstanding)}</td>
                        <td>{formatCurrency(outlet.surahiCost)}</td>
                        <td style={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(outlet.profit)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>No outlet stats found</div>
          )}
        </div>
      </div>
    </div>
  );
}
