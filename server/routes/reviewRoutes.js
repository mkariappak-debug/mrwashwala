import express from 'express';
import Review from '../models/Review.js';
import { adminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/reviews
 * Fetch all 5-star reviews, sorted by newest first
 * Returns: Array of review objects
 */
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ approved: true, hidden: false })
      .sort({ reviewDate: -1 })
      .select('author rating text profilePhoto reviewDate source reply')
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
router.post('/', adminAuth, async (req, res) => {
  try {
    const { author, rating, text, profilePhoto, reviewDate, source, approved, hidden, reply } = req.body;

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
      approved: approved !== undefined ? approved : true,
      hidden: hidden !== undefined ? hidden : false,
      reply: reply || '',
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

// @desc    Update review moderation or reply
// @route   PATCH /api/reviews/:id
// @access  Admin
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const { approved, hidden, reply, author, rating, text } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (approved !== undefined) review.approved = approved;
    if (hidden !== undefined) review.hidden = hidden;
    if (typeof reply === 'string') review.reply = reply;
    if (author) review.author = author;
    if (rating) review.rating = rating;
    if (text) review.text = text;

    const updatedReview = await review.save();
    res.status(200).json({ success: true, data: updatedReview });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, message: 'Failed to update review', error: error.message });
  }
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await review.remove();
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review', error: error.message });
  }
});

export default router;
