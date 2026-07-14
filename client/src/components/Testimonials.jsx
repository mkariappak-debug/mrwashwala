import React, { useState, useEffect } from 'react';
import API from '../api/api';

export default function Testimonials() {
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

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
          <div className="testimonials-carousel-wrapper">
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
          <div className="testimonials-carousel-wrapper">
            <div className="error-message">
              {error || 'No reviews available at the moment'}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Duplicate the review list so the marquee can loop seamlessly at -50%,
  // exactly like the "Our Work Speaks for Itself" gallery carousel.
  const trackReviews = [...allReviews, ...allReviews];

  return (
    <section className="testimonials-section">
      <div className="container">
        <h2 className="section-title white-bg-heading">
          What Our Customers Say
        </h2>
        <p className="section-subtitle white-bg-subtitle">
          Real feedback from our premium service subscribers
        </p>

        <div
          className="testimonials-carousel-wrapper"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="testimonials-fade-left" />

          <div
            className={`testimonials-carousel ${
              isHovered ? 'paused' : 'scrolling'
            }`}
          >
            {trackReviews.map((review, index) => (
              <div
                key={`${review._id}-${index}`}
                className="testimonial-card"
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
                      <h4 className="reviewer-name">{review.author}</h4>
                      <p className="review-date">
                        {formatDate(review.reviewDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="stars">{'★'.repeat(review.rating)}</div>

                {/* Review Text */}
                <p className="testimonial-text">
                  {truncateText(review.text)}
                </p>
              </div>
            ))}
          </div>

          <div className="testimonials-fade-right" />
        </div>
      </div>
    </section>
  );
}
