import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true
    },
    itemName: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['Stock In', 'Stock Out', 'Adjustment'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true,
      trim: true
    },
    unitCost: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    },
    supplier: {
      type: String,
      default: '',
      trim: true
    },
    reason: {
      type: String,
      default: '',
      trim: true
    },
    outlet: {
      id: { type: String, default: '' },
      name: { type: String, default: '' }
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
export default InventoryTransaction;
