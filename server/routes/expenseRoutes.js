import express from 'express';
import Expense from '../models/Expense.js';
import { adminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(adminAuth);

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Admin
router.get('/', async (req, res) => {
  try {
    const { branch, category } = req.query;
    const filter = {};

    if (branch && branch !== 'all') {
      filter['outlet.id'] = branch;
    }
    if (category && category !== 'All') {
      filter.category = category;
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expenses', error: error.message });
  }
});

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Admin
router.post('/', async (req, res) => {
  try {
    const { date, category, description, amount, outlet, paymentMethod, notes } = req.body;

    if (!category || !description || amount === undefined) {
      return res.status(400).json({ message: 'Category, description, and amount are required' });
    }

    const expense = new Expense({
      date: date ? new Date(date) : new Date(),
      category,
      description: description.trim(),
      amount: Number(amount) || 0,
      outlet: outlet || { id: '', name: 'All Outlets' },
      paymentMethod: paymentMethod || 'Cash',
      notes: notes?.trim() || ''
    });

    const saved = await expense.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(400).json({ message: 'Failed to record expense', error: error.message });
  }
});

// @desc    Update an expense record
// @route   PUT /api/expenses/:id
// @access  Admin
router.put('/:id', async (req, res) => {
  try {
    const { date, category, description, amount, outlet, paymentMethod, notes } = req.body;
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense record not found' });
    }

    if (date !== undefined) expense.date = new Date(date);
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description.trim();
    if (amount !== undefined) expense.amount = Number(amount) || 0;
    if (outlet !== undefined) expense.outlet = outlet;
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
    if (notes !== undefined) expense.notes = notes.trim();

    const updated = await expense.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update expense', error: error.message });
  }
});

// @desc    Delete an expense record
// @route   DELETE /api/expenses/:id
// @access  Admin
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense record not found' });
    }
    res.json({ success: true, message: 'Expense record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete expense record', error: error.message });
  }
});

export default router;
