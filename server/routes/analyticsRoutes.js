import express from 'express';
import Order from '../models/Order.js';
import WalkInOrder from '../models/WalkInOrder.js';
import Expense from '../models/Expense.js';
import InventoryItem from '../models/InventoryItem.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import { adminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

const adminBranches = [
  {
    id: "vijaynagar-mysuru",
    name: "Mr. WashWala - Vijayanagar 2nd Stage, Mysuru",
    shortName: "Vijayanagar 2nd Stage"
  },
  {
    id: "vijaynagar-2nd-stage-mysuru",
    name: "Mr. WashWala - Vijayanagar 4th Stage, Mysuru",
    shortName: "Vijayanagar 4th Stage"
  },
  {
    id: "kuvempunagar-1st-stage-mysuru",
    name: "Mr. WashWala - Kuvempu Nagar 1st Stage, Mysuru",
    shortName: "Kuvempu Nagar 1st Stage"
  }
];

router.use(adminAuth);

// Helper to calculate date boundaries
function parseDateRange(query) {
  const { from, to, dates } = query;
  let currentStart, currentEnd;
  let prevStart, prevEnd;
  let currentDates = [];
  let prevDates = [];

  if (dates) {
    const datesList = dates.split(',').map(d => d.trim()).filter(Boolean).sort();
    if (datesList.length > 0) {
      currentDates = datesList.map(dStr => {
        const [year, month, day] = dStr.split('-').map(Number);
        return {
          start: new Date(year, month - 1, day, 0, 0, 0, 0),
          end: new Date(year, month - 1, day, 23, 59, 59, 999)
        };
      });
      const shiftDays = datesList.length;
      prevDates = datesList.map(dStr => {
        const [year, month, day] = dStr.split('-').map(Number);
        const originalDate = new Date(year, month - 1, day);
        const shifted = new Date(originalDate);
        shifted.setDate(originalDate.getDate() - shiftDays);
        return {
          start: new Date(shifted.getFullYear(), shifted.getMonth(), shifted.getDate(), 0, 0, 0, 0),
          end: new Date(shifted.getFullYear(), shifted.getMonth(), shifted.getDate(), 23, 59, 59, 999)
        };
      });
      return { type: 'discrete', current: currentDates, previous: prevDates };
    }
  }

  if (from || to) {
    const today = new Date();
    let fDate = from ? new Date(from.split('-')[0], from.split('-')[1]-1, from.split('-')[2], 0,0,0,0) : today;
    let tDate = to ? new Date(to.split('-')[0], to.split('-')[1]-1, to.split('-')[2], 23,59,59,999) : today;
    currentStart = fDate;
    currentEnd = tDate;

    const diffTime = Math.abs(tDate - fDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    prevStart = new Date(currentStart);
    prevStart.setDate(currentStart.getDate() - diffDays);
    prevEnd = new Date(currentEnd);
    prevEnd.setDate(currentEnd.getDate() - diffDays);

    return { type: 'range', current: { start: currentStart, end: currentEnd }, previous: { start: prevStart, end: prevEnd } };
  }

  // Default: Today vs Yesterday
  const today = new Date();
  currentStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  currentEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  prevStart = new Date(currentStart);
  prevStart.setDate(currentStart.getDate() - 1);
  prevEnd = new Date(currentEnd);
  prevEnd.setDate(currentEnd.getDate() - 1);

  return { type: 'range', current: { start: currentStart, end: currentEnd }, previous: { start: prevStart, end: prevEnd } };
}

function buildMongooseFilter(parsedRange, fieldName = 'createdAt') {
  if (parsedRange.type === 'discrete') {
    const orList = parsedRange.current.map(range => ({
      [fieldName]: { $gte: range.start, $lte: range.end }
    }));
    return { $or: orList };
  } else {
    return {
      [fieldName]: { $gte: parsedRange.current.start, $lte: parsedRange.current.end }
    };
  }
}

function buildMongoosePrevFilter(parsedRange, fieldName = 'createdAt') {
  if (parsedRange.type === 'discrete') {
    const orList = parsedRange.previous.map(range => ({
      [fieldName]: { $gte: range.start, $lte: range.end }
    }));
    return { $or: orList };
  } else {
    return {
      [fieldName]: { $gte: parsedRange.previous.start, $lte: parsedRange.previous.end }
    };
  }
}

function aggregateStats(webOrders, walkinOrders, expensesList) {
  const activeWeb = webOrders.filter(o => o.status !== 'Cancelled');
  const activeWalkin = walkinOrders.filter(o => o.status !== 'Cancelled');
  
  let revenue = 0;
  let ordersCount = activeWeb.length + activeWalkin.length;
  let surahiCost = 0;
  let dryCleanRevenue = 0;
  let dryCleanOrders = 0;
  let dryCleanQty = 0;

  let pendingOrders = 0;
  let todaysOrders = 0;
  let todaysRevenue = 0;
  let walkinOrdersCount = activeWalkin.length;
  let walkinRevenue = 0;
  let websiteOrdersCount = activeWeb.length;
  let websiteRevenue = 0;

  const todayLocalStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  activeWeb.forEach(o => {
    if (o.status === 'Pending') {
      pendingOrders++;
    }
    const oDateLocalStr = new Date(new Date(o.createdAt).getTime() - new Date(o.createdAt).getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (oDateLocalStr === todayLocalStr && o.status !== 'Cancelled') {
      todaysOrders++;
      todaysRevenue += o.totalAmount || 0;
    }

    if (o.status !== 'Cancelled') {
      const sales = o.totalAmount || 0;
      revenue += sales;
      websiteRevenue += sales;
      (o.items || []).forEach(item => {
        surahiCost += item.surahiTotalCost || 0;
        const isDryClean = (item.name || '').toLowerCase().includes('dry clean') || (item.name || '').toLowerCase().includes('dry cleaning');
        if (isDryClean) {
          dryCleanRevenue += (item.quantity * item.price) || 0;
          dryCleanQty += item.quantity || 0;
        }
      });
      const hasDryClean = (o.items || []).some(item => (item.name || '').toLowerCase().includes('dry clean') || (item.name || '').toLowerCase().includes('dry cleaning'));
      if (hasDryClean) {
        dryCleanOrders++;
      }
    }
  });

  activeWalkin.forEach(o => {
    if (o.status === 'Pending') {
      pendingOrders++;
    }
    const oDateLocalStr = new Date(new Date(o.createdAt).getTime() - new Date(o.createdAt).getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (oDateLocalStr === todayLocalStr && o.status !== 'Cancelled') {
      todaysOrders++;
      todaysRevenue += o.grandTotal || 0;
    }

    if (o.status !== 'Cancelled') {
      const sales = o.grandTotal || 0;
      revenue += sales;
      walkinRevenue += sales;
      (o.services || []).forEach(item => {
        surahiCost += item.surahiTotalCost || 0;
        const isDryClean = (item.name || '').toLowerCase().includes('dry clean') || (item.name || '').toLowerCase().includes('dry cleaning');
        if (isDryClean) {
          dryCleanRevenue += item.subtotal || (item.quantity * item.price) || 0;
          dryCleanQty += item.quantity || 0;
        }
      });
      const hasDryClean = (o.services || []).some(item => (item.name || '').toLowerCase().includes('dry clean') || (item.name || '').toLowerCase().includes('dry cleaning'));
      if (hasDryClean) {
        dryCleanOrders++;
      }
    }
  });

  // Calculate unique customer count
  const customerPhones = new Set();
  activeWeb.forEach(o => { if (o.customer?.phone) customerPhones.add(o.customer.phone); });
  activeWalkin.forEach(o => { if (o.customer?.phone) customerPhones.add(o.customer.phone); });

  const uniqueCustomers = customerPhones.size;
  const aov = ordersCount > 0 ? revenue / ordersCount : 0;
  const expenseAmount = expensesList.reduce((sum, e) => sum + Math.max(0, Number(e.amount) || 0), 0);
  const netProfit = revenue - surahiCost;

  // Outstanding calculations
  let outstandingAmount = 0;
  activeWeb.forEach(o => {
    if (o.paymentStatus !== 'Paid') outstandingAmount += o.totalAmount || 0;
  });
  activeWalkin.forEach(o => {
    outstandingAmount += o.payment?.balanceDue || 0;
  });

  const amountCollected = Math.max(0, revenue - outstandingAmount);

  return {
    revenue,
    ordersCount,
    aov,
    uniqueCustomers,
    surahiCost,
    expenseAmount,
    netProfit,
    outstandingAmount,
    amountCollected,
    dryCleanRevenue,
    dryCleanCost: surahiCost,
    dryCleanOrders,
    dryCleanQty,
    pendingOrders,
    todaysOrders,
    todaysRevenue,
    walkinOrdersCount,
    walkinRevenue,
    websiteOrdersCount,
    websiteRevenue,
    customerPhones: Array.from(customerPhones)
  };
}

router.get('/', async (req, res) => {
  try {
    const { branch, trendMode = 'daily' } = req.query;

    const parsedRange = parseDateRange(req.query);

    const webBranchFilter = branch && branch !== 'all' ? { 'selectedBranch.id': branch } : {};
    const walkinBranchFilter = branch && branch !== 'all' ? { 'branch.id': branch } : {};
    const expBranchFilter = branch && branch !== 'all' ? { 'outlet.id': branch } : {};
    const invBranchFilter = branch && branch !== 'all' ? { 'outlet.id': branch } : {};

    // Filters for Current Period
    const dateFilter = buildMongooseFilter(parsedRange, 'createdAt');
    const expDateFilter = buildMongooseFilter(parsedRange, 'date');
    const invDateFilter = buildMongooseFilter(parsedRange, 'date');

    // Filters for Previous Period
    const prevDateFilter = buildMongoosePrevFilter(parsedRange, 'createdAt');
    const prevExpDateFilter = buildMongoosePrevFilter(parsedRange, 'date');

    // Fetch Current Data
    const [webOrders, walkinOrders, expenses, invItems, invTransactions] = await Promise.all([
      Order.find({ ...webBranchFilter, ...dateFilter }).sort({ createdAt: 1 }).lean(),
      WalkInOrder.find({ ...walkinBranchFilter, ...dateFilter }).sort({ createdAt: 1 }).lean(),
      Expense.find({ ...expBranchFilter, ...expDateFilter }).lean(),
      InventoryItem.find({ isActive: true }).sort({ name: 1 }).lean(),
      InventoryTransaction.find({ ...invBranchFilter, ...invDateFilter }).lean()
    ]);

    // Fetch Previous Data
    const [prevWebOrders, prevWalkinOrders, prevExpenses] = await Promise.all([
      Order.find({ ...webBranchFilter, ...prevDateFilter }).lean(),
      WalkInOrder.find({ ...walkinBranchFilter, ...prevDateFilter }).lean(),
      Expense.find({ ...expBranchFilter, ...prevExpDateFilter }).lean()
    ]);

    // Aggregate Current & Previous Period stats
    const currentStats = aggregateStats(webOrders, walkinOrders, expenses);
    const prevStats = aggregateStats(prevWebOrders, prevWalkinOrders, prevExpenses);

    // Calculate customer cohort metrics (New vs Returning)
    const minDatesAgg = await Promise.all([
      Order.aggregate([
        { $group: { _id: '$customer.phone', minDate: { $min: '$createdAt' } } }
      ]),
      WalkInOrder.aggregate([
        { $group: { _id: '$customer.phone', minDate: { $min: '$createdAt' } } }
      ])
    ]);

    const customerFirstOrderMap = {};
    minDatesAgg[0].forEach(item => {
      if (item._id) customerFirstOrderMap[item._id] = new Date(item.minDate);
    });
    minDatesAgg[1].forEach(item => {
      if (item._id) {
        const existing = customerFirstOrderMap[item._id];
        const walkinDate = new Date(item.minDate);
        if (!existing || walkinDate < existing) {
          customerFirstOrderMap[item._id] = walkinDate;
        }
      }
    });

    let newCustomersCount = 0;
    let returningCustomersCount = 0;

    const startBoundary = parsedRange.type === 'discrete' 
      ? parsedRange.current[0].start 
      : parsedRange.current.start;
    const endBoundary = parsedRange.type === 'discrete' 
      ? parsedRange.current[parsedRange.current.length - 1].end 
      : parsedRange.current.end;

    currentStats.customerPhones.forEach(phone => {
      const firstOrderDate = customerFirstOrderMap[phone];
      if (firstOrderDate && firstOrderDate >= startBoundary && firstOrderDate <= endBoundary) {
        newCustomersCount++;
      } else {
        returningCustomersCount++;
      }
    });

    // Calculate Repeat Customer rates overall
    const orderCountsAgg = await Promise.all([
      Order.aggregate([
        { $group: { _id: '$customer.phone', count: { $sum: 1 } } }
      ]),
      WalkInOrder.aggregate([
        { $group: { _id: '$customer.phone', count: { $sum: 1 } } }
      ])
    ]);

    const customerTotalOrdersMap = {};
    orderCountsAgg[0].forEach(item => {
      if (item._id) customerTotalOrdersMap[item._id] = item.count;
    });
    orderCountsAgg[1].forEach(item => {
      if (item._id) {
        customerTotalOrdersMap[item._id] = (customerTotalOrdersMap[item._id] || 0) + item.count;
      }
    });

    const totalUniqueCustomersDB = Object.keys(customerTotalOrdersMap).length;
    const repeatCustomersDB = Object.values(customerTotalOrdersMap).filter(count => count >= 2).length;
    const repeatCustomerPercentage = totalUniqueCustomersDB > 0 ? (repeatCustomersDB / totalUniqueCustomersDB) * 100 : 0;

    // Trend Buckets Generation
    const trendData = {};
    if (parsedRange.type === 'range') {
      let cur = new Date(parsedRange.current.start);
      const end = new Date(parsedRange.current.end);
      while (cur <= end) {
        let key;
        if (trendMode === 'monthly') {
          key = cur.toLocaleString('default', { month: 'short', year: 'numeric' });
        } else if (trendMode === 'weekly') {
          const tempDate = new Date(cur.valueOf());
          const dayNum = (cur.getDay() + 6) % 7;
          tempDate.setDate(tempDate.getDate() - dayNum + 3);
          const firstThursday = tempDate.valueOf();
          tempDate.setMonth(0, 1);
          if (tempDate.getDay() !== 4) {
            tempDate.setMonth(0, 1 + ((4 - tempDate.getDay() + 7) % 7));
          }
          const weekNum = 1 + Math.ceil((firstThursday - tempDate) / 604800000);
          key = `W${weekNum} (${cur.getFullYear()})`;
        } else {
          key = cur.toISOString().slice(0, 10);
        }
        
        if (!trendData[key]) {
          trendData[key] = { label: key, revenue: 0, orders: 0 };
        }
        
        if (trendMode === 'monthly') {
          cur.setMonth(cur.getMonth() + 1);
        } else if (trendMode === 'weekly') {
          cur.setDate(cur.getDate() + 7);
        } else {
          cur.setDate(cur.getDate() + 1);
        }
      }
    }

    const allCombined = [
      ...webOrders.map(o => ({ ...o, _type: 'Website' })),
      ...walkinOrders.map(o => ({ ...o, _type: 'Walk-in' }))
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    allCombined.forEach(o => {
      if (o.status === 'Cancelled') return;
      const oDate = new Date(o.createdAt);
      let key;
      if (trendMode === 'monthly') {
        key = oDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      } else if (trendMode === 'weekly') {
        const tempDate = new Date(oDate.valueOf());
        const dayNum = (oDate.getDay() + 6) % 7;
        tempDate.setDate(tempDate.getDate() - dayNum + 3);
        const firstThursday = tempDate.valueOf();
        tempDate.setMonth(0, 1);
        if (tempDate.getDay() !== 4) {
          tempDate.setMonth(0, 1 + ((4 - tempDate.getDay() + 7) % 7));
        }
        const weekNum = 1 + Math.ceil((firstThursday - tempDate) / 604800000);
        key = `W${weekNum} (${oDate.getFullYear()})`;
      } else {
        key = oDate.toISOString().slice(0, 10);
      }

      const amt = o._type === 'Website' ? o.totalAmount : o.grandTotal;
      if (!trendData[key]) {
        trendData[key] = { label: key, revenue: 0, orders: 0 };
      }
      trendData[key].revenue += amt;
      trendData[key].orders++;
    });

    const trendPoints = Object.values(trendData);

    // Service Performance aggregation
    const serviceMap = {};
    allCombined.forEach(o => {
      if (o.status === 'Cancelled') return;
      const itemsList = o._type === 'Website' ? (o.items || []) : (o.services || []);
      itemsList.forEach(item => {
        const name = item.name || 'Other';
        if (!serviceMap[name]) {
          serviceMap[name] = { name, orders: 0, qty: 0, revenue: 0, directCost: 0, profit: 0 };
        }
        serviceMap[name].orders++;
        serviceMap[name].qty += Math.max(0, Number(item.quantity) || 0);
        
        const qty = Math.max(0, Number(item.quantity) || 0);
        const price = Math.max(0, Number(item.price) || 0);
        const rev = o._type === 'Website' ? (qty * price) : (Math.max(0, Number(item.subtotal) || qty * price));
        serviceMap[name].revenue += rev;
        serviceMap[name].directCost += Math.max(0, Number(item.surahiTotalCost) || 0);
      });
    });

    Object.values(serviceMap).forEach(s => {
      s.profit = s.revenue - s.directCost;
      s.revenuePercentage = currentStats.revenue > 0 ? (s.revenue / currentStats.revenue) * 100 : 0;
    });

    const serviceList = Object.values(serviceMap).sort((a, b) => b.revenue - a.revenue);
    const topService = serviceList[0] || null;
    const lowestService = serviceList.length > 0 ? serviceList[serviceList.length - 1] : null;

    // Outlet Performance aggregation
    const outletMap = {};
    adminBranches.forEach(b => {
      outletMap[b.id] = { id: b.id, name: b.name, orders: 0, revenue: 0, aov: 0, collected: 0, outstanding: 0, surahiCost: 0, expenses: 0, profit: 0 };
    });

    allCombined.forEach(o => {
      let branchId = o._type === 'Website' ? o.selectedBranch?.id : o.branch?.id;
      if (!branchId || !outletMap[branchId]) {
        branchId = 'vijaynagar-mysuru'; // Fallback to a valid branch
      }

      outletMap[branchId].orders++;
      if (o.status === 'Cancelled') return;

      const rev = o._type === 'Website' ? Math.max(0, o.totalAmount || 0) : Math.max(0, o.grandTotal || 0);
      const col = o._type === 'Website' ? (o.paymentStatus === 'Paid' ? rev : 0) : Math.max(0, o.payment?.amountPaid || 0);
      const out = o._type === 'Website' ? (o.paymentStatus !== 'Paid' ? rev : 0) : Math.max(0, o.payment?.balanceDue || 0);

      outletMap[branchId].revenue += rev;
      outletMap[branchId].collected += col;
      outletMap[branchId].outstanding += out;

      const itemsList = o._type === 'Website' ? (o.items || []) : (o.services || []);
      itemsList.forEach(item => {
        outletMap[branchId].surahiCost += Math.max(0, Number(item.surahiTotalCost) || 0);
      });
    });

    expenses.forEach(e => {
      let branchId = e.outlet?.id;
      if (!branchId || !outletMap[branchId]) {
        branchId = 'vijaynagar-mysuru'; // Fallback to default branch
      }
      if (outletMap[branchId]) {
        outletMap[branchId].expenses += Math.max(0, Number(e.amount) || 0);
      }
    });

    Object.values(outletMap).forEach(out => {
      out.aov = out.orders > 0 ? out.revenue / out.orders : 0;
      out.profit = out.revenue - out.surahiCost; // Profit = Revenue - COGS (surahiCost)
    });

    const outletList = Object.values(outletMap).sort((a, b) => b.revenue - a.revenue);
    const bestOutlet = Object.values(outletMap).sort((a, b) => b.profit - a.profit)[0] || null;

    // Payment Analytics aggregation
    const paymentMap = {
      Cash: 0,
      UPI: 0,
      Card: 0,
      Other: 0,
      Outstanding: currentStats.outstandingAmount
    };
    allCombined.forEach(o => {
      if (o.status === 'Cancelled') return;
      const method = o._type === 'Website' ? (o.paymentMethod || 'Online') : (o.payment?.method || 'Cash');
      const collected = o._type === 'Website' ? (o.paymentStatus === 'Paid' ? o.totalAmount : 0) : Math.max(0, o.payment?.amountPaid || 0);
      
      const mLower = method.toLowerCase();
      if (mLower.includes('cash')) {
        paymentMap.Cash += collected;
      } else if (mLower.includes('upi') || mLower.includes('gpay') || mLower.includes('phonepe') || mLower.includes('paytm') || mLower.includes('qr')) {
        paymentMap.UPI += collected;
      } else if (mLower.includes('card') || mLower.includes('debit') || mLower.includes('credit')) {
        paymentMap.Card += collected;
      } else {
        paymentMap.Other += collected;
      }
    });

    // Inventory Insights aggregation
    const invItemsCount = {
      healthy: invItems.filter(item => item.currentStock > item.minStock).length,
      low: invItems.filter(item => item.currentStock <= item.minStock && item.currentStock > 0).length,
      critical: invItems.filter(item => item.currentStock <= 0).length
    };

    const criticalAlerts = invItems.filter(item => item.currentStock <= item.minStock).map(item => ({
      name: item.name,
      currentStock: item.currentStock,
      minStock: item.minStock,
      status: item.currentStock <= 0 ? '🔴 Critical' : '🟠 Low'
    }));

    const usedInventoryMap = {};
    invTransactions.forEach(t => {
      if (t.type === 'Stock Out') {
        if (!usedInventoryMap[t.itemName]) {
          usedInventoryMap[t.itemName] = 0;
        }
        usedInventoryMap[t.itemName] += Math.max(0, Number(t.quantity) || 0);
      }
    });
    const mostUsedInventory = Object.entries(usedInventoryMap)
      .map(([name, qty]) => ({ name, quantity: qty }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Business Observations insights list
    const insights = [];

    if (currentStats.revenue > 0) {
      const revDiff = currentStats.revenue - prevStats.revenue;
      const growth = prevStats.revenue > 0 ? (revDiff / prevStats.revenue) * 100 : 100;
      if (growth >= 0) {
        insights.push(`📈 Revenue increased ${growth.toFixed(0)}% compared with the previous period.`);
      } else {
        insights.push(`📉 Revenue decreased ${Math.abs(growth).toFixed(0)}% compared with the previous period.`);
      }
    } else {
      insights.push("Not enough data to generate this insight.");
    }

    if (topService && topService.revenue > 0) {
      insights.push(`🏆 ${topService.name} is currently the highest-revenue service.`);
    } else {
      insights.push("Not enough data to generate this insight.");
    }

    if (bestOutlet && bestOutlet.profit > 0) {
      let outletName = bestOutlet.name.replace('Mr. WashWala - ', '');
      if (outletName.includes('2nd Stage')) outletName = 'Vijayanagar Second Stage';
      if (outletName.includes('4th Stage')) outletName = 'Vijayanagar Fourth Stage';
      if (outletName.includes('1st Stage')) outletName = 'Kuvempunagar First Stage';
      insights.push(`🏪 ${outletName} is the highest-performing outlet.`);
    } else {
      insights.push("Not enough data to generate this insight.");
    }

    if (totalUniqueCustomersDB > 0) {
      insights.push(`👥 Returning customers represent ${repeatCustomerPercentage.toFixed(0)}% of customers.`);
    } else {
      insights.push("Not enough data to generate this insight.");
    }

    const criticalStockItems = invItems.filter(item => item.currentStock <= item.minStock);
    if (criticalStockItems.length > 0) {
      insights.push(`⚠️ ${criticalStockItems[0].name} stock is below the recommended level.`);
    } else {
      insights.push("All inventory stock levels are healthy.");
    }

    if (currentStats.dryCleanRevenue > 0) {
      const dryCleanProfit = currentStats.dryCleanRevenue - currentStats.dryCleanCost;
      insights.push(`💰 Dry Cleaning generated ₹${dryCleanProfit.toLocaleString('en-IN')} profit after Surahi cost.`);
    } else {
      insights.push("Not enough data to generate this insight.");
    }

    // Response structure
    res.json({
      success: true,
      currentPeriod: {
        start: startBoundary,
        end: endBoundary
      },
      kpis: {
        revenue: currentStats.revenue,
        prevRevenue: prevStats.revenue,
        orders: currentStats.ordersCount,
        prevOrders: prevStats.ordersCount,
        aov: currentStats.aov,
        prevAov: prevStats.aov,
        uniqueCustomers: currentStats.uniqueCustomers,
        prevUniqueCustomers: prevStats.uniqueCustomers,
        netProfit: currentStats.netProfit,
        prevNetProfit: prevStats.netProfit,
        pendingOrders: currentStats.pendingOrders,
        prevPendingOrders: prevStats.pendingOrders,
        todaysOrders: currentStats.todaysOrders,
        prevTodaysOrders: prevStats.todaysOrders,
        todaysRevenue: currentStats.todaysRevenue,
        prevTodaysRevenue: prevStats.todaysRevenue,
        walkinOrders: currentStats.walkinOrdersCount,
        prevWalkinOrders: prevStats.walkinOrdersCount,
        walkinRevenue: currentStats.walkinRevenue,
        prevWalkinRevenue: prevStats.walkinRevenue,
        websiteOrders: currentStats.websiteOrdersCount,
        prevWebsiteOrders: prevStats.websiteOrdersCount,
        websiteRevenue: currentStats.websiteRevenue,
        prevWebsiteRevenue: prevStats.websiteRevenue,
        surahiCost: currentStats.surahiCost,
        prevSurahiCost: prevStats.surahiCost,
        outstandingAmount: currentStats.outstandingAmount,
        amountCollected: currentStats.amountCollected,
        revenueGrowth: prevStats.revenue > 0 ? ((currentStats.revenue - prevStats.revenue) / prevStats.revenue) * 100 : (currentStats.revenue > 0 ? 100 : 0)
      },
      trends: trendPoints,
      services: {
        list: serviceList,
        top: topService,
        lowest: lowestService
      },
      outlets: {
        list: outletList,
        best: bestOutlet
      },
      customers: {
        total: currentStats.uniqueCustomers,
        new: newCustomersCount,
        returning: returningCustomersCount,
        repeatRate: repeatCustomerPercentage,
        avgSpend: currentStats.uniqueCustomers > 0 ? currentStats.revenue / currentStats.uniqueCustomers : 0
      },
      payment: paymentMap,
      dryCleaning: {
        revenue: currentStats.dryCleanRevenue,
        cost: currentStats.dryCleanCost,
        profit: currentStats.dryCleanRevenue - currentStats.dryCleanCost,
        margin: currentStats.dryCleanRevenue > 0 ? ((currentStats.dryCleanRevenue - currentStats.dryCleanCost) / currentStats.dryCleanRevenue) * 100 : 0,
        orders: currentStats.dryCleanOrders,
        qty: currentStats.dryCleanQty
      },
      inventory: {
        counts: invItemsCount,
        criticalAlerts,
        mostUsed: mostUsedInventory
      },
      insights
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process analytics data', error: error.message });
  }
});

export default router;
