import express from 'express';
import InventoryItem from '../models/InventoryItem.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import Expense from '../models/Expense.js';
import { adminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(adminAuth);

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Admin
router.get('/', async (req, res) => {
  try {
    const items = await InventoryItem.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inventory items', error: error.message });
  }
});

// @desc    Create a new inventory item (Opening Stock)
// @route   POST /api/inventory
// @access  Admin
router.post('/', async (req, res) => {
  try {
    const { name, unit, minStock, availableStock = 0, consumedStock = 0, supplier = '', unitCost = 0, outlet } = req.body;

    const itemExists = await InventoryItem.findOne({ name: name.trim() });
    if (itemExists) {
      return res.status(400).json({ message: 'An inventory item with this name already exists' });
    }

    const item = new InventoryItem({
      name: name.trim(),
      unit: unit.trim(),
      minStock: Number(minStock) || 0,
      supplier: supplier?.trim() || '',
      unitCost: Number(unitCost) || 0,
      availableStock: Number(availableStock) || 0,
      consumedStock: Number(consumedStock) || 0,
      currentStock: (Number(availableStock) || 0) - (Number(consumedStock) || 0)
    });

    const savedItem = await item.save();

    // Create Opening Stock transaction if availableStock > 0
    if (Number(availableStock) > 0) {
      const transaction = new InventoryTransaction({
        itemId: savedItem._id,
        itemName: savedItem.name,
        type: 'Stock In',
        quantity: Number(availableStock),
        unit: savedItem.unit,
        unitCost: savedItem.unitCost,
        totalCost: Number(availableStock) * savedItem.unitCost,
        supplier: savedItem.supplier || 'Initial Setup',
        reason: 'Opening Stock',
        outlet: outlet || { id: '', name: 'Store Branch' }
      });
      await transaction.save();
    }
    // Create consumption Stock Out transaction if consumedStock > 0
    if (Number(consumedStock) > 0) {
      const transaction = new InventoryTransaction({
        itemId: savedItem._id,
        itemName: savedItem.name,
        type: 'Stock Out',
        quantity: Number(consumedStock),
        unit: savedItem.unit,
        unitCost: savedItem.unitCost,
        totalCost: Number(consumedStock) * savedItem.unitCost,
        supplier: '',
        reason: 'Initial Consumption',
        outlet: outlet || { id: '', name: 'Store Branch' }
      });
      await transaction.save();
    }

    res.status(201).json({ success: true, data: savedItem });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create inventory item', error: error.message });
  }
});

// @desc    Update inventory item details
// @route   PUT /api/inventory/:id
// @access  Admin
router.put('/:id', async (req, res) => {
  try {
    const { name, unit, minStock, availableStock, consumedStock, supplier, unitCost, isActive } = req.body;
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (name !== undefined) item.name = name.trim();
    if (unit !== undefined) item.unit = unit.trim();
    if (minStock !== undefined) item.minStock = Number(minStock) || 0;
    if (supplier !== undefined) item.supplier = supplier.trim();
    if (unitCost !== undefined) item.unitCost = Number(unitCost) || 0;
    if (availableStock !== undefined) item.availableStock = Number(availableStock) || 0;
    if (consumedStock !== undefined) item.consumedStock = Number(consumedStock) || 0;
    item.currentStock = (item.availableStock || 0) - (item.consumedStock || 0);
    if (isActive !== undefined) item.isActive = isActive;

    const updated = await item.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update inventory item', error: error.message });
  }
});

// @desc    Delete/Deactivate inventory item
// @route   DELETE /api/inventory/:id
// @access  Admin
router.delete('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Soft delete to preserve historical transaction integrity
    item.isActive = false;
    await item.save();
    res.json({ success: true, message: 'Inventory item removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete inventory item', error: error.message });
  }
});

// @desc    Log stock movement transaction (Stock In, Stock Out, Adjustment)
// @route   POST /api/inventory/transaction
// @access  Admin
router.post('/transaction', async (req, res) => {
  try {
    const { itemId, type, quantity, unitCost, supplier, reason, outlet, notes } = req.body;
    const qty = Number(quantity);

    if (qty <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than zero' });
    }

    const item = await InventoryItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const cost = unitCost !== undefined ? Number(unitCost) : item.unitCost;
    const totalCost = qty * cost;

    // Record stock change
    if (type === 'Stock In') {
      item.availableStock = (item.availableStock || 0) + qty;
      if (unitCost !== undefined) {
        item.unitCost = cost; // update average unit cost on purchase
      }
    } else if (type === 'Stock Out') {
      if (item.currentStock < qty) {
        return res.status(400).json({ message: `Insufficient stock. Only ${item.currentStock} ${item.unit} available.` });
      }
      item.consumedStock = (item.consumedStock || 0) + qty;
    } else if (type === 'Adjustment') {
      const isIncrease = reason?.toLowerCase().includes('addition') || reason?.toLowerCase().includes('found') || qty > 0;
      if (isIncrease) {
        item.availableStock = (item.availableStock || 0) + qty;
      } else {
        item.consumedStock = (item.consumedStock || 0) + Math.abs(qty);
      }
    } else {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    item.currentStock = (item.availableStock || 0) - (item.consumedStock || 0);

    const transaction = new InventoryTransaction({
      itemId: item._id,
      itemName: item.name,
      type,
      quantity: qty,
      unit: item.unit,
      unitCost: cost,
      totalCost,
      supplier: type === 'Stock In' ? (supplier || item.supplier) : '',
      reason: reason || (type === 'Stock Out' ? 'Consumable Usage' : 'Stock Correction'),
      outlet: outlet || { id: '', name: 'Store Branch' },
      notes
    });

    await Promise.all([
      item.save(),
      transaction.save()
    ]);

    // Also: If type === 'Stock In' (Purchase), we should record a corresponding Expense record automatically!
    // This allows seamless expense tracking under 'Inventory/Supplies' category!
    if (type === 'Stock In') {
      const expense = new Expense({
        date: transaction.date,
        category: 'Inventory/Supplies',
        description: `Purchased ${qty} ${item.unit} of ${item.name}`,
        amount: totalCost,
        outlet: transaction.outlet,
        paymentMethod: 'Cash', // Default
        notes: `Inventory Purchase. Supplier: ${transaction.supplier}`
      });
      await expense.save();
    }

    res.status(201).json({ success: true, item, transaction });
  } catch (error) {
    res.status(400).json({ message: 'Failed to record stock transaction', error: error.message });
  }
});

// @desc    Get inventory transactions history log
// @route   GET /api/inventory/transactions
// @access  Admin
router.get('/transactions', async (req, res) => {
  try {
    const logs = await InventoryTransaction.find({}).sort({ date: -1 }).limit(100);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inventory log', error: error.message });
  }
});

// @desc    Get stock level alerts (low stock items)
// @route   GET /api/inventory/alerts
// @access  Admin
router.get('/alerts', async (req, res) => {
  try {
    const items = await InventoryItem.find({ isActive: true });
    
    const critical = [];
    const low = [];

    items.forEach(item => {
      if (item.currentStock <= 0) {
        critical.push({ name: item.name, stock: item.currentStock, unit: item.unit });
      } else if (item.currentStock <= item.minStock) {
        low.push({ name: item.name, stock: item.currentStock, unit: item.unit });
      }
    });

    res.json({
      success: true,
      critical,
      low
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stock level alerts', error: error.message });
  }
});

export default router;
