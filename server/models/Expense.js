import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['Inventory/Supplies', 'Transportation', 'Maintenance', 'Utilities', 'Outsourcing', 'Other'],
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    outlet: {
      id: { type: String, default: '' },
      name: { type: String, default: '' }
    },
    paymentMethod: {
      type: String,
      default: 'Cash',
      trim: true
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

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
