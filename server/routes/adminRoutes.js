import express from 'express';
import Order from '../models/Order.js';
import WalkInOrder from '../models/WalkInOrder.js';
import Service from '../models/Service.js';
import Review from '../models/Review.js';
import FranchiseLead from '../models/FranchiseLead.js';
import { adminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(adminAuth);

router.get('/dashboard', async (req, res) => {
  try {
    const branch = req.query.branch;
    const baseFilter = branch && branch !== 'all' ? { 'selectedBranch.id': branch } : {};
    const totalOrders = await Order.countDocuments(baseFilter);
    const pendingOrders = await Order.countDocuments({ ...baseFilter, status: 'Pending' });
    const inProgressOrders = await Order.countDocuments({
      ...baseFilter,
      status: { $in: ['Picked Up', 'In Process', 'Out for Delivery'] }
    });
    const deliveredOrders = await Order.countDocuments({ ...baseFilter, status: 'Delivered' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const todaysOrders = await Order.countDocuments({
      ...baseFilter,
      createdAt: { $gte: today, $lt: tomorrow }
    });
    const monthlyStart = new Date();
    monthlyStart.setDate(1);
    monthlyStart.setHours(0, 0, 0, 0);
    const websiteOrderRevenueResult = await Order.aggregate([
      { $match: { ...baseFilter, createdAt: { $gte: monthlyStart }, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const websiteOrderRevenue = websiteOrderRevenueResult[0]?.total || 0;
    const totalCustomers = await Order.distinct('customer.phone', baseFilter).then((phones) => phones.length);
    const totalServices = await Service.countDocuments();
    const totalReviews = await Review.countDocuments();
    const avgRatingResult = await Review.aggregate([
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);
    const averageRating = avgRatingResult[0]?.average || 0;
    const franchiseLeads = await FranchiseLead.countDocuments();
    const revenueGrowth = 12; // placeholder until more historical data is available

    const walkInFilter = branch && branch !== 'all' ? { 'branch.id': branch } : {};
    const totalWalkInOrders = await WalkInOrder.countDocuments(walkInFilter);
    const pendingWalkInOrders = await WalkInOrder.countDocuments({
      ...walkInFilter,
      status: 'Pending'
    });
    const deliveredWalkInOrders = await WalkInOrder.countDocuments({
      ...walkInFilter,
      status: 'Delivered'
    });
    const walkInMonthlyRevenueResult = await WalkInOrder.aggregate([
      { $match: { ...walkInFilter, createdAt: { $gte: monthlyStart }, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);
    const walkInMonthlyRevenue = walkInMonthlyRevenueResult[0]?.total || 0;
    const monthlyRevenue = websiteOrderRevenue + walkInMonthlyRevenue;

    const ordersByMonth = await Order.aggregate([
      { $match: { ...baseFilter, createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const popularServices = await Order.aggregate([
      { $match: baseFilter },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', count: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const recentOrders = await Order.find(baseFilter).sort({ createdAt: -1 }).limit(5).lean();
    const latestReviews = await Review.find({}).sort({ reviewDate: -1 }).limit(5).lean();
    const recentLeads = await FranchiseLead.find({}).sort({ createdAt: -1 }).limit(5).lean();

    res.json({
      totalOrders,
      pendingOrders,
      inProgressOrders,
      deliveredOrders,
      todaysOrders,
      monthlyRevenue,
      websiteOrderRevenue,
      totalCustomers,
      totalServices,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      franchiseLeads,
      revenueGrowth,
      totalWalkInOrders,
      pendingWalkInOrders,
      deliveredWalkInOrders,
      walkInMonthlyRevenue,
      ordersByMonth,
      popularServices,
      recentOrders,
      latestReviews,
      recentLeads
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error.message);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const branch = req.query.branch;
    const matchStage = branch && branch !== 'all' ? { 'selectedBranch.id': branch } : {};
    const customers = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$customer.phone',
          name: { $first: '$customer.name' },
          phone: { $first: '$customer.phone' },
          address: { $first: '$customer.address' },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrder: { $max: '$createdAt' }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Admin customers error:', error.message);
    res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
  }
});

router.get('/reviews', async (req, res) => {
  try {
    const { approved, hidden, rating, branch } = req.query;
    const filter = {};
    if (approved !== undefined) filter.approved = approved === 'true';
    if (hidden !== undefined) {
      filter.hidden = hidden === 'true';
    } else {
      filter.hidden = false;
    }
    if (rating !== undefined) filter.rating = Number(rating);
    if (branch && branch !== 'all') filter['branch.id'] = branch;

    const reviews = await Review.find(filter).sort({ reviewDate: -1 }).lean();
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error('Admin review list error:', error.message);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
});

export default router;
