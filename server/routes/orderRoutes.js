import express from 'express';
import Order from '../models/Order.js';

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
      paymentMethod = '',
      recommendedBranch = null,
      selectedBranch = null
    } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ message: 'Customer details (name, phone, address) are required' });
    }

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
      paymentMethod,
      recommendedBranch,
      selectedBranch
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// @desc    Get all orders (Admin use)
// @route   GET /api/orders
// @access  Public (Admin in future)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
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
// @access  Public (Admin in future)
router.patch('/:orderId/status', async (req, res) => {
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
