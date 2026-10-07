import React from 'react';
import { Car, AlertTriangle, Clock, CreditCard, PlusCircle, CheckCircle, Eye, AlertOctagon } from 'lucide-react';
import { STATUS_TYPES, SEVERITY_RULES } from '../config/constants';

export default function UserDashboard({ 
  vehicles = [], 
  violations = [], 
  onOpenReportModal, 
  onViewViolation,
  onNavigateTab 
}) {
  const vehicleCount = vehicles.length;
  const violationCount = violations.length;
  const pendingCount = violations.filter(v => v.status === 'PENDING').length;
  const totalFine = violations.reduce((acc, v) => acc + (v.status !== 'REJECTED' ? v.fine : 0), 0);

  // Repeat offender check
  const repeatVehicles = vehicles.filter(v => {
    const vCount = violations.filter(viol => viol.vehicleNumber.toUpperCase() === v.vehicleNumber.toUpperCase()).length;
    return vCount >= 3;
  });

  return (
    <div>
      {/* Repeat Offender Warning Notification Banner (Section 2 & 14) */}
      {repeatVehicles.length > 0 && (
        <div className="alert-banner">
          <AlertOctagon size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#fca5a5' }}>
              ⚠️ REPEAT VIOLATION WARNING ISSUED
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
              The following registered vehicle(s) have accumulated 3 or more violations: {' '}
              <strong>{repeatVehicles.map(v => v.vehicleNumber).join(', ')}</strong>. 
              Subsequent infractions will incur double penalties and towing escalations.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards (Section 15) */}
      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-info">
            <h3>My Vehicles</h3>
            <div className="stat-value">{vehicleCount}</div>
          </div>
          <div className="stat-icon">
            <Car size={26} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>My Violations</h3>
            <div className="stat-value">{violationCount}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
            <AlertTriangle size={26} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Pending</h3>
            <div className="stat-value">{pendingCount}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
            <Clock size={26} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Fine</h3>
            <div className="stat-value" style={{ color: '#60a5fa' }}>₹{totalFine.toLocaleString()}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
            <CreditCard size={26} />
          </div>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="glass-card flex-between" style={{ padding: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Witnessed a Parking Infraction?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Report campus violations easily with instant severity assessment & photo evidence upload.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onOpenReportModal}>
          <PlusCircle size={18} /> Report Violation
        </button>
      </div>

      {/* Recent Violations Table */}
      <div className="glass-card">
        <div className="card-title">
          <h2>
            <AlertTriangle size={20} className="text-warning" /> Recent Violations
          </h2>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigateTab('history')}
          >
            View All History
          </button>
        </div>

        {violations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <CheckCircle size={40} style={{ color: '#10b981', marginBottom: '0.5rem', opacity: 0.8 }} />
            <p>No parking violations recorded for your vehicles!</p>
          </div>
        ) : (
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
                {violations.slice(0, 5).map((v) => {
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
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => onViewViolation(v)}
                        >
                          <Eye size={14} /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
