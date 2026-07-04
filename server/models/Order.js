import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true
    },
    customer: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      },
      address: {
        type: String,
        required: true,
        trim: true
      },
      instructions: {
        type: String,
        trim: true,
        default: ''
      }
    },
    items: [
      {
        name: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true
        },
        unit: {
          type: String,
          required: true
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    pickupDate: {
      type: String,
      trim: true,
      default: ''
    },
    pickupTime: {
      type: String,
      trim: true,
      default: ''
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: ''
    },
    // The branch our system automatically recommended based on distance.
    recommendedBranch: {
      id: { type: String, default: null },
      name: { type: String, default: null }
    },
    // The branch the customer actually confirmed (may differ from recommendedBranch
    // if they manually overrode the suggestion).
    selectedBranch: {
      id: { type: String, default: null },
      name: { type: String, default: null }
    },
    status: {
      type: String,
      enum: ['Pending', 'Picked Up', 'In Process', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook is one option, but we can also generate orderId when saving
const Order = mongoose.model('Order', orderSchema);

export default Order;
