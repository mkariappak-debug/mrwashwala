import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    unit: {
      type: String,
      required: true,
      trim: true
    },
    currentStock: {
      type: Number,
      default: 0
    },
    availableStock: {
      type: Number,
      default: 0
    },
    consumedStock: {
      type: Number,
      default: 0
    },
    minStock: {
      type: Number,
      default: 0
    },
    supplier: {
      type: String,
      default: '',
      trim: true
    },
    unitCost: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
export default InventoryItem;
