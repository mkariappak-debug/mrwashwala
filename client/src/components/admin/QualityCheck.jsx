import React from 'react';

export default function QualityCheck({ qcPrologue, onSubmit, isSubmitting }) {
  return (
    <div className="processing-qc-container" style={{ padding: '20px 0', borderTop: '1px solid var(--admin-glass-border-subtle)', marginTop: 8 }}>
      <div className="processing-qc-header">
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--admin-heading)', letterSpacing: '0.04em' }}>QUALITY CHECK</h3>
      </div>
      <div className="processing-qc-body">
        <p className="processing-qc-prologue" style={{ marginBottom: 16, color: 'var(--admin-muted)', fontSize: '0.9rem' }}>{qcPrologue}</p>
        
        <div className="processing-qc-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button 
            type="button"
            className="admin-button"
            style={{ background: '#10b981', color: '#fff', padding: '12px', fontSize: '0.9rem' }}
            onClick={() => onSubmit('Pass')}
            disabled={isSubmitting}
          >
            ✓ PASS
          </button>
          
          <button 
            type="button"
            className="admin-button admin-button--danger"
            style={{ padding: '12px', fontSize: '0.9rem' }}
            onClick={() => onSubmit('Needs Rework')}
            disabled={isSubmitting}
          >
            ↻ NEEDS REWORK
          </button>
        </div>
      </div>
    </div>
  );
}
