import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5],
      default: 5
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    profilePhoto: {
      type: String,
      default: null
    },
    reviewDate: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      enum: ['google', 'manual', 'api'],
      default: 'manual'
    }
  },
  { timestamps: true }
);

// Index for faster queries
reviewSchema.index({ rating: 1, reviewDate: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
