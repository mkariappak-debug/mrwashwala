import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="admin-empty-state" style={{ minHeight: 220 }}>
      <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4, margin: '0 auto 16px' }} />
      <p>Loading dashboard…</p>
    </div>
  );
}
