import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/api';
import SlideToComplete from '../../components/admin/SlideToComplete.jsx';
import QualityCheck from '../../components/admin/QualityCheck.jsx';

const formatDateTime = (dateValue) => {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;

  const day = d.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeStr = `${hours}:${minutes} ${ampm}`;

  return `${day} ${month} ${year}, ${timeStr}`;
};

export default function ProcessingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQc, setShowQc] = useState(false);

  const handleStartStep = async (ticketId, token) => {
    try {
      const res = await API.post(`/api/processing/${ticketId}/start`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicket = async () => {
    try {
      const token = localStorage.getItem('mrwashwala_admin_token');
      const res = await API.get(`/api/processing/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = res.data;
      setData(json);
      
      // If it's a new ticket, auto-start the first step
      if (json.ticket.status === 'New') {
        handleStartStep(json.ticket._id, token);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleCompleteInitiated = () => {
    const { ticket, workflow } = data;
    const currentStepDef = workflow.steps[ticket.currentStepIndex];
    if (currentStepDef.requiresQc) {
      setShowQc(true);
    } else {
      submitCompletion(null);
    }
  };

  const submitCompletion = async (qcResult) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('mrwashwala_admin_token');
      const res = await API.post(`/api/processing/${id}/complete`, { qcResult }, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      const json = res.data;
      
      if (json.ticket.status === 'Completed' || json.ticket.status === 'Ready') {
        navigate('/admin/processing');
      } else {
        setData(json);
        setShowQc(false);
        
        // Auto-start next step
        if (json.ticket.status !== 'Needs Attention') {
          handleStartStep(id, token);
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading ticket...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;
  if (!data) return null;

  const { ticket, workflow } = data;
  const currentStepDef = workflow.steps[ticket.currentStepIndex];
  
  if (!currentStepDef) {
    return (
      <div className="admin-processing-container">
        <h2>Workflow Completed</h2>
        <button onClick={() => navigate('/admin/processing')} className="admin-button">Back to List</button>
      </div>
    );
  }

  return (
    <div className="processing-detail-container">
      <div className="processing-detail-header">
        <button className="processing-back-btn" onClick={() => navigate('/admin/processing')}>
          ← Back
        </button>
        <div className="processing-detail-meta">
          <h2>{ticket.serviceName}</h2>
          <span className="processing-order-id">{ticket.orderId}</span>
        </div>
      </div>

      <div className="processing-progress-indicator">
        Step {ticket.currentStepIndex + 1} of {workflow.steps.length}
      </div>

      <div className="processing-active-step">
        <div className="processing-step-meta">
          <span className="processing-step-label">Current Task</span>
          <h1 className="processing-step-title">{currentStepDef.label}</h1>
        </div>

        {ticket.status === 'Needs Attention' && (
          <div className="processing-alert-banner">
            ⚠️ This step requires rework from a previous failed quality check.
          </div>
        )}

        {showQc ? (
          <QualityCheck 
            qcPrologue={currentStepDef.qcPrologue}
            isSubmitting={isSubmitting}
            onSubmit={submitCompletion}
          />
        ) : (
          <div className="processing-action-area">
            <SlideToComplete 
              onComplete={handleCompleteInitiated} 
              isSubmitting={isSubmitting}
              label={`SLIDE TO COMPLETE ${currentStepDef.label.toUpperCase()}`}
              desktopLabel={`Complete ${currentStepDef.label}`}
            />
          </div>
        )}
      </div>

      <div className="processing-history">
        <h3>History</h3>
        {(!ticket.history || ticket.history.length === 0) ? (
          <div className="admin-muted-text" style={{ fontSize: '0.85rem' }}>
            No stage history recorded yet.
          </div>
        ) : (
          ticket.history.map((h, i) => {
            const stepName = workflow?.steps?.find(s => s.id === h.step)?.label || h.step || `Step ${i + 1}`;
            const startTime = formatDateTime(h.startedAt);
            const endTime = formatDateTime(h.completedAt);
            return (
              <div key={i} className={`processing-history-item ${h.qcResult === 'Needs Rework' ? 'rework' : ''}`}>
                <div className="history-step-name">{stepName}</div>
                <div className="history-meta" style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                  <div>Started: {startTime || '—'}</div>
                  <div>Ended: {endTime || (startTime ? 'In Progress' : '—')}</div>
                  {h.qcResult && (
                    <div style={{ color: h.qcResult === 'Needs Rework' ? '#ef4444' : '#10b981', fontWeight: 500, marginTop: '2px' }}>
                      QC: {h.qcResult} {h.reworkCount > 0 ? `(Attempt ${h.reworkCount + 1})` : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
