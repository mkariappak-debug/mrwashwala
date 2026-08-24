import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/api';

export default function OrderProcessing() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('mrwashwala_admin_token');
        const res = await API.get('/api/processing/active', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setTickets(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) return <div className="admin-loading">Loading processing orders...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  const grouped = {
    'Needs Attention': tickets.filter(t => t.status === 'Needs Attention'),
    'In Progress': tickets.filter(t => t.status === 'In Progress'),
    'New Orders': tickets.filter(t => t.status === 'New'),
    'Ready': tickets.filter(t => t.status === 'Ready')
  };

  const renderCard = (ticket) => (
    <div 
      key={ticket._id} 
      className={`processing-card ${ticket.status === 'Needs Attention' ? 'alert' : ''}`}
      onClick={() => navigate(`/admin/processing/${ticket._id}`)}
    >
      <div className="processing-card-header">
        <span className="processing-order-id">{ticket.orderId}</span>
        <span className="processing-status-badge">{ticket.status}</span>
      </div>
      <div className="processing-card-body">
        <h3 className="processing-customer-name">{ticket.customerName}</h3>
        <p className="processing-service-name">{ticket.serviceName}</p>
      </div>
      <div className="processing-card-footer">
        <span className="processing-action-prompt">
          {ticket.status === 'New' ? 'START PROCESSING ➔' : 'CONTINUE ➔'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="admin-processing-container">
      <header className="admin-page-header">
        <h1>Order Processing</h1>
        <p>Manage active laundry processing tasks</p>
      </header>

      <div className="processing-categories">
        {Object.entries(grouped).map(([category, items]) => {
          if (items.length === 0) return null;
          return (
            <section key={category} className="processing-category-section">
              <h2 className="processing-category-title">{category} ({items.length})</h2>
              <div className="processing-card-grid">
                {items.map(renderCard)}
              </div>
            </section>
          );
        })}
        {tickets.length === 0 && (
          <div className="processing-empty-state">
            <p>No active orders to process.</p>
          </div>
        )}
      </div>
    </div>
  );
}
