import React, { useState, useEffect } from 'react';
import { Users, Car, Shield, Mail, Calendar } from 'lucide-react';
import { apiService } from '../services/api';

export default function UsersDirectoryTab() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const vData = await apiService.getVehicles();
      setVehicles(vData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>👥 System Directory: Users & Registered Vehicles</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Campus registration registry stored in DynamoDB Users & Vehicles tables
          </p>
        </div>
      </div>

      <div className="glass-card">
        <div className="card-title">
          <h2>
            <Car size={20} className="text-muted" /> Registered Vehicles Database
          </h2>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Owner User ID</th>
                <th>Vehicle Plate Number</th>
                <th>Category</th>
                <th>DynamoDB Entity Key</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.vehicleId}>
                  <td style={{ fontWeight: 700, color: '#60a5fa' }}>{v.vehicleId}</td>
                  <td>{v.userId}</td>
                  <td>
                    <span style={{ fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.05em', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                      {v.vehicleNumber}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-low">{v.vehicleType}</span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    PK: VEHICLE#{v.vehicleId} | SK: USER#{v.userId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
