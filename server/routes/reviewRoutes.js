import express from 'express';
import Review from '../models/Review.js';

const router = express.Router();

/**
 * GET /api/reviews
 * Fetch all 5-star reviews, sorted by newest first
 * Returns: Array of review objects
 */
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ rating: 5 })
      .sort({ reviewDate: -1 })
      .select('author rating text profilePhoto reviewDate source')
      .lean();

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

/**
 * POST /api/reviews
 * Create a new review (for manual entry or future automation)
 * Body: { author, rating, text, profilePhoto, reviewDate, source }
 */
router.post('/', async (req, res) => {
  try {
    const { author, rating, text, profilePhoto, reviewDate, source } = req.body;

    // Validate required fields
    if (!author || !text || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: 'author, text, and rating are required'
      });
    }

    // Validate rating
    if (![1, 2, 3, 4, 5].includes(rating)) {
      return res.status(400).json({
        success: false,
        message: 'rating must be between 1 and 5'
      });
    }

    const review = await Review.create({
      author,
      rating,
      text,
      profilePhoto: profilePhoto || null,
      reviewDate: reviewDate || new Date(),
      source: source || 'manual'
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
});

/**
 * GET /api/reviews/:id
 * Fetch a specific review by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review',
      error: error.message
    });
  }
});

export default router;
