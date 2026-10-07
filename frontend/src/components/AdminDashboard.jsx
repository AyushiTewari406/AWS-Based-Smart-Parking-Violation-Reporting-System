import React from 'react';
import { 
  Shield, AlertTriangle, Clock, CheckCircle, MapPin, 
  TrendingUp, Users, DollarSign, AlertOctagon, BarChart
} from 'lucide-react';
import { ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export default function AdminDashboard({ 
  stats, 
  repeatOffenders = [], 
  onNavigateTab, 
  onVerifyViolation 
}) {
  if (!stats) return <div style={{ padding: '2rem' }}>Loading Admin Statistics...</div>;

  const {
    totalViolations,
    pending,
    verified,
    rejected,
    paid,
    totalFines,
    collectedFines,
    locationStats = [],
    monthlyStats = []
  } = stats;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div>
      {/* Top Banner Alert for Admin */}
      <div className="alert-banner info" style={{ marginBottom: '1.5rem' }}>
        <Shield size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>
            🔒 CAMPUS SECURITY ADMIN CONTROL PANEL
          </h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem' }}>
            Real-time enforcement metrics, DynamoDB violation records, S3 evidence review, and location analysis.
          </p>
        </div>
      </div>

      {/* Admin Stats Grid (Section 15 Mockup) */}
      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Reported</h3>
            <div className="stat-value">{totalViolations}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <AlertTriangle size={26} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Pending Review</h3>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{pending}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={26} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Verified / Approved</h3>
            <div className="stat-value" style={{ color: '#10b981' }}>{verified + paid}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={26} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Fines</h3>
            <div className="stat-value" style={{ color: '#60a5fa' }}>₹{(totalFines / 1000).toFixed(1)}K</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <DollarSign size={26} />
          </div>
        </div>
      </div>

      {/* Analytics Charts & Location Breakdown Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Monthly Violation Statistics Chart (Section 2 & 15) */}
        <div className="glass-card" style={{ margin: 0 }}>
          <div className="card-title">
            <h2>
              <TrendingUp size={20} className="text-success" /> Monthly Violation Trends
            </h2>
          </div>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="violations" radius={[6, 6, 0, 0]}>
                  {monthlyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location-wise Analysis (Section 13) */}
        <div className="glass-card" style={{ margin: 0 }}>
          <div className="card-title">
            <h2>
              <MapPin size={20} style={{ color: '#f43f5e' }} /> Location-wise Analysis
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {locationStats.slice(0, 5).map((loc, idx) => {
              const maxCount = locationStats[0]?.count || 1;
              const percentage = Math.round((loc.count / maxCount) * 100);
              return (
                <div key={loc.location}>
                  <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span>
                      <strong style={{ color: '#60a5fa', marginRight: '6px' }}>#{idx + 1}</strong>
                      {loc.location}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{loc.count} violations</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #3b82f6, #ec4899)', 
                        borderRadius: '4px' 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Repeat Offenders Panel (Section 14 & 15) */}
      <div className="glass-card">
        <div className="card-title">
          <h2>
            <AlertOctagon size={22} className="text-danger" /> Repeat Violation Offenders (3+ Offenses)
          </h2>
          <span className="badge badge-high" style={{ fontSize: '0.75rem' }}>
            AUTOMATED WARNING SYSTEM ACTIVE
          </span>
        </div>

        {repeatOffenders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <CheckCircle size={36} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
            <p>No repeat offending vehicles detected currently!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Offense Count</th>
                  <th>Total Accumulated Fine</th>
                  <th>Risk Assessment</th>
                  <th>System Warning Status</th>
                </tr>
              </thead>
              <tbody>
                {repeatOffenders.map((offender) => (
                  <tr key={offender.vehicleNumber}>
                    <td>
                      <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '1.05rem', letterSpacing: '0.05em', color: '#f87171' }}>
                        {offender.vehicleNumber}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                      {offender.count} violations
                    </td>
                    <td style={{ fontWeight: 800, color: '#fca5a5' }}>
                      ₹{offender.totalFines}
                    </td>
                    <td>
                      <span className="badge badge-high">
                        HIGH RISK - REPEAT OFFENDER
                      </span>
                    </td>
                    <td>
                      <span className="status-pill" style={{ background: '#fee2e2', color: '#dc2626' }}>
                        <span className="status-dot" style={{ background: '#dc2626' }} />
                        In-App Warning Dispatched
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
