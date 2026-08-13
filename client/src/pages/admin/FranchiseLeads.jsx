import React, { useEffect, useState } from 'react';
import API from '../../api/api';
import { useAdminBranch } from '../../context/AdminBranchContext.jsx';

const statusOptions = ['New', 'Contacted', 'Interested', 'Closed', 'Rejected'];

export default function AdminFranchiseLeads() {
  const { selectedBranchId } = useAdminBranch();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLead, setActiveLead] = useState(null);
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('New');

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedBranchId && selectedBranchId !== 'all') params.branch = selectedBranchId;
        const response = await API.get('/api/franchise-leads', { params });
        setLeads(response.data.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Unable to load franchise leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [selectedBranchId]);

  const selectLead = (lead) => {
    setActiveLead(lead);
    setNotes(lead.notes || '');
    setAssignedTo(lead.assignedTo || '');
    setStatus(lead.status || 'New');
  };

  const saveLead = async () => {
    if (!activeLead) return;
    try {
      const response = await API.patch(`/api/franchise-leads/${activeLead._id}/status`, {
        status,
        assignedTo,
        notes
      });
      setLeads((prev) => prev.map((lead) => (lead._id === response.data.data._id ? response.data.data : lead)));
      setActiveLead(response.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to update lead');
    }
  };

  if (loading) {
    return <div className="admin-empty-state">Loading franchise leads…</div>;
  }

  if (error) {
    return <div className="admin-empty-state">{error}</div>;
  }

  return (
    <div className="admin-section">
      <div className="admin-grid" style={{ gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.35fr)', gap: 24 }}>
        <div className="admin-card">
          <div className="admin-card__title">Franchise Leads</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {leads.length === 0 ? (
              <div className="admin-empty-state">No leads available.</div>
            ) : (
              leads.map((lead) => (
                <button
                  type="button"
                  key={lead._id}
                  onClick={() => selectLead(lead)}
                  className="admin-card"
                  style={{ textAlign: 'left', width: '100%', cursor: 'pointer', display: 'grid', gap: 8 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <strong>{lead.name}</strong>
                    <span className="status-pill">{lead.status}</span>
                  </div>
                  <div style={{ display: 'grid', gap: 4, fontSize: '0.95rem' }}>
                    <div>{lead.phone}</div>
                    <div>{lead.email || 'No email provided'}</div>
                    <div>{lead.city || 'No city specified'}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card__title">Lead Details</div>
          {activeLead ? (
            <div className="admin-form">
              <div>
                <strong>Name:</strong> {activeLead.name}
              </div>
              <div>
                <strong>Phone:</strong> {activeLead.phone}
              </div>
              <div>
                <strong>Email:</strong> {activeLead.email || '—'}
              </div>
              <div>
                <strong>City:</strong> {activeLead.city || '—'}
              </div>
              <div>
                <strong>Branch:</strong> {activeLead.branch?.name || '—'}
              </div>
              <select className="admin-select" value={status} onChange={(event) => setStatus(event.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input
                className="admin-input"
                placeholder="Assign staff"
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
              />
              <textarea
                className="admin-textarea"
                rows={5}
                placeholder="Notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
              <button type="button" className="admin-button" onClick={saveLead}>
                Save Lead
              </button>
            </div>
          ) : (
            <div className="admin-empty-state">Select a lead to manage details.</div>
          )}
        </div>
      </div>
    </div>
  );
}
