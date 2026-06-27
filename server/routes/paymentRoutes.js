import express from 'express';
import Order from '../models/Order.js';
import PaymentAttempt from '../models/PaymentAttempt.js';
import PaymentWebhookEvent from '../models/PaymentWebhookEvent.js';
import { getPaymentProvider } from '../services/payments/providerAdapter.js';

const router = express.Router();
const paymentProvider = getPaymentProvider();

const toPaise = (amount) => {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.round(numeric * 100);
};

const generateMerchantOrderId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MRW-PAY-${ts}-${rand}`;
};

const generateUniqueOrderId = async () => {
  let isUnique = false;
  let orderId = '';

  while (!isUnique) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    orderId = `MRW-${randomDigits}`;

    const existingOrder = await Order.findOne({ orderId });
    if (!existingOrder) {
      isUnique = true;
    }
  }

  return orderId;
};

// Initialize checkout architecture flow. Provider integration can be added later.
router.post('/checkout/initiate', async (req, res) => {
  try {
    const {
      idempotencyKey,
      customer,
      items,
      totalAmount,
      currency = 'INR',
      metadata = {},
    } = req.body;

    if (!idempotencyKey || !idempotencyKey.trim()) {
      return res.status(400).json({ message: 'idempotencyKey is required' });
    }

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ message: 'Customer details are required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one cart item is required' });
    }

    const amountPaise = toPaise(totalAmount);
    if (!amountPaise) {
      return res.status(400).json({ message: 'Valid totalAmount is required' });
    }

    const existingAttempt = await PaymentAttempt.findOne({ idempotencyKey }).populate('order');
    if (existingAttempt) {
      return res.status(200).json({
        message: 'Idempotent replay: existing checkout returned',
        merchantOrderId: existingAttempt.merchantOrderId,
        orderId: existingAttempt.order?.orderId || '',
        paymentStatus: existingAttempt.status,
        provider: existingAttempt.provider,
      });
    }

    const orderId = await generateUniqueOrderId();
    const order = await Order.create({
      orderId,
      customer,
      items,
      totalAmount,
      status: 'Pending',
    });

    const merchantOrderId = generateMerchantOrderId();

    const attempt = await PaymentAttempt.create({
      merchantOrderId,
      idempotencyKey,
      order: order._id,
      amountPaise,
      currency,
      status: 'INITIATED',
      cartSnapshot: items,
      customerSnapshot: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        instructions: customer.instructions || '',
      },
      metadata,
      provider: {
        name: paymentProvider.name,
      },
    });

    const session = await paymentProvider.createCheckoutSession({
      merchantOrderId,
      amountPaise,
      currency,
      customer,
      items,
      metadata,
    });

    if (session.providerConfigured && session.gatewayOrderId) {
      attempt.status = 'PENDING';
      attempt.provider.gatewayOrderId = session.gatewayOrderId;
      attempt.provider.publicKey = session.publicKey || '';
      await attempt.save();
    }

    return res.status(201).json({
      message: 'Checkout initialized',
      architectureReady: true,
      providerConfigured: session.providerConfigured,
      merchantOrderId,
      orderId,
      amountPaise,
      currency,
      provider: {
        name: paymentProvider.name,
        gatewayOrderId: session.gatewayOrderId || '',
        checkoutUrl: session.checkoutUrl || '',
        publicKey: session.publicKey || '',
        notes: session.notes || {},
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to initialize checkout', error: error.message });
  }
});

// Verifies payment callback from frontend. Provider verification can be plugged in later.
router.post('/verify', async (req, res) => {
  try {
    const { merchantOrderId, paymentResponse = {} } = req.body;

    if (!merchantOrderId) {
      return res.status(400).json({ message: 'merchantOrderId is required' });
    }

    const attempt = await PaymentAttempt.findOne({ merchantOrderId }).populate('order');
    if (!attempt) {
      return res.status(404).json({ message: 'Payment attempt not found' });
    }

    const verification = await paymentProvider.verifyClientCallback({
      merchantOrderId,
      paymentResponse,
    });

    attempt.provider.gatewayPaymentId = paymentResponse.gatewayPaymentId || attempt.provider.gatewayPaymentId;
    attempt.provider.gatewaySignature = paymentResponse.signature || attempt.provider.gatewaySignature;

    if (verification.verified) {
      attempt.status = 'CAPTURED';
      attempt.verification.verifiedAt = new Date();
      attempt.verification.verifiedBy = 'CLIENT_CALLBACK';
      attempt.verification.reason = '';
      await attempt.save();
      return res.status(200).json({ verified: true, paymentStatus: attempt.status });
    }

    attempt.verification.reason = verification.reason || 'Verification pending provider setup';
    await attempt.save();

    return res.status(202).json({
      verified: false,
      paymentStatus: attempt.status,
      reason: attempt.verification.reason,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
});

// Generic webhook receiver with idempotent event storage.
router.post('/webhook', async (req, res) => {
  try {
    const { provider = paymentProvider.name, eventId, eventType, payload = {} } = req.body;

    if (!eventId || !eventType) {
      return res.status(400).json({ message: 'eventId and eventType are required' });
    }

    const existingEvent = await PaymentWebhookEvent.findOne({ provider, eventId });
    if (existingEvent) {
      return res.status(200).json({ success: true, duplicate: true, message: 'Event already processed' });
    }

    const parsed = await paymentProvider.parseWebhook({ provider, eventId, eventType, payload });

    const webhookEvent = await PaymentWebhookEvent.create({
      provider,
      eventId,
      eventType,
      merchantOrderId: parsed.merchantOrderId || '',
      payload: parsed.payload || payload,
      processed: false,
    });

    if (parsed.merchantOrderId) {
      const attempt = await PaymentAttempt.findOne({ merchantOrderId: parsed.merchantOrderId }).populate('order');
      if (attempt) {
        const mappedStatus =
          parsed.paymentStatus === 'CAPTURED'
            ? 'CAPTURED'
            : parsed.paymentStatus === 'FAILED'
            ? 'FAILED'
            : parsed.paymentStatus === 'REFUNDED'
            ? 'REFUNDED'
            : 'PENDING';

        attempt.status = mappedStatus;
        if (mappedStatus === 'CAPTURED') {
          attempt.verification.verifiedAt = new Date();
          attempt.verification.verifiedBy = 'WEBHOOK';
          attempt.verification.reason = '';
        }

        await attempt.save();
      }
    }

    webhookEvent.processed = true;
    webhookEvent.processError = '';
    await webhookEvent.save();

    return res.status(200).json({ success: true, duplicate: false });
  } catch (error) {
    return res.status(500).json({ message: 'Webhook processing failed', error: error.message });
  }
});

router.get('/:merchantOrderId/status', async (req, res) => {
  try {
    const attempt = await PaymentAttempt.findOne({ merchantOrderId: req.params.merchantOrderId }).populate('order');

    if (!attempt) {
      return res.status(404).json({ message: 'Payment attempt not found' });
    }

    return res.status(200).json({
      merchantOrderId: attempt.merchantOrderId,
      orderId: attempt.order?.orderId || '',
      orderStatus: attempt.order?.status || '',
      paymentStatus: attempt.status,
      provider: attempt.provider,
      verification: attempt.verification,
      updatedAt: attempt.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch payment status', error: error.message });
  }
});

export default router;
