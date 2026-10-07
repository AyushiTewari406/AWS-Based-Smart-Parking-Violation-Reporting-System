import React, { useState, useEffect } from 'react';
import { AlertTriangle, Filter, Eye, CheckCircle2, CreditCard, X, MapPin, Calendar, Clock, DollarSign } from 'lucide-react';
import { STATUS_TYPES, SEVERITY_RULES } from '../config/constants';
import { apiService, USE_MOCK_API } from '../services/api';

export default function ViolationHistoryTab({ violations = [], onViolationUpdated }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [paying, setPaying] = useState(false);
  const [resolvedEvidenceUrl, setResolvedEvidenceUrl] = useState(null);

  // In real mode, evidenceUrl isn't included on the violation object (the
  // S3 bucket is private, so it has to be resolved to a short-lived
  // presigned URL on demand, per violation, when it's actually opened.
  useEffect(() => {
    if (!selectedViolation) { setResolvedEvidenceUrl(null); return; }
    if (USE_MOCK_API || selectedViolation.evidenceUrl) {
      setResolvedEvidenceUrl(selectedViolation.evidenceUrl || null);
      return;
    }
    if (!selectedViolation.evidenceKey) { setResolvedEvidenceUrl(null); return; }
    let cancelled = false;
    apiService.getEvidenceUrl(selectedViolation.violationId)
      .then(url => { if (!cancelled) setResolvedEvidenceUrl(url); })
      .catch(() => { if (!cancelled) setResolvedEvidenceUrl(null); });
    return () => { cancelled = true; };
  }, [selectedViolation]);

  const filteredViolations = violations.filter(v => {
    if (filterStatus === 'ALL') return true;
    return v.status === filterStatus;
  });

  const handlePayFine = async (violationId) => {
    setPaying(true);
    try {
      const updated = await apiService.updateViolationStatus(violationId, 'PAID');
      onViolationUpdated(updated);
      if (selectedViolation && selectedViolation.violationId === violationId) {
        setSelectedViolation(updated);
      }
    } catch (err) {
      alert('Error processing payment: ' + err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>📜 Violation History & Status Tracking</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Track violation status in real-time, view evidence, and settle outstanding fines
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {['ALL', 'PENDING', 'VERIFIED', 'REJECTED', 'PAID'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredViolations.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <CheckCircle2 size={44} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
          <h3>No Violations Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No records matched the selected status filter ({filterStatus}).
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Violation ID</th>
                  <th>Vehicle Number</th>
                  <th>Type & Severity</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Fine</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredViolations.map((v) => {
                  const statusInfo = STATUS_TYPES[v.status] || STATUS_TYPES.PENDING;
                  const severityInfo = SEVERITY_RULES[v.severity] || SEVERITY_RULES.MINOR;
                  return (
                    <tr key={v.violationId}>
                      <td style={{ fontWeight: 700, color: '#60a5fa' }}>{v.violationId}</td>
                      <td>
                        <span style={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                          {v.vehicleNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{v.type.replace('_', ' ')}</div>
                        <span className={`badge ${severityInfo.badgeClass}`} style={{ marginTop: '2px' }}>
                          {v.severity}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {v.date} ({v.time})
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{v.location}</td>
                      <td style={{ fontWeight: 800, color: '#fca5a5' }}>₹{v.fine}</td>
                      <td>
                        <span 
                          className="status-pill"
                          style={{ background: statusInfo.bg, color: statusInfo.color }}
                        >
                          <span className="status-dot" style={{ background: statusInfo.color }} />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex-gap-2">
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedViolation(v)}
                          >
                            <Eye size={14} /> View
                          </button>
                          {(v.status === 'VERIFIED' || v.status === 'PENDING') && (
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => handlePayFine(v.violationId)}
                              disabled={paying}
                            >
                              <CreditCard size={13} /> Pay Fine
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Modal */}
      {selectedViolation && (
        <div className="modal-overlay" onClick={() => setSelectedViolation(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2>Violation Details: {selectedViolation.violationId}</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <span className={`badge badge-${(selectedViolation.severity || 'minor').toLowerCase()}`}>
                    {selectedViolation.severity} SEVERITY
                  </span>
                  <span 
                    className="status-pill"
                    style={{ 
                      background: (STATUS_TYPES[selectedViolation.status] || STATUS_TYPES.PENDING).bg, 
                      color: (STATUS_TYPES[selectedViolation.status] || STATUS_TYPES.PENDING).color 
                    }}
                  >
                    {(STATUS_TYPES[selectedViolation.status] || STATUS_TYPES.PENDING).label}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedViolation(null)} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Evidence Image */}
            <div style={{ marginBottom: '1.25rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', maxHeight: '300px' }}>
              {resolvedEvidenceUrl ? (
                <img
                  src={resolvedEvidenceUrl}
                  alt="Evidence"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {selectedViolation.evidenceKey ? 'Loading evidence photo…' : 'No evidence photo attached'}
                </div>
              )}
            </div>

            {/* Details Table */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Vehicle Number</span>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1.1rem' }}>{selectedViolation.vehicleNumber}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Penalty Fine</span>
                  <div style={{ fontWeight: 800, color: '#fca5a5', fontSize: '1.1rem' }}>₹{selectedViolation.fine}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Timestamp</span>
                  <div>{selectedViolation.date} at {selectedViolation.time}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Location</span>
                  <div>{selectedViolation.location}</div>
                </div>
              </div>
            </div>

            <div className="flex-between">
              <button onClick={() => setSelectedViolation(null)} className="btn btn-secondary">
                Close
              </button>
              {(selectedViolation.status === 'VERIFIED' || selectedViolation.status === 'PENDING') && (
                <button 
                  onClick={() => handlePayFine(selectedViolation.violationId)} 
                  className="btn btn-success"
                  disabled={paying}
                >
                  <CreditCard size={16} /> Pay Fine Now (₹{selectedViolation.fine})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
