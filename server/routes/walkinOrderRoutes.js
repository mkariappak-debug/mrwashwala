import express from 'express';
import WalkInOrder from '../models/WalkInOrder.js';
import { adminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateWalkInOrderId = async () => {
  let isUnique = false;
  let orderId = '';

  while (!isUnique) {
    const nextNumber = await WalkInOrder.countDocuments() + 1;
    orderId = `MW-WI-${String(nextNumber).padStart(6, '0')}`;
    const exists = await WalkInOrder.findOne({ orderId });
    if (!exists) {
      isUnique = true;
    }
  }

  return orderId;
};

const buildSearchFilter = (query) => {
  const filter = {};

  if (query.branch && query.branch !== 'all') {
    filter['branch.id'] = query.branch;
  }

  if (query.status && query.status !== 'All') {
    filter.status = query.status;
  }

  if (query.paymentStatus && query.paymentStatus !== 'All') {
    filter['payment.status'] = query.paymentStatus;
  }

  if (query.paymentMethod && query.paymentMethod !== 'All') {
    filter['payment.method'] = query.paymentMethod;
  }

  if (query.search) {
    const regex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { orderId: regex },
      { 'customer.name': regex },
      { 'customer.phone': regex },
      { 'customer.altPhone': regex },
      { 'customer.address': regex },
      { 'branch.name': regex },
      { orderSummary: regex }
    ];
  }

  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) {
      const toDate = new Date(query.to);
      toDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = toDate;
    }
  }

  return filter;
};

router.use(adminAuth);

router.post('/', async (req, res) => {
  try {
    const {
      customer,
      branch,
      services,
      discount = 0,
      gst = 0,
      payment,
      status = 'Pending',
      delivery,
      orderSummary = ''
    } = req.body;

    if (!customer || !customer.phone) {
      return res.status(400).json({ message: 'Customer mobile number is required' });
    }

    if (!branch || !branch.id || !branch.name) {
      return res.status(400).json({ message: 'Branch selection is required' });
    }

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: 'At least one service is required' });
    }

    const normalizedServices = services.map((service) => {
      const quantity = Number(service.quantity) || 0;
      const price = Number(service.price) || 0;
      const subtotal = Number(service.subtotal) || quantity * price;

      return {
        name: service.name || 'Service',
        quantity,
        unit: service.unit || 'Kg',
        price,
        subtotal
      };
    });

    const subtotal = normalizedServices.reduce((sum, item) => sum + item.subtotal, 0);
    const grandTotal = Math.max(0, subtotal - Number(discount) + Number(gst));
    const amountPaid = Number(payment?.amountPaid) || 0;
    const balanceDue = Math.max(0, grandTotal - amountPaid);

    const orderId = await generateWalkInOrderId();

    const walkInOrder = new WalkInOrder({
      orderId,
      customer,
      branch,
      services: normalizedServices,
      subtotal,
      discount: Number(discount),
      gst: Number(gst),
      grandTotal,
      payment: {
        method: payment?.method || 'Cash',
        status: payment?.status || (amountPaid >= grandTotal && grandTotal > 0 ? 'Paid' : 'Pending'),
        amountPaid,
        balanceDue,
        transactionId: payment?.transactionId || '',
        paymentDate: payment?.paymentDate || ''
      },
      status,
      delivery: delivery || {},
      orderSummary: orderSummary || normalizedServices.map((item) => `${item.name} (${item.quantity}${item.unit ? ' ' + item.unit : ''})`).join(', ')
    });

    const savedOrder = await walkInOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Walk-in order creation failed:', error.message);
    res.status(500).json({ message: 'Failed to create walk-in order', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = buildSearchFilter(req.query);
    const sortDirection = req.query.sort === 'oldest' ? 1 : -1;
    const orders = await WalkInOrder.find(filter).sort({ createdAt: sortDirection }).lean();
    res.json(orders);
  } catch (error) {
    console.error('Walk-in orders fetch failed:', error.message);
    res.status(500).json({ message: 'Failed to fetch walk-in orders', error: error.message });
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const order = await WalkInOrder.findOne({ orderId: req.params.orderId }).lean();
    if (!order) {
      return res.status(404).json({ message: 'Walk-in order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Walk-in order fetch failed:', error.message);
    res.status(500).json({ message: 'Failed to fetch walk-in order', error: error.message });
  }
});

router.patch('/:orderId', async (req, res) => {
  try {
    const updates = req.body;
    if (updates.services) {
      updates.services = updates.services.map((service) => ({
        ...service,
        quantity: Number(service.quantity) || 0,
        price: Number(service.price) || 0,
        subtotal: Number(service.subtotal) || Number(service.quantity) * Number(service.price)
      }));
      updates.subtotal = updates.services.reduce((sum, item) => sum + item.subtotal, 0);
    }

    if (updates.discount !== undefined || updates.gst !== undefined || updates.services) {
      const currentOrder = await WalkInOrder.findOne({ orderId: req.params.orderId }).lean();
      const subtotal = updates.subtotal !== undefined ? updates.subtotal : currentOrder.subtotal;
      const discount = updates.discount !== undefined ? Number(updates.discount) : currentOrder.discount;
      const gst = updates.gst !== undefined ? Number(updates.gst) : currentOrder.gst;
      updates.grandTotal = Math.max(0, subtotal - discount + gst);
      const amountPaid = updates.payment?.amountPaid !== undefined ? Number(updates.payment.amountPaid) : currentOrder.payment.amountPaid;
      updates.payment = {
        ...currentOrder.payment,
        ...(updates.payment || {}),
        amountPaid,
        balanceDue: Math.max(0, (updates.grandTotal || currentOrder.grandTotal) - amountPaid)
      };
    }

    const updatedOrder = await WalkInOrder.findOneAndUpdate({ orderId: req.params.orderId }, updates, {
      new: true,
      runValidators: true
    });

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Walk-in order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Walk-in order update failed:', error.message);
    res.status(500).json({ message: 'Failed to update walk-in order', error: error.message });
  }
});

router.delete('/:orderId', async (req, res) => {
  try {
    const deletedOrder = await WalkInOrder.findOneAndDelete({ orderId: req.params.orderId });
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Walk-in order not found' });
    }
    res.json({ message: 'Walk-in order deleted successfully' });
  } catch (error) {
    console.error('Walk-in order delete failed:', error.message);
    res.status(500).json({ message: 'Failed to delete walk-in order', error: error.message });
  }
});

router.get('/lookup/customer', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ message: 'Customer phone is required for lookup' });
    }

    const orders = await WalkInOrder.find({
      $or: [{ 'customer.phone': phone }, { 'customer.altPhone': phone }]
    }).sort({ createdAt: -1 }).lean();

    if (!orders.length) {
      return res.json({ found: false, data: null });
    }

    const latest = orders[0];
    const lifetimeSpending = orders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
    const serviceFrequency = {};
    orders.forEach((order) => {
      (order.services || []).forEach((service) => {
        serviceFrequency[service.name] = (serviceFrequency[service.name] || 0) + service.quantity;
      });
    });

    const frequentServices = Object.entries(serviceFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    res.json({
      found: true,
      data: {
        latestCustomer: latest.customer,
        previousOrders: orders.slice(0, 5).map((order) => ({
          orderId: order.orderId,
          createdAt: order.createdAt,
          grandTotal: order.grandTotal,
          status: order.status
        })),
        lifetimeSpending,
        frequentServices
      }
    });
  } catch (error) {
    console.error('Walk-in customer lookup failed:', error.message);
    res.status(500).json({ message: 'Failed to lookup customer', error: error.message });
  }
});

export default router;
