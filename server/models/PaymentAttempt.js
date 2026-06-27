import mongoose from 'mongoose';

const paymentAttemptSchema = new mongoose.Schema(
  {
    merchantOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: [
        'INITIATED',
        'PENDING',
        'AUTHORIZED',
        'CAPTURED',
        'FAILED',
        'CANCELLED',
        'REFUNDED',
        'PARTIALLY_REFUNDED',
      ],
      default: 'INITIATED',
    },
    provider: {
      name: {
        type: String,
        default: 'PENDING',
      },
      gatewayOrderId: {
        type: String,
        default: '',
      },
      gatewayPaymentId: {
        type: String,
        default: '',
      },
      gatewaySignature: {
        type: String,
        default: '',
      },
      publicKey: {
        type: String,
        default: '',
      },
    },
    cartSnapshot: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        unit: { type: String, required: true },
      },
    ],
    customerSnapshot: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      instructions: { type: String, default: '', trim: true },
    },
    verification: {
      verifiedAt: Date,
      verifiedBy: {
        type: String,
        enum: ['CLIENT_CALLBACK', 'WEBHOOK', 'MANUAL', ''],
        default: '',
      },
      reason: {
        type: String,
        default: '',
      },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const PaymentAttempt = mongoose.model('PaymentAttempt', paymentAttemptSchema);

export default PaymentAttempt;
