import express from 'express';
import Service from '../models/Service.js';

const router = express.Router();

// @desc    Get all laundry services
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching services', error: error.message });
  }
});

// @desc    Create a new laundry service
// @route   POST /api/services
// @access  Public (Admin in future)
router.post('/', async (req, res) => {
  try {
    const { id, name, unit, price, features, featured } = req.body;

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
      featured
    });

    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    res.status(400).json({ message: 'Invalid service data', error: error.message });
  }
});

export default router;
