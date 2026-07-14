import mongoose from 'mongoose';

const paymentWebhookEventSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    eventId: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
    },
    merchantOrderId: {
      type: String,
      default: '',
      trim: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
    processed: {
      type: Boolean,
      default: false,
    },
    processError: {
      type: String,
      default: '',
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

paymentWebhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

const PaymentWebhookEvent = mongoose.model('PaymentWebhookEvent', paymentWebhookEventSchema);

export default PaymentWebhookEvent;
