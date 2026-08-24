import express from 'express';
import Order from '../models/Order.js';
import OrderProcessing from '../models/OrderProcessing.js';
import { determineWorkflow } from '../config/workflows.js';
import { adminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to generate a unique random 6-digit order ID: MRW-XXXXXX
const generateUniqueOrderId = async () => {
  let isUnique = false;
  let orderId = '';
  
  while (!isUnique) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    orderId = `MRW-${randomDigits}`;
    
    // Check if exists
    const existingOrder = await Order.findOne({ orderId });
    if (!existingOrder) {
      isUnique = true;
    }
  }
  return orderId;
};

// @desc    Create a new order booking
// @route   POST /api/orders
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      customer,
      items,
      totalAmount,
      latitude = null,
      longitude = null,
      pickupDate = '',
      pickupTime = '',
      deliveryDate = '',
      paymentMethod = '',
      paymentStatus = 'Pending',
      orderSummary = '',
      recommendedBranch = null,
      selectedBranch = null
    } = req.body;

    if (!customer || !customer.name?.trim() || !customer.phone?.trim() || !customer.address?.trim()) {
      return res.status(400).json({ message: 'Customer details (name, phone, address) are required' });
    }

    const normalizedPaymentStatus = (() => {
      if (paymentStatus && paymentStatus !== 'Pending') return paymentStatus;
      if (['QR Payment', 'Online Payment'].includes(paymentMethod)) return 'Paid';
      if (paymentMethod === 'WhatsApp Checkout') return 'Pending';
      return 'Pending';
    })();

    const normalizedOrderSummary = orderSummary && orderSummary.trim()
      ? orderSummary.trim()
      : items?.map((item) => {
          const unitText = item.unit ? ` ${item.unit}` : '';
          return `${item.name} (${item.quantity}${unitText})`;
        }).join(', ');

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required' });
    }

    // Generate unique order ID
    const orderId = await generateUniqueOrderId();

    const order = new Order({
      orderId,
      customer,
      items,
      totalAmount,
      latitude,
      longitude,
      pickupDate,
      pickupTime,
      deliveryDate,
      paymentMethod,
      paymentStatus: normalizedPaymentStatus,
      orderSummary: normalizedOrderSummary,
      recommendedBranch,
      selectedBranch
    });

    const savedOrder = await order.save();

    // Create OrderProcessing tickets for each item
    const processingTickets = items.map(item => {
      const workflow = determineWorkflow(item.name);
      return {
        orderId: savedOrder.orderId,
        orderType: 'Order',
        customerName: customer.name,
        serviceName: item.name,
        workflowKey: workflow.key,
        status: 'New'
      };
    });
    
    await OrderProcessing.insertMany(processingTickets);

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// @desc    Get all orders (Admin use)
// @route   GET /api/orders
// @access  Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const { branch, status, paymentStatus, paymentMethod, search } = req.query;
    const filter = {};

    if (branch && branch !== 'all') {
      filter['selectedBranch.id'] = branch;
    }

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { orderId: regex },
        { 'customer.name': regex },
        { 'customer.phone': regex },
        { 'customer.address': regex },
        { 'selectedBranch.name': regex }
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// @desc    Get a single order by custom orderId (e.g. MRW-123456)
// @route   GET /api/orders/:orderId
// @access  Public
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
});

// @desc    Update order status
// @route   PATCH /api/orders/:orderId/status
// @access  Admin
router.patch('/:orderId/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['Pending', 'Picked Up', 'In Process', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status type' });
    }

    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

export default router;
