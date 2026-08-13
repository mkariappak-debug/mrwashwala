import React, { useCallback, useEffect, useState } from 'react';
import API from '../../api/api';
import { useAdminBranch } from '../../context/AdminBranchContext.jsx';

const ratingOptions = ['All', '1', '2', '3', '4', '5'];

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingFilter, setRatingFilter] = useState('All');
  const [showHidden, setShowHidden] = useState(false);
  const [replyMap, setReplyMap] = useState({});

  const { selectedBranchId } = useAdminBranch();
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (ratingFilter !== 'All') params.rating = ratingFilter;
      params.hidden = showHidden;
      if (selectedBranchId && selectedBranchId !== 'all') params.branch = selectedBranchId;
      const response = await API.get('/api/admin/reviews', { params });
      setReviews(response.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to load reviews');
    } finally {
      setLoading(false);
    }
  }, [ratingFilter, showHidden, selectedBranchId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const refreshReviews = async () => {
    await fetchReviews();
  };

  const handleAction = async (reviewId, updates) => {
    try {
      await API.patch(`/api/reviews/${reviewId}`, updates);
      await refreshReviews();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update review');
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await API.delete(`/api/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((review) => review._id !== reviewId));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete review');
    }
  };

  const handleReplyChange = (id, value) => {
    setReplyMap((prev) => ({ ...prev, [id]: value }));
  };

  const addReply = async (reviewId) => {
    await handleAction(reviewId, { reply: replyMap[reviewId] || '' });
  };

  if (loading) {
    return <div className="admin-empty-state">Loading reviews…</div>;
  }

  if (error) {
    return <div className="admin-empty-state">{error}</div>;
  }

  return (
    <div className="admin-section">
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card__title">Review Filters</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select
            className="admin-select"
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
            style={{ width: 160 }}
          >
            {ratingOptions.map((value) => (
              <option key={value} value={value}>{value === 'All' ? 'All Ratings' : `${value}★`}</option>
            ))}
          </select>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={showHidden} onChange={(event) => setShowHidden(event.target.checked)} />
            Show hidden
          </label>
          <button className="admin-button" type="button" onClick={refreshReviews}>
            Refresh
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__title">Review Moderation</div>
        {reviews.length === 0 ? (
          <div className="admin-empty-state">No reviews found.</div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Rating</th>
                <th>Text</th>
                <th>Status</th>
                <th>Reply</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review._id}>
                  <td>{review.author}</td>
                  <td>{review.rating}★</td>
                  <td>{review.text}</td>
                  <td>
                    <span className={`status-pill ${review.hidden ? 'cancelled' : review.approved ? 'delivered' : 'warning'}`}>
                      {review.hidden ? 'Hidden' : review.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <input
                      className="admin-input"
                      value={replyMap[review._id] ?? review.reply ?? ''}
                      onChange={(event) => handleReplyChange(review._id, event.target.value)}
                      placeholder="Reply text"
                    />
                  </td>
                  <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" className="admin-button" onClick={() => handleAction(review._id, { approved: true, hidden: false })}>
                      Approve
                    </button>
                    <button type="button" className="admin-button" onClick={() => handleAction(review._id, { hidden: true })}>
                      Hide
                    </button>
                    <button type="button" className="admin-button" onClick={() => addReply(review._id)}>
                      Save Reply
                    </button>
                    <button type="button" className="admin-button" onClick={() => handleDelete(review._id)} style={{ background: '#ef4444', color: '#fff' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
