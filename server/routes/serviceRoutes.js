import express from 'express';
import Service from '../models/Service.js';
import { adminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all laundry services
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { displayType, customizeCategory, customizeSubcategory, featured } = req.query;
    const filter = {};

    if (displayType === 'main') {
      filter.$or = [{ displayType: 'main' }, { displayType: { $exists: false } }];
    } else if (displayType === 'customize') {
      filter.displayType = 'customize';
    }

    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }

    if (customizeCategory) {
      filter.customizeCategory = customizeCategory;
    }

    if (customizeSubcategory) {
      filter.customizeSubcategory = customizeSubcategory;
    }

    const services = await Service.find(filter);
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching services', error: error.message });
  }
});

// @desc    Create a new laundry service
// @route   POST /api/services
// @access  Admin
router.post('/', adminAuth, async (req, res) => {
  try {
    const { id, name, unit, price, features, featured, displayType, customizeCategory, customizeSubcategory } = req.body;

    // Check if service already exists
    const serviceExists = await Service.findOne({ id });
    if (serviceExists) {
      return res.status(400).json({ message: 'Service with this ID already exists' });
    }

    const service = new Service({
      id,
      name,
      unit,
      price,
      features,
      featured,
      displayType,
      customizeCategory,
      customizeSubcategory
    });

    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    res.status(400).json({ message: 'Invalid service data', error: error.message });
  }
});

// @desc    Update a laundry service
// @route   PUT /api/services/:id
// @access  Admin
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, unit, price, features, featured, displayType, customizeCategory, customizeSubcategory } = req.body;
    const service = await Service.findOne({ id: req.params.id });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (name !== undefined) service.name = name;
    if (unit !== undefined) service.unit = unit;
    if (price !== undefined) service.price = price;
    if (features !== undefined) service.features = features;
    if (featured !== undefined) service.featured = featured;
    if (displayType !== undefined) service.displayType = displayType;
    if (customizeCategory !== undefined) service.customizeCategory = customizeCategory;
    if (customizeSubcategory !== undefined) service.customizeSubcategory = customizeSubcategory;

    const updatedService = await service.save();
    res.json(updatedService);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update service', error: error.message });
  }
});

// @desc    Delete a laundry service
// @route   DELETE /api/services/:id
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const result = await Service.deleteOne({ id: req.params.id });
    if (!result || result.deletedCount === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete service', error: error.message });
  }
});

export default router;
