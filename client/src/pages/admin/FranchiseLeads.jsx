import React, { useEffect, useState } from 'react';
import API from '../../api/api';
import { useAdminBranch } from '../../context/AdminBranchContext.jsx';

const statusOptions = ['New', 'Contacted', 'Interested', 'Closed', 'Rejected'];

const LeadCard = ({ lead, onSave }) => {
  const [status, setStatus] = useState(lead.status || 'New');
  const [assignedTo, setAssignedTo] = useState(lead.assignedTo || '');
  const [notes, setNotes] = useState(lead.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(lead._id, { status, assignedTo, notes });
    setSaving(false);
  };

  return (
    <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--admin-heading)' }}>{lead.name}</h3>
          <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
          {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
        </div>
      </div>
      
      <div className="admin-cell-user" style={{ gap: 8, marginTop: '4px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>📞 {lead.phone}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✉️ {lead.email || 'No email'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>📍 {lead.city || 'No city'} {lead.branch ? `(${lead.branch.name})` : ''}</span>
      </div>
      
      <div style={{ height: '1px', background: 'var(--admin-glass-border-subtle)', margin: '6px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <input className="admin-input" placeholder="Assign staff" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
        <textarea className="admin-textarea" rows={3} placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <button type="button" className="admin-button" onClick={handleSave} disabled={saving} style={{ marginTop: '4px' }}>
        {saving ? 'Saving...' : 'Save Updates'}
      </button>
    </div>
  );
};

export default function AdminFranchiseLeads() {
  const { selectedBranchId } = useAdminBranch();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleUpdateLead = async (id, updates) => {
    try {
      const response = await API.patch(`/api/franchise-leads/${id}/status`, updates);
      setLeads((prev) => prev.map((lead) => (lead._id === id ? response.data.data : lead)));
    } catch (err) {
      alert(err?.response?.data?.message || 'Unable to update lead');
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
      <div className="admin-page-header" style={{ marginBottom: '10px' }}>
        <h1>Franchise Leads</h1>
        <p>Manage and track all prospective franchise inquiries without duplicate panels.</p>
      </div>

      {leads.length === 0 ? (
        <div className="admin-empty-state">No franchise leads available.</div>
      ) : (
        <div className="admin-grid admin-grid--3">
          {leads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} onSave={handleUpdateLead} />
          ))}
        </div>
      )}
    </div>
  );
}
