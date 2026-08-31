import express from 'express';
import Order from '../models/Order.js';
import WalkInOrder from '../models/WalkInOrder.js';
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

    // Fetch all services to match surahiUnitCost
    const dbServices = await Service.find({});
    const serviceMap = {};
    dbServices.forEach(s => {
      serviceMap[s.name.toLowerCase().trim()] = s.surahiUnitCost || 0;
    });

    const normalizedItems = items.map(item => {
      const nameLower = item.name.toLowerCase().trim();
      let surahiUnitCost = item.surahiUnitCost !== undefined ? Number(item.surahiUnitCost) : (serviceMap[nameLower] || 0);
      
      // Fallback for dry cleaning
      if (surahiUnitCost === 0 && (nameLower.includes('dry cleaning') || nameLower.includes('dry clean'))) {
        surahiUnitCost = Math.round(Number(item.price || 0) * 0.7);
      }
      
      return {
        name: item.name,
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
        unit: item.unit || 'Kg',
        surahiUnitCost,
        surahiTotalCost: surahiUnitCost * (Number(item.quantity) || 0)
      };
    });

    // Generate unique order ID
    const orderId = await generateUniqueOrderId();

    const order = new Order({
      orderId,
      customer,
      items: normalizedItems,
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
    
    // 1. Build filter for Website Orders
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

    // 2. Build filter for Walk-in Orders
    const walkInFilter = {};
    if (branch && branch !== 'all') {
      walkInFilter['branch.id'] = branch;
    }
    if (status) {
      if (status === 'In Process') {
        walkInFilter.status = { $in: ['Processing', 'Washing', 'Ironing', 'Ready'] };
      } else {
        walkInFilter.status = status;
      }
    }
    if (paymentStatus) {
      if (paymentStatus === 'Paid') {
        walkInFilter['payment.status'] = { $in: ['Paid', 'Partially Paid'] };
      } else if (paymentStatus === 'Pending') {
        walkInFilter['payment.status'] = 'Pending';
      } else {
        // Walk-in orders don't have Refunded status. If searching for Refunded, match nothing.
        walkInFilter['payment.status'] = '__non_existent_status__';
      }
    }
    if (paymentMethod) {
      if (paymentMethod === 'QR Payment') {
        walkInFilter['payment.method'] = 'UPI QR';
      } else if (paymentMethod === 'Online Payment') {
        walkInFilter['payment.method'] = { $in: ['Card', 'Online Payment'] };
      } else {
        walkInFilter['payment.method'] = paymentMethod;
      }
    }
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      walkInFilter.$or = [
        { orderId: regex },
        { 'customer.name': regex },
        { 'customer.phone': regex },
        { 'customer.address': regex },
        { 'branch.name': regex }
      ];
    }

    // 3. Fetch from both collections in parallel
    const [websiteOrders, walkInOrders] = await Promise.all([
      Order.find(filter).lean(),
      WalkInOrder.find(walkInFilter).lean()
    ]);

    // 4. Map Website Orders
    const mappedWebsite = websiteOrders.map(order => ({
      ...order,
      orderSource: 'Website Order'
    }));

    // 5. Map Walk-in Orders to match Website Order structure
    const mappedWalkIn = walkInOrders.map(walkIn => {
      // Map walk-in statuses to match frontend options
      let mappedStatus = walkIn.status;
      if (['Processing', 'Washing', 'Ironing', 'Ready'].includes(walkIn.status)) {
        mappedStatus = 'In Process';
      }

      // Map services to items
      const mappedItems = (walkIn.services || []).map(service => ({
        name: service.name,
        quantity: service.quantity,
        price: service.price,
        unit: service.unit || 'Kg'
      }));

      return {
        _id: walkIn._id,
        orderId: walkIn.orderId,
        customer: {
          name: walkIn.customer.name,
          phone: walkIn.customer.phone,
          address: walkIn.customer.address,
          instructions: walkIn.delivery?.specialInstructions || walkIn.customer.notes || ''
        },
        selectedBranch: {
          id: walkIn.branch.id,
          name: walkIn.branch.name
        },
        totalAmount: walkIn.grandTotal,
        status: mappedStatus,
        paymentStatus: walkIn.payment.status,
        paymentMethod: walkIn.payment.method === 'UPI QR' ? 'QR Payment' : walkIn.payment.method,
        pickupDate: walkIn.delivery?.pickupDate || '',
        deliveryDate: walkIn.delivery?.expectedDeliveryDate || walkIn.delivery?.actualDeliveryDate || '',
        orderSummary: walkIn.orderSummary,
        items: mappedItems,
        orderSource: 'Walk-in Order',
        createdAt: walkIn.createdAt,
        updatedAt: walkIn.updatedAt
      };
    });

    // 6. Combine and sort
    const allOrders = [...mappedWebsite, ...mappedWalkIn].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    res.json(allOrders);
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
    if (order) {
      return res.json(order);
    }
    const walkInOrder = await WalkInOrder.findOne({ orderId: req.params.orderId });
    if (walkInOrder) {
      return res.json(walkInOrder);
    }
    return res.status(404).json({ message: 'Order not found' });
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

    let order = await Order.findOne({ orderId: req.params.orderId });
    if (order) {
      order.status = status;
      const updatedOrder = await order.save();
      return res.json(updatedOrder);
    }

    let walkInOrder = await WalkInOrder.findOne({ orderId: req.params.orderId });
    if (walkInOrder) {
      let mappedStatus = status;
      if (status === 'In Process') {
        const walkInStatuses = ['Processing', 'Washing', 'Ironing', 'Ready'];
        if (!walkInStatuses.includes(walkInOrder.status)) {
          mappedStatus = 'Processing';
        } else {
          mappedStatus = walkInOrder.status;
        }
      }
      walkInOrder.status = mappedStatus;
      const updatedWalkIn = await walkInOrder.save();

      const mappedOutput = {
        ...updatedWalkIn.toObject(),
        selectedBranch: updatedWalkIn.branch,
        totalAmount: updatedWalkIn.grandTotal,
        paymentStatus: updatedWalkIn.payment.status,
        paymentMethod: updatedWalkIn.payment.method === 'UPI QR' ? 'QR Payment' : updatedWalkIn.payment.method,
        pickupDate: updatedWalkIn.delivery?.pickupDate || '',
        deliveryDate: updatedWalkIn.delivery?.expectedDeliveryDate || updatedWalkIn.delivery?.actualDeliveryDate || '',
        orderSource: 'Walk-in Order'
      };
      
      if (['Processing', 'Washing', 'Ironing', 'Ready'].includes(mappedOutput.status)) {
        mappedOutput.status = 'In Process';
      }

      return res.json(mappedOutput);
    }

    return res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

// @desc    Update order payment status
// @route   PATCH /api/orders/:orderId/payment-status
// @access  Admin
router.patch('/:orderId/payment-status', adminAuth, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    const validStatuses = ['Pending', 'Paid', 'Refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status type' });
    }

    let order = await Order.findOne({ orderId: req.params.orderId });
    if (order) {
      order.paymentStatus = paymentStatus;
      const updatedOrder = await order.save();
      
      const mappedOutput = {
        ...updatedOrder.toObject(),
        orderSource: 'Website Order'
      };
      return res.json(mappedOutput);
    }

    let walkInOrder = await WalkInOrder.findOne({ orderId: req.params.orderId });
    if (walkInOrder) {
      let walkInPaymentStatus = paymentStatus;
      if (paymentStatus === 'Refunded') {
        walkInPaymentStatus = 'Pending';
      }
      walkInOrder.payment.status = walkInPaymentStatus;
      const updatedWalkIn = await walkInOrder.save();

      const mappedOutput = {
        ...updatedWalkIn.toObject(),
        selectedBranch: updatedWalkIn.branch,
        totalAmount: updatedWalkIn.grandTotal,
        paymentStatus: updatedWalkIn.payment.status,
        paymentMethod: updatedWalkIn.payment.method === 'UPI QR' ? 'QR Payment' : updatedWalkIn.payment.method,
        pickupDate: updatedWalkIn.delivery?.pickupDate || '',
        deliveryDate: updatedWalkIn.delivery?.expectedDeliveryDate || updatedWalkIn.delivery?.actualDeliveryDate || '',
        orderSource: 'Walk-in Order'
      };
      
      if (['Processing', 'Washing', 'Ironing', 'Ready'].includes(mappedOutput.status)) {
        mappedOutput.status = 'In Process';
      }

      return res.json(mappedOutput);
    }

    return res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order payment status', error: error.message });
  }
});

export default router;
