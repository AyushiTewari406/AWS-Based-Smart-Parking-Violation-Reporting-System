import React, { useState } from 'react';
import { Car, Plus, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { VEHICLE_TYPES } from '../config/constants';
import { apiService } from '../services/api';

export default function VehiclesTab({ 
  vehicles = [], 
  violations = [], 
  currentUser, 
  onVehicleAdded,
  onOpenReportForVehicle 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('CAR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setError('');

    if (!vehicleNumber.trim()) {
      setError('Please enter a vehicle registration number');
      return;
    }

    setLoading(true);
    try {
      const newVehicle = await apiService.addVehicle(
        currentUser?.userId || 'U001',
        vehicleNumber.trim(),
        vehicleType
      );
      onVehicleAdded(newVehicle);
      setVehicleNumber('');
      setShowAddForm(false);
    } catch (err) {
      setError(err.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>🚗 Registered Vehicles</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage your registered campus vehicles and monitor their infraction history
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => { setShowAddForm(!showAddForm); setError(''); }}
        >
          <Plus size={16} /> {showAddForm ? 'Close Form' : 'Register New Vehicle'}
        </button>
      </div>

      {/* Add Vehicle Form Modal/Card */}
      {showAddForm && (
        <div className="glass-card" style={{ border: '1px solid var(--border-glow)' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Register New Vehicle</h3>
          {error && (
            <div className="alert-banner" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleAddVehicle}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Vehicle Registration Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. TN01AB1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Vehicle Category</label>
                <select
                  className="form-select"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  {VEHICLE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Save Vehicle'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicle Grid List */}
      {vehicles.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Car size={48} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', opacity: 0.6 }} />
          <h3 style={{ color: 'var(--text-muted)' }}>No Vehicles Registered Yet</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Click "Register New Vehicle" above to link your vehicle to your account.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {vehicles.map((v) => {
            const vehicleViolations = violations.filter(
              viol => viol.vehicleNumber.toUpperCase() === v.vehicleNumber.toUpperCase()
            );
            const vCount = vehicleViolations.length;
            const isRepeat = vCount >= 3;

            return (
              <div key={v.vehicleId} className="glass-card" style={{ margin: 0, position: 'relative' }}>
                {isRepeat && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '-10px', 
                    right: '12px', 
                    background: '#ef4444', 
                    color: 'white', 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    padding: '2px 10px', 
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                  }}>
                    REPEAT OFFENDER
                  </div>
                )}

                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: '10px', 
                      background: 'rgba(59, 130, 246, 0.15)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#60a5fa'
                    }}>
                      <Car size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '0.05em' }}>
                        {v.vehicleNumber}
                      </h3>
                      <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>
                        {v.vehicleType}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.5)', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  fontSize: '0.85rem'
                }}>
                  <div className="flex-between" style={{ marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Recorded Infractions:</span>
                    <span style={{ fontWeight: 700, color: vCount > 0 ? (isRepeat ? '#ef4444' : '#f59e0b') : '#10b981' }}>
                      {vCount} violation{vCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-muted)' }}>Total Fines:</span>
                    <span style={{ fontWeight: 800, color: '#fca5a5' }}>
                      ₹{vehicleViolations.reduce((acc, viol) => acc + (viol.status !== 'REJECTED' ? viol.fine : 0), 0)}
                    </span>
                  </div>
                </div>

                <button 
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => onOpenReportForVehicle(v.vehicleNumber)}
                >
                  <AlertTriangle size={14} className="text-warning" /> Report Violation for this Vehicle
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
