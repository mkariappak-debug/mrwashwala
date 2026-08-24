import mongoose from 'mongoose';

const WalkInOrderServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unit: { type: String, required: true, trim: true, default: 'Kg' },
    price: { type: Number, required: true, min: 0, default: 0 },
    subtotal: { type: Number, required: true, min: 0, default: 0 }
  },
  { _id: false }
);

const WalkInOrderCustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    altPhone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    address: { type: String, required: true, trim: true },
    area: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
    mapsLink: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const WalkInOrderPaymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['Cash', 'UPI QR', 'Card', 'Online Payment', 'WhatsApp Checkout', 'Other'],
      default: 'Cash'
    },
    status: {
      type: String,
      enum: ['Paid', 'Partially Paid', 'Pending'],
      default: 'Pending'
    },
    amountPaid: { type: Number, min: 0, default: 0 },
    balanceDue: { type: Number, min: 0, default: 0 },
    transactionId: { type: String, trim: true, default: '' },
    paymentDate: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const WalkInOrderDeliverySchema = new mongoose.Schema(
  {
    pickupDate: { type: String, trim: true, default: '' },
    expectedDeliveryDate: { type: String, trim: true, default: '' },
    actualDeliveryDate: { type: String, trim: true, default: '' },
    deliveryType: {
      type: String,
      enum: ['Customer Pickup', 'Home Delivery'],
      default: 'Customer Pickup'
    },
    specialInstructions: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const WalkInOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true },
    customer: { type: WalkInOrderCustomerSchema, required: true },
    branch: {
      id: { type: String, required: true, trim: true },
      name: { type: String, required: true, trim: true }
    },
    services: { type: [WalkInOrderServiceSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    gst: { type: Number, min: 0, default: 0 },
    grandTotal: { type: Number, required: true, min: 0, default: 0 },
    payment: { type: WalkInOrderPaymentSchema, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Picked Up', 'Processing', 'Washing', 'Ironing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },
    delivery: { type: WalkInOrderDeliverySchema, default: () => ({}) },
    orderSummary: { type: String, trim: true, default: '' }
  },
  {
    timestamps: true
  }
);

const WalkInOrder = mongoose.model('WalkInOrder', WalkInOrderSchema);
export default WalkInOrder;
