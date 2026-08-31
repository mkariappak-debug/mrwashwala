import express from 'express';
import exceljs from 'exceljs';
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

// Helper to build date filter
function buildDateFilterForField(query, fieldName = 'createdAt') {
  const { from, to, dates } = query;

  if (dates) {
    const datesList = dates.split(',').map(d => d.trim()).filter(Boolean);
    if (datesList.length > 0) {
      const orList = datesList.map(dStr => {
        const [year, month, day] = dStr.split('-').map(Number);
        const start = new Date(year, month - 1, day, 0, 0, 0, 0);
        const end = new Date(year, month - 1, day, 23, 59, 59, 999);
        return { [fieldName]: { $gte: start, $lte: end } };
      });
      return { $or: orList };
    }
  }

  if (from || to) {
    const filter = {};
    if (from) {
      const [fYear, fMonth, fDay] = from.split('-').map(Number);
      filter.$gte = new Date(fYear, fMonth - 1, fDay, 0, 0, 0, 0);
    }
    if (to) {
      const [tYear, tMonth, tDay] = to.split('-').map(Number);
      filter.$lte = new Date(tYear, tMonth - 1, tDay, 23, 59, 59, 999);
    }
    return { [fieldName]: filter };
  }

  // Default: Today
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  return { [fieldName]: { $gte: start, $lte: end } };
}

function buildDateFilter(query) {
  return buildDateFilterForField(query, 'createdAt');
}

// Calculate financial sums for a list of orders
function calculateFinancials(webOrders, walkinOrders) {
  let sales = 0;
  let collected = 0;
  let outstanding = 0;
  let surahiCost = 0;

  webOrders.forEach(o => {
    if (o.status === 'Cancelled') return;
    sales += o.totalAmount || 0;
    if (o.paymentStatus === 'Paid') {
      collected += o.totalAmount || 0;
    } else {
      outstanding += o.totalAmount || 0;
    }

    // Sum Surahi Cost
    (o.items || []).forEach(item => {
      surahiCost += item.surahiTotalCost || 0;
    });
  });

  walkinOrders.forEach(o => {
    if (o.status === 'Cancelled') return;
    sales += o.grandTotal || 0;
    collected += o.payment?.amountPaid || 0;
    outstanding += o.payment?.balanceDue || 0;

    // Sum Surahi Cost
    (o.services || []).forEach(item => {
      surahiCost += item.surahiTotalCost || 0;
    });
  });

  return {
    sales,
    collected,
    outstanding,
    surahiCost,
    profit: sales - surahiCost
  };
}

