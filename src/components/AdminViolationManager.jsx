import React, { useState } from 'react';
import { 
  CheckCircle, XCircle, Eye, Search, Filter, ShieldCheck, 
  MapPin, Clock, FileImage, DollarSign, X 
} from 'lucide-react';
import { STATUS_TYPES, SEVERITY_RULES } from '../config/constants';
import { apiService } from '../services/api';

export default function AdminViolationManager({ violations = [], onViolationUpdated }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const filteredViolations = violations.filter(v => {
    const matchesSearch = 
      v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.violationId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (violationId, newStatus) => {
    setUpdatingId(violationId);
    try {
      const updated = await apiService.updateViolationStatus(violationId, newStatus);
      onViolationUpdated(updated);
      if (selectedViolation && selectedViolation.violationId === violationId) {
        setSelectedViolation(updated);
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>⚖️ Violation Management & Verification</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Review S3 evidence images, verify reported infractions, approve or reject violations
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="form-control"
              placeholder="Search vehicle / location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
            />
          </div>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '160px', fontSize: '0.85rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Verification</option>
            <option value="VERIFIED">Verified / Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="PAID">Fine Paid</option>
          </select>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle Number</th>
                <th>Violation Type</th>
                <th>Severity</th>
                <th>Location & Time</th>
                <th>Fine</th>
                <th>Status</th>
                <th>Verification Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredViolations.map((v) => {
                const statusInfo = STATUS_TYPES[v.status] || STATUS_TYPES.PENDING;
                const severityInfo = SEVERITY_RULES[v.severity] || SEVERITY_RULES.LOW;
                const isUpdating = updatingId === v.violationId;

                return (
                  <tr key={v.violationId}>
                    <td style={{ fontWeight: 700, color: '#60a5fa' }}>{v.violationId}</td>
                    <td>
                      <span style={{ fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.05em', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                        {v.vehicleNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{v.type.replace('_', ' ')}</div>
                    </td>
                    <td>
                      <span className={`badge ${severityInfo.badgeClass}`}>
                        {v.severity}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <div>{v.location}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.date} ({v.time})</div>
                    </td>
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
                          title="View evidence image & details"
                        >
                          <Eye size={13} /> S3 Image
                        </button>

                        {v.status === 'PENDING' && (
                          <>
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => handleStatusChange(v.violationId, 'VERIFIED')}
                              disabled={isUpdating}
                              title="Approve & Verify Violation"
                            >
                              <CheckCircle size={13} /> Verify
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleStatusChange(v.violationId, 'REJECTED')}
                              disabled={isUpdating}
                              title="Reject Violation"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </>
                        )}

                        {v.status !== 'PENDING' && (
                          <select
                            className="form-select"
                            value={v.status}
                            onChange={(e) => handleStatusChange(v.violationId, e.target.value)}
                            style={{ padding: '2px 6px', fontSize: '0.75rem', width: '110px' }}
                            disabled={isUpdating}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="VERIFIED">VERIFIED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="PAID">PAID</option>
                          </select>
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

      {/* S3 Evidence Modal */}
      {selectedViolation && (
        <div className="modal-overlay" onClick={() => setSelectedViolation(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <div>
                <h2>Evidence Review: {selectedViolation.violationId}</h2>
                <div style={{ fontSize: '0.8rem', color: '#60a5fa' }}>
                  AWS S3 Key: parking-project/evidence/{selectedViolation.violationId}.jpg
                </div>
              </div>
              <button onClick={() => setSelectedViolation(null)} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Evidence Image */}
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <img 
                src={selectedViolation.evidenceUrl} 
                alt="Evidence preview"
                style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', display: 'block' }}
              />
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Vehicle Number:</span>
                  <div style={{ fontWeight: 800, fontFamily: 'monospace' }}>{selectedViolation.vehicleNumber}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Offense Category:</span>
                  <div style={{ fontWeight: 700 }}>{selectedViolation.type}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Fine Amount:</span>
                  <div style={{ fontWeight: 800, color: '#fca5a5' }}>₹{selectedViolation.fine}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                  <div>{selectedViolation.location}</div>
                </div>
              </div>
            </div>

            <div className="flex-between">
              <button onClick={() => setSelectedViolation(null)} className="btn btn-secondary">
                Close
              </button>

              <div className="flex-gap-2">
                <button 
                  onClick={() => handleStatusChange(selectedViolation.violationId, 'REJECTED')}
                  className="btn btn-danger btn-sm"
                >
                  <XCircle size={14} /> Reject Report
                </button>
                <button 
                  onClick={() => handleStatusChange(selectedViolation.violationId, 'VERIFIED')}
                  className="btn btn-success btn-sm"
                >
                  <CheckCircle size={14} /> Verify & Issue Fine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
