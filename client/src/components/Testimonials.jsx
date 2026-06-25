

import React, { useState, useEffect } from 'react';
import API from '../api/api';

export default function Testimonials() {
  const [allReviews, setAllReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const REVIEWS_PER_BATCH = 5;
  const ROTATION_INTERVAL = 8000; // 8 seconds

  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await API.get('/api/reviews');

        if (response.data.success && response.data.data.length > 0) {
          setAllReviews(response.data.data);
          setError(null);
        } else {
          setError('No reviews available');
          setAllReviews([]);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
        setAllReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Auto-rotate reviews every 8 seconds
  useEffect(() => {
    if (allReviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + REVIEWS_PER_BATCH;
        if (nextIndex >= allReviews.length) {
          return 0;
        }
        return nextIndex;
      });
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [allReviews.length]);

  // Get current batch of reviews
  const getCurrentReviews = () => {
    if (allReviews.length <= REVIEWS_PER_BATCH) {
      return allReviews;
    }

    const endIndex = currentIndex + REVIEWS_PER_BATCH;

    if (endIndex > allReviews.length) {
      const remaining = allReviews.slice(currentIndex);
      const needed = REVIEWS_PER_BATCH - remaining.length;
      return [...remaining, ...allReviews.slice(0, needed)];
    }

    return allReviews.slice(currentIndex, endIndex);
  };

  // Truncate long review text
  const truncateText = (text, maxLength = 150) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  // Format review date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }

    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  };

  const currentReviews = getCurrentReviews();

  if (loading) {
    return (
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title white-bg-heading">
            What Our Customers Say
          </h2>
          <p className="section-subtitle white-bg-subtitle">
            Real feedback from our premium service subscribers
          </p>
          <div className="testimonials-carousel">
            <div className="loading-message">Loading reviews...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error || allReviews.length === 0) {
    return (
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title white-bg-heading">
            What Our Customers Say
          </h2>
          <p className="section-subtitle white-bg-subtitle">
            Real feedback from our premium service subscribers
          </p>
          <div className="testimonials-carousel">
            <div className="error-message">
              {error || 'No reviews available at the moment'}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="testimonials-section">
      <div className="container">
        <h2 className="section-title white-bg-heading">
          What Our Customers Say
        </h2>
        <p className="section-subtitle white-bg-subtitle">
          Real feedback from our premium service subscribers
        </p>

        <div className="testimonials-carousel">
          {currentReviews.map((review, index) => (
            <div
              key={`${review._id}-${currentIndex}-${index}`}
              className="testimonial-card"
              data-aos="zoom-in"
              data-aos-delay={index * 100}
            >
              {/* Review Header */}
              <div className="review-header">
                <div className="reviewer-info">
                  {review.profilePhoto ? (
                    <img
                      src={review.profilePhoto}
                      alt={review.author}
                      className="reviewer-avatar"
                    />
                  ) : (
                    <div className="reviewer-avatar-placeholder">
                      {review.author.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="reviewer-details">
                    <h4 className="reviewer-name">
                      {review.author}
                    </h4>
                    <p className="review-date">
                      {formatDate(review.reviewDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Star Rating */}
              <div className="stars">
                {'★'.repeat(review.rating)}
              </div>

              {/* Review Text */}
              <p className="testimonial-text">
                {truncateText(review.text)}
              </p>
            </div>
          ))}
        </div>

        {/* Review Counter */}
        {allReviews.length > REVIEWS_PER_BATCH && (
          <div className="review-counter">
            Showing {currentIndex + 1} -{' '}
            {Math.min(
              currentIndex + REVIEWS_PER_BATCH,
              allReviews.length
            )}{' '}
            of {allReviews.length} reviews
          </div>
        )}
      </div>
    </section>
  );
}