// @desc    Get revenue summary statistics (Today & Monthly)
// @route   GET /api/revenue/summary
// @access  Admin
router.get('/summary', async (req, res) => {
  try {
    const { branch } = req.query;

    // 1. Build date filter for Today
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    // 2. Build date filter for Month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Filters by branch
    const webBranchFilter = branch && branch !== 'all' ? { 'selectedBranch.id': branch } : {};
    const walkinBranchFilter = branch && branch !== 'all' ? { 'branch.id': branch } : {};

    // TODAY
    const [todayWeb, todayWalkin] = await Promise.all([
      Order.find({ ...webBranchFilter, createdAt: { $gte: todayStart, $lte: todayEnd } }).lean(),
      WalkInOrder.find({ ...walkinBranchFilter, createdAt: { $gte: todayStart, $lte: todayEnd } }).lean()
    ]);
    const todayStats = calculateFinancials(todayWeb, todayWalkin);

    // MONTHLY
    const [monthWeb, monthWalkin] = await Promise.all([
      Order.find({ ...webBranchFilter, createdAt: { $gte: monthStart, $lte: monthEnd } }).lean(),
      WalkInOrder.find({ ...walkinBranchFilter, createdAt: { $gte: monthStart, $lte: monthEnd } }).lean()
    ]);
    const monthlyStats = calculateFinancials(monthWeb, monthWalkin);

    res.json({
      today: todayStats,
      monthly: monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch revenue summary', error: error.message });
  }
});

// @desc    Get detailed revenue activity by selected dates
// @route   GET /api/revenue/details
// @access  Admin
router.get('/details', async (req, res) => {
  try {
    const { branch } = req.query;
    const dateFilter = buildDateFilter(req.query);

    const webBranchFilter = branch && branch !== 'all' ? { 'selectedBranch.id': branch } : {};
    const walkinBranchFilter = branch && branch !== 'all' ? { 'branch.id': branch } : {};

    const [webOrders, walkinOrders] = await Promise.all([
      Order.find({ ...webBranchFilter, ...dateFilter }).lean(),
      WalkInOrder.find({ ...walkinBranchFilter, ...dateFilter }).lean()
    ]);

    const stats = calculateFinancials(webOrders, walkinOrders);

    // Combine, format, and map orders list
    const mappedWeb = webOrders.map(o => ({
      orderId: o.orderId,
      customerName: o.customer?.name || '—',
      date: o.createdAt,
      type: 'Website',
      bill: o.totalAmount,
      collected: o.paymentStatus === 'Paid' ? o.totalAmount : 0,
      outstanding: o.paymentStatus !== 'Paid' ? o.totalAmount : 0,
      surahiCost: (o.items || []).reduce((sum, item) => sum + (item.surahiTotalCost || 0), 0),
      itemsSummary: (o.items || []).map(item => `${item.name} (x${item.quantity})`).join(', '),
      status: o.status
    }));

    const mappedWalkin = walkinOrders.map(o => ({
      orderId: o.orderId,
      customerName: o.customer?.name || '—',
      date: o.createdAt,
      type: 'Walk-in',
      bill: o.grandTotal,
      collected: o.payment?.amountPaid || 0,
      outstanding: o.payment?.balanceDue || 0,
      surahiCost: (o.services || []).reduce((sum, item) => sum + (item.surahiTotalCost || 0), 0),
      itemsSummary: (o.services || []).map(item => `${item.name} (x${item.quantity})`).join(', '),
      status: o.status
    }));

    const allOrders = [...mappedWeb, ...mappedWalkin].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      summary: {
        totalOrders: webOrders.length + walkinOrders.length,
        sales: stats.sales,
        collected: stats.collected,
        outstanding: stats.outstanding,
        surahiCost: stats.surahiCost,
        profit: stats.profit
      },
      orders: allOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch date details', error: error.message });
  }
});

// @desc    Export revenue, inventory, and expenses detailed Excel workbook
// @route   GET /api/revenue/export-excel
// @access  Admin
router.get('/export-excel', async (req, res) => {
  try {
    const { branch, label = 'Selected Period' } = req.query;
    
    console.log('[DEBUG] Excel export request received.');
    console.log(`[DEBUG] Authenticated User ID: ${req.user?.id || req.user?.email || 'unknown'}`);
    console.log(`[DEBUG] branch parameter: ${branch}`);
    console.log(`[DEBUG] label parameter: ${label}`);
    console.log(`[DEBUG] from date parameter: ${req.query.from || 'not provided'}`);
    console.log(`[DEBUG] to date parameter: ${req.query.to || 'not provided'}`);
    console.log(`[DEBUG] dates parameter: ${req.query.dates || 'not provided'}`);

    // Build date filters using field-specific helpers
    const dateFilter = buildDateFilter(req.query);
    const expDateFilter = buildDateFilterForField(req.query, 'date');
    const invDateFilter = buildDateFilterForField(req.query, 'date');

    const webBranchFilter = branch && branch !== 'all' ? { 'selectedBranch.id': branch } : {};
    const walkinBranchFilter = branch && branch !== 'all' ? { 'branch.id': branch } : {};

    // 1. Fetch Orders, Expenses, Inventory Items and Transactions
    const [webOrders, walkinOrders, expenses, invItems, invTransactions] = await Promise.all([
      Order.find({ ...webBranchFilter, ...dateFilter }).sort({ createdAt: -1 }).lean(),
      WalkInOrder.find({ ...walkinBranchFilter, ...dateFilter }).sort({ createdAt: -1 }).lean(),
      Expense.find({ 
        ...(branch && branch !== 'all' ? { 'outlet.id': branch } : {}), 
        ...expDateFilter 
      }).sort({ date: -1 }).lean(),
      InventoryItem.find({ isActive: true }).sort({ name: 1 }).lean(),
      InventoryTransaction.find({ 
        ...(branch && branch !== 'all' ? { 'outlet.id': branch } : {}), 
        ...invDateFilter 
      }).sort({ date: -1 }).lean()
    ]);

    console.log(`[DEBUG] Number of website orders found: ${webOrders.length}`);
    console.log(`[DEBUG] Number of walk-in orders found: ${walkinOrders.length}`);
    console.log(`[DEBUG] Number of expenses found: ${expenses.length}`);
    console.log(`[DEBUG] Number of inventory transactions found: ${invTransactions.length}`);

    const workbook = new exceljs.Workbook();
    workbook.creator = 'Mr. WashWala Admin';
    workbook.created = new Date();

    // Styles Setup
    const headerStyle = {
      font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } }, // Slate 900
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { argb: '1E293B' } },
        left: { style: 'thin', color: { argb: '1E293B' } },
        bottom: { style: 'medium', color: { argb: '0F172A' } },
        right: { style: 'thin', color: { argb: '1E293B' } }
      }
    };

    const dataStyle = {
      font: { name: 'Arial', size: 9 },
      border: {
        top: { style: 'thin', color: { argb: 'F1F5F9' } },
        left: { style: 'thin', color: { argb: 'F1F5F9' } },
        bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
        right: { style: 'thin', color: { argb: 'F1F5F9' } }
      }
    };

    const totalsStyle = {
      font: { name: 'Arial', size: 10, bold: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } }, // Slate 50
      border: {
        top: { style: 'thin', color: { argb: '0F172A' } },
        bottom: { style: 'double', color: { argb: '0F172A' } },
        left: { style: 'thin', color: { argb: 'E2E8F0' } },
        right: { style: 'thin', color: { argb: 'E2E8F0' } }
      }
    };

    const activeWebOrders = webOrders.filter(o => o.status !== 'Cancelled');
    const activeWalkinOrders = walkinOrders.filter(o => o.status !== 'Cancelled');
    const stats = calculateFinancials(webOrders, walkinOrders);
    
    const totalOrders = webOrders.length + walkinOrders.length;
    const activeOrdersCount = activeWebOrders.length + activeWalkinOrders.length;
    const cancelledCount = totalOrders - activeOrdersCount;
    const completedCount = activeWebOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered').length + activeWalkinOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered').length;
    const pendingCount = activeOrdersCount - completedCount;

    const totalCustomerSales = stats.sales;
    const amountCollected = stats.collected;
    const outstandingAmount = stats.outstanding;
    const surahiDryCleanCost = stats.surahiCost;
    const businessExpenses = expenses.reduce((sum, e) => sum + Math.max(0, Number(e.amount) || 0), 0);
    const netProfit = totalCustomerSales - surahiDryCleanCost - businessExpenses;

    const allCombined = [
      ...webOrders.map(o => ({ ...o, _type: 'Website' })),
      ...walkinOrders.map(o => ({ ...o, _type: 'Walk-in' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // ==========================================
    // SHEET 1: Executive Summary
    // ==========================================
    const sh1 = workbook.addWorksheet('Executive Summary');
    sh1.views = [{ showGridLines: true }];
    sh1.getColumn(1).width = 32;
    sh1.getColumn(2).width = 24;

    sh1.addRow([]);
    sh1.addRow(['MR. WASHWALA EXECUTIVE REPORT']);
    sh1.addRow([`Period: ${label}`]);
    sh1.addRow([`Branch Filter: ${branch === 'all' ? 'All Outlets' : (branch || 'All')}`]);
    sh1.addRow([`Generated: ${new Date().toLocaleDateString('en-IN')}`]);
    sh1.addRow([]);

    sh1.mergeCells('A2:B2');
    sh1.getCell('A2').font = { name: 'Arial', size: 14, bold: true, color: { argb: '0F172A' } };
    sh1.getCell('A3').font = { name: 'Arial', size: 10, italic: true, color: { argb: '475569' } };
    sh1.getCell('A4').font = { name: 'Arial', size: 10, italic: true, color: { argb: '475569' } };
    sh1.getCell('A5').font = { name: 'Arial', size: 9, italic: true, color: { argb: '64748B' } };

    const metrics = [
      ['Total Orders (Active)', activeOrdersCount],
      ['Completed Orders', completedCount],
      ['Pending Orders', pendingCount],
      ['Cancelled Orders', cancelledCount],
      ['Total Customer Sales', totalCustomerSales],
      ['Amount Collected', amountCollected],
      ['Outstanding Amount', outstandingAmount],
      ['Surahi Dry-Cleaning Cost', surahiDryCleanCost],
      ['Business Expenses', businessExpenses],
      ['Net Profit', netProfit]
    ];

    metrics.forEach(([lbl, val]) => {
      sh1.addRow([lbl, val]);
    });

    // Format metrics rows
    for (let r = 7; r <= 16; r++) {
      const isHeader = r < 11;
      sh1.getCell(`A${r}`).font = { name: 'Arial', size: 10, bold: true };
      sh1.getCell(`B${r}`).alignment = { horizontal: 'right' };
      sh1.getCell(`A${r}`).border = dataStyle.border;
      sh1.getCell(`B${r}`).border = dataStyle.border;
      if (!isHeader) {
        sh1.getCell(`B${r}`).numFmt = '₹#,##0.00';
      }
      if (r === 16) {
        sh1.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
        sh1.getCell(`B${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
        sh1.getCell(`B${r}`).font = { name: 'Arial', size: 10, bold: true, color: { argb: netProfit >= 0 ? '047857' : 'B91C1C' } };
      }
    }

    sh1.addRow([]);
    sh1.addRow([]);
    sh1.addRow(['SERVICE-WISE REVENUE SUMMARY']);
    sh1.mergeCells(`A19:B19`);
    sh1.getCell('A19').font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    sh1.getCell('A19').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
    sh1.getCell('A19').alignment = { horizontal: 'center' };

    sh1.addRow(['Service Name', 'Revenue']);
    sh1.getCell('A20').font = { name: 'Arial', size: 10, bold: true };
    sh1.getCell('B20').font = { name: 'Arial', size: 10, bold: true };
    sh1.getCell('B20').alignment = { horizontal: 'right' };

    // Compute service-wise revenue sums
    const serviceSummaryAgg = {};
    [...activeWebOrders, ...activeWalkinOrders].forEach(o => {
      const itemsList = o._type === 'Website' ? (o.items || []) : (o.services || []);
      itemsList.forEach(item => {
        const sName = item.name || 'Other';
        if (!serviceSummaryAgg[sName]) {
          serviceSummaryAgg[sName] = 0;
        }
        const qty = Math.max(0, Number(item.quantity) || 0);
        const price = Math.max(0, Number(item.price) || 0);
        const rev = o._type === 'Website' ? (qty * price) : (Math.max(0, Number(item.subtotal) || qty * price));
        serviceSummaryAgg[sName] += rev;
      });
    });

    let sRowIdx = 21;
    Object.entries(serviceSummaryAgg).forEach(([sName, rev]) => {
      sh1.addRow([sName, rev]);
      sh1.getCell(`B${sRowIdx}`).numFmt = '₹#,##0.00';
      sh1.getCell(`B${sRowIdx}`).alignment = { horizontal: 'right' };
      sh1.getCell(`A${sRowIdx}`).border = dataStyle.border;
      sh1.getCell(`B${sRowIdx}`).border = dataStyle.border;
      sRowIdx++;
    });

    // ==========================================
    // SHEET 2: Order Details
    // ==========================================
    const sh2 = workbook.addWorksheet('Order Details');
    sh2.views = [{ showGridLines: true, state: 'frozen', ySplit: 1 }];
    
    const cols2 = [
      'Date', 'Time', 'Order ID', 'Customer Name', 'Customer Phone', 'Branch / Outlet',
      'Service', 'Individual Item', 'Quantity', 'Unit', 'Rate', 'Gross Amount',
      'Discount', 'Final Bill', 'Amount Paid', 'Outstanding', 'Payment Method', 'Order Status'
    ];
    sh2.addRow(cols2);
    sh2.getRow(1).eachCell(c => { c.style = headerStyle; });

    let rowIdx2 = 2;
    allCombined.forEach(o => {
      const dateObj = new Date(o.createdAt);
      const dateStr = dateObj.toLocaleDateString('en-IN');
      const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const orderId = o.orderId;
      const outletName = o._type === 'Website' ? (o.selectedBranch?.name || '—') : (o.branch?.name || '—');
      const custName = o.customer?.name || '—';
      const custPhone = o.customer?.phone || '—';

      const discount = Math.max(0, Number(o.discount) || 0);
      const totalBill = o._type === 'Website' ? Math.max(0, o.totalAmount || 0) : Math.max(0, o.grandTotal || 0);
      const collected = o._type === 'Website' ? (o.paymentStatus === 'Paid' ? totalBill : 0) : Math.max(0, o.payment?.amountPaid || 0);
      const outstanding = o._type === 'Website' ? (o.paymentStatus !== 'Paid' ? totalBill : 0) : Math.max(0, o.payment?.balanceDue || 0);

      const payMethod = o._type === 'Website' ? (o.paymentMethod || 'Online') : (o.payment?.method || '—');
      const orderStatus = o.status;

      const itemsList = o._type === 'Website' ? (o.items || []) : (o.services || []);

      if (itemsList.length === 0) {
        sh2.addRow([
          dateStr, timeStr, orderId, custName, custPhone, outletName,
          'No items', '—', 0, 'Kg', 0, 0,
          discount, totalBill, collected, outstanding, payMethod, orderStatus
        ]);
        
        const r = sh2.getRow(rowIdx2);
        r.eachCell(c => { c.border = dataStyle.border; c.font = dataStyle.font; });
        r.getCell(11).numFmt = '₹#,##0.00';
        r.getCell(12).numFmt = '₹#,##0.00';
        r.getCell(13).numFmt = '₹#,##0.00';
        r.getCell(14).numFmt = '₹#,##0.00';
        r.getCell(15).numFmt = '₹#,##0.00';
        r.getCell(16).numFmt = '₹#,##0.00';
        rowIdx2++;
      } else {
        itemsList.forEach((item, itIdx) => {
          const isFirstItem = itIdx === 0;
          const qty = Math.max(0, Number(item.quantity) || 0);
          const rate = Math.max(0, Number(item.price) || 0);
          const gross = qty * rate;

          sh2.addRow([
            dateStr, timeStr, orderId, custName, custPhone, outletName,
            item.name || 'Service', item.name || 'Item', qty, item.unit || 'Kg', rate, gross,
            isFirstItem ? discount : '',
            isFirstItem ? totalBill : '',
            isFirstItem ? collected : '',
            isFirstItem ? outstanding : '',
            payMethod, orderStatus
          ]);

          const r = sh2.getRow(rowIdx2);
          r.eachCell(c => { c.border = dataStyle.border; c.font = dataStyle.font; });
          r.getCell(11).numFmt = '₹#,##0.00';
          r.getCell(12).numFmt = '₹#,##0.00';
          if (isFirstItem) {
            r.getCell(13).numFmt = '₹#,##0.00';
            r.getCell(14).numFmt = '₹#,##0.00';
            r.getCell(15).numFmt = '₹#,##0.00';
            r.getCell(16).numFmt = '₹#,##0.00';
          }
          rowIdx2++;
        });
      }
    });

    // Add Totals at the bottom of Order Details
    if (rowIdx2 > 2) {
      sh2.addRow([
        'TOTALS', '', '', '', '', '', '', '', '', '', '',
        { formula: `SUM(L2:L${rowIdx2 - 1})` },
        { formula: `SUM(M2:M${rowIdx2 - 1})` },
        { formula: `SUM(N2:N${rowIdx2 - 1})` },
        { formula: `SUM(O2:O${rowIdx2 - 1})` },
        { formula: `SUM(P2:P${rowIdx2 - 1})` },
        '', ''
      ]);
      const lastR = sh2.getRow(rowIdx2);
      lastR.eachCell(c => { c.style = totalsStyle; });
      lastR.getCell(12).numFmt = '₹#,##0.00';
      lastR.getCell(13).numFmt = '₹#,##0.00';
      lastR.getCell(14).numFmt = '₹#,##0.00';
      lastR.getCell(15).numFmt = '₹#,##0.00';
      lastR.getCell(16).numFmt = '₹#,##0.00';
    }

    // ==========================================
    // SHEET 3: Service Revenue
    // ==========================================
    const sh3 = workbook.addWorksheet('Service Revenue');
    sh3.views = [{ showGridLines: true, state: 'frozen', ySplit: 1 }];
    sh3.addRow(['Service Name', 'Number of Orders', 'Quantity / Items', 'Customer Revenue', 'Direct Cost', 'Profit']);
    sh3.getRow(1).eachCell(c => { c.style = headerStyle; });

    const serviceRevenueMap = {};
    [...activeWebOrders, ...activeWalkinOrders].forEach(o => {
      const itemsList = o._type === 'Website' ? (o.items || []) : (o.services || []);
      itemsList.forEach(item => {
        const sName = item.name || 'Other';
        if (!serviceRevenueMap[sName]) {
          serviceRevenueMap[sName] = { name: sName, orderIds: new Set(), qty: 0, revenue: 0, directCost: 0 };
        }
        serviceRevenueMap[sName].orderIds.add(o.orderId);
        serviceRevenueMap[sName].qty += Math.max(0, Number(item.quantity) || 0);

        const qty = Math.max(0, Number(item.quantity) || 0);
        const price = Math.max(0, Number(item.price) || 0);
        const rev = o._type === 'Website' ? (qty * price) : (Math.max(0, Number(item.subtotal) || qty * price));
        serviceRevenueMap[sName].revenue += rev;
        serviceRevenueMap[sName].directCost += Math.max(0, Number(item.surahiTotalCost) || 0);
      });
    });

    let rowIdx3 = 2;
    Object.values(serviceRevenueMap).forEach(s => {
      // Profit formula: Customer Revenue - Direct Cost
      sh3.addRow([
        s.name,
        s.orderIds.size,
        s.qty,
        s.revenue,
        s.directCost,
        { formula: `D${rowIdx3}-E${rowIdx3}` }
      ]);
      const r = sh3.getRow(rowIdx3);
      r.eachCell(c => { c.border = dataStyle.border; c.font = dataStyle.font; });
      r.getCell(4).numFmt = '₹#,##0.00';
      r.getCell(5).numFmt = '₹#,##0.00';
      r.getCell(6).numFmt = '₹#,##0.00';
      rowIdx3++;
    });

    if (rowIdx3 > 2) {
      sh3.addRow([
        'TOTALS',
        { formula: `SUM(B2:B${rowIdx3 - 1})` },
        { formula: `SUM(C2:C${rowIdx3 - 1})` },
        { formula: `SUM(D2:D${rowIdx3 - 1})` },
        { formula: `SUM(E2:E${rowIdx3 - 1})` },
        { formula: `SUM(F2:F${rowIdx3 - 1})` }
      ]);
      const lastR = sh3.getRow(rowIdx3);
      lastR.eachCell(c => { c.style = totalsStyle; });
      lastR.getCell(4).numFmt = '₹#,##0.00';
      lastR.getCell(5).numFmt = '₹#,##0.00';
      lastR.getCell(6).numFmt = '₹#,##0.00';
    }

    // ==========================================
    // SHEET 4: Surahi Dry Cleaning
    // ==========================================
    const sh4 = workbook.addWorksheet('Surahi Dry Cleaning');
    sh4.views = [{ showGridLines: true, state: 'frozen', ySplit: 1 }];
    sh4.addRow([
      'Date', 'Order ID', 'Customer Name', 'Item Description', 'Quantity',
      'Surahi Rate', 'Surahi Total Cost', 'Our Customer Rate', 'Customer Revenue', 'Profit'
    ]);
    sh4.getRow(1).eachCell(c => { c.style = headerStyle; });

    let rowIdx4 = 2;
    allCombined.forEach(o => {
      if (o.status === 'Cancelled') return;
      const itemsList = o._type === 'Website' ? (o.items || []) : (o.services || []);
      
      itemsList.forEach(item => {
        const nameLower = (item.name || '').toLowerCase();
        if (nameLower.includes('dry cleaning') || nameLower.includes('dry clean')) {
          const dateObj = new Date(o.createdAt);
          const dateStr = dateObj.toLocaleDateString('en-IN');
          const custName = o.customer?.name || '—';

          const qty = Math.max(0, Number(item.quantity) || 0);
          const surahiUnit = Math.max(0, Number(item.surahiUnitCost) || 0);
          const surahiTotal = Math.max(0, Number(item.surahiTotalCost) || (surahiUnit * qty));
          const custUnit = Math.max(0, Number(item.price) || 0);
          const custTotal = o._type === 'Website' ? (qty * custUnit) : (Math.max(0, Number(item.subtotal) || qty * custUnit));

          // Profit formula: Customer Revenue - Surahi Total Cost
          sh4.addRow([
            dateStr, o.orderId, custName, item.name, qty,
            surahiUnit, surahiTotal, custUnit, custTotal,
            { formula: `I${rowIdx4}-G${rowIdx4}` }
          ]);

          const r = sh4.getRow(rowIdx4);
          r.eachCell(c => { c.border = dataStyle.border; c.font = dataStyle.font; });
          r.getCell(6).numFmt = '₹#,##0.00';
          r.getCell(7).numFmt = '₹#,##0.00';
          r.getCell(8).numFmt = '₹#,##0.00';
          r.getCell(9).numFmt = '₹#,##0.00';
          r.getCell(10).numFmt = '₹#,##0.00';
          rowIdx4++;
        }
      });
    });

    if (rowIdx4 > 2) {
      sh4.addRow([
        'TOTALS', '', '', '',
        { formula: `SUM(E2:E${rowIdx4 - 1})` },
        '',
        { formula: `SUM(G2:G${rowIdx4 - 1})` },
        '',
        { formula: `SUM(I2:I${rowIdx4 - 1})` },
        { formula: `SUM(J2:J${rowIdx4 - 1})` }
      ]);
      const lastR = sh4.getRow(rowIdx4);
      lastR.eachCell(c => { c.style = totalsStyle; });
      lastR.getCell(7).numFmt = '₹#,##0.00';
      lastR.getCell(9).numFmt = '₹#,##0.00';
      lastR.getCell(10).numFmt = '₹#,##0.00';
    }

    // ==========================================
    // SHEET 5: Inventory Summary
    // ==========================================
    const sh5 = workbook.addWorksheet('Inventory Summary');
    sh5.views = [{ showGridLines: true, state: 'frozen', ySplit: 1 }];
    sh5.addRow([
      'Item Name', 'Category', 'Unit', 'Opening Stock', 'Purchased / Stock In',
      'Used / Stock Out', 'Current Stock', 'Minimum Stock Level', 'Stock Status'
    ]);
    sh5.getRow(1).eachCell(c => { c.style = headerStyle; });

    let rowIdx5 = 2;
    invItems.forEach(item => {
      const itemTx = invTransactions.filter(t => String(t.itemId) === String(item._id));
      const txIn = Math.max(0, itemTx.filter(t => t.type === 'Stock In').reduce((sum, t) => sum + (Number(t.quantity) || 0), 0));
      const txOut = Math.max(0, itemTx.filter(t => t.type === 'Stock Out').reduce((sum, t) => sum + (Number(t.quantity) || 0), 0));
      
      const currentStock = Math.max(0, item.currentStock || 0);
      const minStock = Math.max(0, item.minStock || 0);
      const opening = Math.max(0, currentStock - txIn + txOut);
      
      // Determine dynamic item categories based on name keywords
      const nameLower = (item.name || '').toLowerCase();
      let category = 'General Supplies';
      if (nameLower.includes('detergent') || nameLower.includes('soap') || nameLower.includes('liquid') || nameLower.includes('powder')) {
        category = 'Chemicals / Soaps';
      } else if (nameLower.includes('hanger') || nameLower.includes('poly') || nameLower.includes('bag') || nameLower.includes('tag') || nameLower.includes('roll')) {
        category = 'Packaging Supplies';
      }

      const alertText = currentStock === 0 ? 'Critical' : (currentStock <= minStock ? 'Low' : 'Healthy');

      sh5.addRow([
        item.name,
        category,
        item.unit || 'Kg',
        opening,
        txIn,
        txOut,
        currentStock,
        minStock,
        alertText
      ]);

      const r = sh5.getRow(rowIdx5);
      r.eachCell(c => { c.border = dataStyle.border; c.font = dataStyle.font; });
      r.getCell(4).alignment = { horizontal: 'right' };
      r.getCell(5).alignment = { horizontal: 'right' };
      r.getCell(6).alignment = { horizontal: 'right' };
      r.getCell(7).alignment = { horizontal: 'right' };
      r.getCell(8).alignment = { horizontal: 'right' };
      
      // Light color fills for status levels (Healthy/Low/Critical)
      const statusCell = r.getCell(9);
      statusCell.alignment = { horizontal: 'center' };
      if (alertText === 'Critical') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } }; // Light Red
        statusCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: '991B1B' } };
      } else if (alertText === 'Low') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } }; // Light Amber/Orange
        statusCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: '92400E' } };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } }; // Light Green
        statusCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: '065F46' } };
      }

      rowIdx5++;
    });

    // ==========================================
    // SHEET 6: Inventory Log
    // ==========================================
    const sh6 = workbook.addWorksheet('Inventory Log');
    sh6.views = [{ showGridLines: true, state: 'frozen', ySplit: 1 }];
    sh6.addRow(['Date', 'Item Name', 'Stock IN / OUT', 'Quantity', 'Unit', 'Reason', 'Supplier', 'Cost', 'Branch']);
    sh6.getRow(1).eachCell(c => { c.style = headerStyle; });

    let rowIdx6 = 2;
    invTransactions.forEach(t => {
      const tQty = Math.max(0, Number(t.quantity) || 0);
      const tCost = Math.max(0, Number(t.totalCost) || 0);

      sh6.addRow([
        new Date(t.date).toLocaleDateString('en-IN'),
        t.itemName,
        t.type,
        tQty,
        t.unit || 'Kg',
        t.reason || 'Correction',
        t.supplier || '—',
        tCost,
        t.outlet?.name || 'Store Branch'
      ]);

      const r = sh6.getRow(rowIdx6);
      r.eachCell(c => { c.border = dataStyle.border; c.font = dataStyle.font; });
      r.getCell(8).numFmt = '₹#,##0.00';
      rowIdx6++;
    });

    if (rowIdx6 > 2) {
      sh6.addRow([
        'TOTALS', '', '',
        { formula: `SUM(D2:D${rowIdx6 - 1})` },
        '', '', '',
        { formula: `SUM(H2:H${rowIdx6 - 1})` },
        ''
      ]);
      const lastR = sh6.getRow(rowIdx6);
      lastR.eachCell(c => { c.style = totalsStyle; });
      lastR.getCell(8).numFmt = '₹#,##0.00';
    }

    // ==========================================
    // SHEET 7: Expenses
    // ==========================================
    const sh7 = workbook.addWorksheet('Expenses');
    sh7.views = [{ showGridLines: true, state: 'frozen', ySplit: 1 }];
    sh7.addRow(['Date', 'Expense description', 'Category', 'Description', 'Amount', 'Branch']);
    sh7.getRow(1).eachCell(c => { c.style = headerStyle; });

    let rowIdx7 = 2;
    expenses.forEach(e => {
      const eAmount = Math.max(0, Number(e.amount) || 0);
      sh7.addRow([
        new Date(e.date).toLocaleDateString('en-IN'),
        e.description || 'Expense Item',
        e.category || 'Other',
        e.description || '',
        eAmount,
        e.outlet?.name || 'All Outlets'
      ]);
      const r = sh7.getRow(rowIdx7);
      r.eachCell(c => { c.border = dataStyle.border; c.font = dataStyle.font; });
      r.getCell(5).numFmt = '₹#,##0.00';
      rowIdx7++;
    });

    if (rowIdx7 > 2) {
      sh7.addRow([
        'TOTALS', '', '', '',
        { formula: `SUM(E2:E${rowIdx7 - 1})` },
        ''
      ]);
      const lastR = sh7.getRow(rowIdx7);
      lastR.eachCell(c => { c.style = totalsStyle; });
      lastR.getCell(5).numFmt = '₹#,##0.00';
    }

    // ==========================================
    // SHEET 8: Outlet Summary
    // ==========================================
    const sh8 = workbook.addWorksheet('Outlet Summary');
    sh8.views = [{ showGridLines: true, state: 'frozen', ySplit: 1 }];
    sh8.addRow(['Outlet Name', 'Orders', 'Revenue', 'Collected', 'Outstanding', 'Surahi Cost', 'Expenses', 'Profit']);
    sh8.getRow(1).eachCell(c => { c.style = headerStyle; });

    const outletSummaryMap = {};
    adminBranches.forEach(b => {
      outletSummaryMap[b.id] = { name: b.name, orders: 0, sales: 0, collected: 0, outstanding: 0, surahiCost: 0, expenses: 0 };
    });

    allCombined.forEach(o => {
      let outletId = o._type === 'Website' ? o.selectedBranch?.id : o.branch?.id;
      if (!outletId || !outletSummaryMap[outletId]) {
        outletId = 'vijaynagar-mysuru'; // Fallback to a valid branch
      }

      outletSummaryMap[outletId].orders++;
      if (o.status === 'Cancelled') return;

      const sales = o._type === 'Website' ? Math.max(0, o.totalAmount || 0) : Math.max(0, o.grandTotal || 0);
      const collected = o._type === 'Website' ? (o.paymentStatus === 'Paid' ? sales : 0) : Math.max(0, o.payment?.amountPaid || 0);
      const outstanding = o._type === 'Website' ? (o.paymentStatus !== 'Paid' ? sales : 0) : Math.max(0, o.payment?.balanceDue || 0);
      
      outletSummaryMap[outletId].sales += sales;
      outletSummaryMap[outletId].collected += collected;
      outletSummaryMap[outletId].outstanding += outstanding;

      const itemsList = o._type === 'Website' ? (o.items || []) : (o.services || []);
      itemsList.forEach(item => {
        outletSummaryMap[outletId].surahiCost += Math.max(0, Number(item.surahiTotalCost) || 0);
      });
    });

    expenses.forEach(e => {
      let outletId = e.outlet?.id;
      if (!outletId || !outletSummaryMap[outletId]) {
        outletId = 'vijaynagar-mysuru'; // Fallback to default branch
      }
      if (outletSummaryMap[outletId]) {
        outletSummaryMap[outletId].expenses += Math.max(0, Number(e.amount) || 0);
      }
    });

    let rowIdx8 = 2;
    Object.values(outletSummaryMap).forEach(val => {
      // Profit formula: Revenue - Surahi Cost
      sh8.addRow([
        val.name,
        val.orders,
        val.sales,
        val.collected,
        val.outstanding,
        val.surahiCost,
        val.expenses,
        { formula: `C${rowIdx8}-F${rowIdx8}` }
      ]);

      const r = sh8.getRow(rowIdx8);
      r.eachCell(c => { c.border = dataStyle.border; c.font = dataStyle.font; });
      r.getCell(3).numFmt = '₹#,##0.00';
      r.getCell(4).numFmt = '₹#,##0.00';
      r.getCell(5).numFmt = '₹#,##0.00';
      r.getCell(6).numFmt = '₹#,##0.00';
      r.getCell(7).numFmt = '₹#,##0.00';
      r.getCell(8).numFmt = '₹#,##0.00';
      rowIdx8++;
    });

    if (rowIdx8 > 2) {
      sh8.addRow([
        'TOTALS',
        { formula: `SUM(B2:B${rowIdx8 - 1})` },
        { formula: `SUM(C2:C${rowIdx8 - 1})` },
        { formula: `SUM(D2:D${rowIdx8 - 1})` },
        { formula: `SUM(E2:E${rowIdx8 - 1})` },
        { formula: `SUM(F2:F${rowIdx8 - 1})` },
        { formula: `SUM(G2:G${rowIdx8 - 1})` },
        { formula: `SUM(H2:H${rowIdx8 - 1})` }
      ]);
      const lastR = sh8.getRow(rowIdx8);
      lastR.eachCell(c => { c.style = totalsStyle; });
      lastR.getCell(3).numFmt = '₹#,##0.00';
      lastR.getCell(4).numFmt = '₹#,##0.00';
      lastR.getCell(5).numFmt = '₹#,##0.00';
      lastR.getCell(6).numFmt = '₹#,##0.00';
      lastR.getCell(7).numFmt = '₹#,##0.00';
      lastR.getCell(8).numFmt = '₹#,##0.00';
    }

    // ==========================================
    // SHEET 9: Daily Summary
    // ==========================================
    const sh9 = workbook.addWorksheet('Daily Summary');
    sh9.views = [{ showGridLines: true, state: 'frozen', ySplit: 1 }];
    sh9.addRow(['Date', 'Orders', 'Revenue', 'Collected', 'Outstanding', 'Surahi Cost', 'Expenses', 'Profit']);
    sh9.getRow(1).eachCell(c => { c.style = headerStyle; });

    const dailyAgg = {};
    allCombined.forEach(o => {
      const dStr = new Date(o.createdAt).toLocaleDateString('en-IN');
      if (!dailyAgg[dStr]) {
        dailyAgg[dStr] = { date: dStr, orders: 0, sales: 0, collected: 0, outstanding: 0, surahiCost: 0, expenses: 0 };
      }
      dailyAgg[dStr].orders++;
      if (o.status === 'Cancelled') return;

      const sales = o._type === 'Website' ? Math.max(0, o.totalAmount || 0) : Math.max(0, o.grandTotal || 0);
      const collected = o._type === 'Website' ? (o.paymentStatus === 'Paid' ? sales : 0) : Math.max(0, o.payment?.amountPaid || 0);
      const outstanding = o._type === 'Website' ? (o.paymentStatus !== 'Paid' ? sales : 0) : Math.max(0, o.payment?.balanceDue || 0);

      dailyAgg[dStr].sales += sales;
      dailyAgg[dStr].collected += collected;
      dailyAgg[dStr].outstanding += outstanding;

      const itemsList = o._type === 'Website' ? (o.items || []) : (o.services || []);
      itemsList.forEach(item => {
        dailyAgg[dStr].surahiCost += Math.max(0, Number(item.surahiTotalCost) || 0);
      });
    });

    expenses.forEach(e => {
      const dStr = new Date(e.date).toLocaleDateString('en-IN');
      if (!dailyAgg[dStr]) {
        dailyAgg[dStr] = { date: dStr, orders: 0, sales: 0, collected: 0, outstanding: 0, surahiCost: 0, expenses: 0 };
      }
      dailyAgg[dStr].expenses += Math.max(0, Number(e.amount) || 0);
    });

    // Sort dates logically
    const parseDateEnIN = (dStr) => {
      const parts = dStr.split('/');
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
      return new Date(dStr);
    };
    const sortedDates = Object.keys(dailyAgg).sort((a, b) => parseDateEnIN(a) - parseDateEnIN(b));

    let rowIdx9 = 2;
    sortedDates.forEach(dStr => {
      const val = dailyAgg[dStr];
      // Profit formula: Revenue - Surahi Cost - Expenses
      sh9.addRow([
        val.date,
        val.orders,
        val.sales,
        val.collected,
        val.outstanding,
        val.surahiCost,
        val.expenses,
        { formula: `C${rowIdx9}-F${rowIdx9}-G${rowIdx9}` }
      ]);

      const r = sh9.getRow(rowIdx9);
      r.eachCell(c => { c.border = dataStyle.border; c.font = dataStyle.font; });
      r.getCell(3).numFmt = '₹#,##0.00';
      r.getCell(4).numFmt = '₹#,##0.00';
      r.getCell(5).numFmt = '₹#,##0.00';
      r.getCell(6).numFmt = '₹#,##0.00';
      r.getCell(7).numFmt = '₹#,##0.00';
      r.getCell(8).numFmt = '₹#,##0.00';
      rowIdx9++;
    });

    if (rowIdx9 > 2) {
      sh9.addRow([
        'TOTALS',
        { formula: `SUM(B2:B${rowIdx9 - 1})` },
        { formula: `SUM(C2:C${rowIdx9 - 1})` },
        { formula: `SUM(D2:D${rowIdx9 - 1})` },
        { formula: `SUM(E2:E${rowIdx9 - 1})` },
        { formula: `SUM(F2:F${rowIdx9 - 1})` },
        { formula: `SUM(G2:G${rowIdx9 - 1})` },
        { formula: `SUM(H2:H${rowIdx9 - 1})` }
      ]);
      const lastR = sh9.getRow(rowIdx9);
      lastR.eachCell(c => { c.style = totalsStyle; });
      lastR.getCell(3).numFmt = '₹#,##0.00';
      lastR.getCell(4).numFmt = '₹#,##0.00';
      lastR.getCell(5).numFmt = '₹#,##0.00';
      lastR.getCell(6).numFmt = '₹#,##0.00';
      lastR.getCell(7).numFmt = '₹#,##0.00';
      lastR.getCell(8).numFmt = '₹#,##0.00';
    }

    // ==========================================
    // SHEET 10: Payment Summary
    // ==========================================
    const sh10 = workbook.addWorksheet('Payment Summary');
    sh10.views = [{ showGridLines: true, state: 'frozen', ySplit: 1 }];
    sh10.addRow(['Payment Method', 'Number of Transactions', 'Total Amount']);
    sh10.getRow(1).eachCell(c => { c.style = headerStyle; });

    const paymentAgg = {};
    allCombined.forEach(o => {
      if (o.status === 'Cancelled') return;
      const method = o._type === 'Website' ? (o.paymentMethod || 'Online') : (o.payment?.method || 'Cash');
      const cleanMethod = (method || '').trim() || 'Other';
      if (!paymentAgg[cleanMethod]) {
        paymentAgg[cleanMethod] = { method: cleanMethod, txCount: 0, totalAmount: 0 };
      }
      paymentAgg[cleanMethod].txCount++;

      const collected = o._type === 'Website' ? (o.paymentStatus === 'Paid' ? o.totalAmount : 0) : Math.max(0, o.payment?.amountPaid || 0);
      paymentAgg[cleanMethod].totalAmount += collected;
    });

    let rowIdx10 = 2;
    Object.values(paymentAgg).forEach(val => {
      sh10.addRow([val.method, val.txCount, val.totalAmount]);
      const r = sh10.getRow(rowIdx10);
      r.eachCell(c => { c.border = dataStyle.border; c.font = dataStyle.font; });
      r.getCell(3).numFmt = '₹#,##0.00';
      rowIdx10++;
    });

    if (rowIdx10 > 2) {
      sh10.addRow([
        'TOTALS',
        { formula: `SUM(B2:B${rowIdx10 - 1})` },
        { formula: `SUM(C2:C${rowIdx10 - 1})` }
      ]);
      const lastR = sh10.getRow(rowIdx10);
      lastR.eachCell(c => { c.style = totalsStyle; });
      lastR.getCell(3).numFmt = '₹#,##0.00';
    }

    // Set Column Width Auto-Fitting logic across worksheets
    workbook.eachSheet(sheet => {
      // Add filters to detailed data tables
      if (['Order Details', 'Surahi Dry Cleaning', 'Inventory Log', 'Expenses'].includes(sheet.name)) {
        const lastColLetter = String.fromCharCode(64 + sheet.columns.length);
        sheet.autoFilter = `A1:${lastColLetter}${sheet.rowCount}`;
      }

      // Column widths auto-fitting
      sheet.columns.forEach(column => {
        let maxLen = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const valStr = cell.value ? cell.value.toString() : '';
          // Ignore header cell to prevent excessively wide columns if cells contain formulas
          if (valStr.startsWith('=')) return;
          if (valStr.length > maxLen) {
            maxLen = valStr.length;
          }
        });
        column.width = Math.max(13, maxLen + 3);
      });
    });

    // Reset Executive Summary custom column widths to keep it tidy
    sh1.getColumn(1).width = 32;
    sh1.getColumn(2).width = 24;

    // Send Excel workbook stream
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=MrWashWala_Revenue_${new Date().toISOString().slice(0, 10)}.xlsx`
    );

    await workbook.xlsx.write(res);
    console.log('[DEBUG] Excel generation success.');
    console.log('[DEBUG] HTTP status: 200');
    res.end();
  } catch (error) {
    console.error('[DEBUG] Excel generation failure:', error);
    console.log('[DEBUG] HTTP status: 500');
    res.status(500).json({ message: 'Failed to generate Excel report', error: error.message });
  }
});

export default router;
