import React from 'react';
import { Car, BarChart2, AlertCircle, FileText, AlertTriangle } from 'lucide-react';

export default function VehicleReportTab({ violations = [], vehicles = [] }) {
  // Aggregate vehicle-wise metrics
  const vehicleStatsMap = {};

  violations.forEach(v => {
    const num = v.vehicleNumber.toUpperCase();
    if (!vehicleStatsMap[num]) {
      vehicleStatsMap[num] = {
        vehicleNumber: num,
        totalViolations: 0,
        highSeverity: 0,
        mediumSeverity: 0,
        lowSeverity: 0,
        totalFines: 0,
        pendingCount: 0,
        verifiedCount: 0,
        paidCount: 0,
        rejectedCount: 0
      };
    }
    const stat = vehicleStatsMap[num];
    stat.totalViolations += 1;
    if (v.severity === 'HIGH') stat.highSeverity += 1;
    else if (v.severity === 'MEDIUM') stat.mediumSeverity += 1;
    else stat.lowSeverity += 1;

    if (v.status !== 'REJECTED') stat.totalFines += v.fine;
    if (v.status === 'PENDING') stat.pendingCount += 1;
    else if (v.status === 'VERIFIED') stat.verifiedCount += 1;
    else if (v.status === 'PAID') stat.paidCount += 1;
    else if (v.status === 'REJECTED') stat.rejectedCount += 1;
  });

  const vehicleReports = Object.values(vehicleStatsMap).sort((a, b) => b.totalViolations - a.totalViolations);

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>📈 Vehicle-wise Violation Breakdown</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Comprehensive analytics of offenses and fine distribution per registered vehicle
          </p>
        </div>
      </div>

      {vehicleReports.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <FileText size={44} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', opacity: 0.6 }} />
          <h3>No Vehicle Offense Data Available</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No violation reports recorded across any vehicles yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {vehicleReports.map(stat => {
            const isRepeat = stat.totalViolations >= 3;
            return (
              <div key={stat.vehicleNumber} className="glass-card" style={{ margin: 0, border: isRepeat ? '1px solid rgba(239, 68, 68, 0.4)' : undefined }}>
                <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: '10px', 
                      background: isRepeat ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: isRepeat ? '#f87171' : '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Car size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'monospace', fontSize: '1.25rem', letterSpacing: '0.05em' }}>
                        {stat.vehicleNumber}
                      </h3>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                        {isRepeat && (
                          <span className="badge badge-high" style={{ fontSize: '0.7rem' }}>
                            ⚠️ REPEAT OFFENDER (3+ OFFENSES)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accumulated Fines</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fca5a5' }}>
                      ₹{stat.totalFines.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Severity Breakdown Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div className="flex-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>Severity Distribution ({stat.totalViolations} total)</span>
                    <span>
                      <strong style={{ color: '#f87171' }}>{stat.highSeverity} High</strong> | {' '}
                      <strong style={{ color: '#fbbf24' }}>{stat.mediumSeverity} Medium</strong> | {' '}
                      <strong style={{ color: '#60a5fa' }}>{stat.lowSeverity} Low</strong>
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${(stat.highSeverity / stat.totalViolations) * 100}%`, background: '#ef4444' }} />
                    <div style={{ width: `${(stat.mediumSeverity / stat.totalViolations) * 100}%`, background: '#f59e0b' }} />
                    <div style={{ width: `${(stat.lowSeverity / stat.totalViolations) * 100}%`, background: '#3b82f6' }} />
                  </div>
                </div>

                {/* Status Summary Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                    <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600 }}>PENDING</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{stat.pendingCount}</div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                    <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>VERIFIED</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{stat.verifiedCount}</div>
                  </div>
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                    <div style={{ color: '#818cf8', fontSize: '0.75rem', fontWeight: 600 }}>PAID</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{stat.paidCount}</div>
                  </div>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                    <div style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 600 }}>REJECTED</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{stat.rejectedCount}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
