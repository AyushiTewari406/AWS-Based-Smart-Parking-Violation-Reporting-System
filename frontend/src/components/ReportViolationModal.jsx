import React, { useState, useEffect } from 'react';
import { X, Upload, Camera, AlertTriangle, MapPin, Calendar, Clock, DollarSign, CheckCircle2, FileImage } from 'lucide-react';
import { VIOLATION_TYPES, LOCATIONS } from '../config/constants';
import { apiService, USE_MOCK_API } from '../services/api';

const SAMPLE_EVIDENCE_IMAGES = [
  { label: 'No Parking Sign Violation', url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800' },
  { label: 'Improper Line Parking', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800' },
  { label: 'Double Parking Block', url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800' },
  { label: 'Hostel Zone Obstruction', url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800' }
];

export default function ReportViolationModal({ 
  isOpen, 
  onClose, 
  userVehicles = [], 
  currentUser, 
  onViolationReported 
}) {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [selectedType, setSelectedType] = useState('NO_PARKING');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].slice(0, 5));
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [evidenceUrl, setEvidenceUrl] = useState(USE_MOCK_API ? SAMPLE_EVIDENCE_IMAGES[0].url : '');
  const [evidenceKey, setEvidenceKey] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repeatHint, setRepeatHint] = useState(null);

  // Set default vehicle number if user has vehicles
  useEffect(() => {
    if (userVehicles.length > 0 && !vehicleNumber) {
      setVehicleNumber(userVehicles[0].vehicleNumber);
    }
  }, [userVehicles]);

  // Dynamic calculation preview
  const currentViolationConfig = VIOLATION_TYPES.find(t => t.id === selectedType) || VIOLATION_TYPES[0];
  const { severity, fine } = apiService.classifySeverityAndFine(selectedType);

  // Live Repeat Offender check when typing vehicle number
  useEffect(() => {
    if (vehicleNumber.trim().length >= 4) {
      const res = apiService.checkRepeatOffender(vehicleNumber.trim());
      setRepeatHint(res);
    } else {
      setRepeatHint(null);
    }
  }, [vehicleNumber]);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    // Always show a local preview immediately, regardless of mode.
    const reader = new FileReader();
    reader.onloadend = () => setEvidenceUrl(reader.result);
    reader.readAsDataURL(file);

    if (!USE_MOCK_API) {
      // Real mode: actually upload the file to S3 via the backend's
      // presigned-URL flow, and keep the evidenceKey it returns — that's
      // what gets sent when the report is submitted, not the preview URL.
      try {
        const key = await apiService.uploadEvidence(file);
        setEvidenceKey(key);
      } catch (err) {
        setError(err.message || 'Evidence upload failed');
        setEvidenceKey(null);
      }
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!vehicleNumber.trim()) {
      setError('Vehicle number is required');
      return;
    }
    if (!USE_MOCK_API && !evidenceKey) {
      setError('Please upload a photo of the violation — the live backend requires real evidence, not a sample image');
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.reportViolation({
        userId: currentUser?.userId || 'U001',
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        type: selectedType,
        date,
        time,
        location,
        evidenceUrl,
        evidenceKey
      });
      onViolationReported(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit violation report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2>🚨 Report Parking Violation</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Submit details & photo evidence for verification
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="alert-banner" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Vehicle Selection / Number */}
          <div className="form-group">
            <label className="form-label">Vehicle Registration Number</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. TN01AB1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}
                required
              />
              {userVehicles.length > 0 && (
                <select
                  className="form-select"
                  style={{ width: '180px' }}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  value={userVehicles.some(v => v.vehicleNumber === vehicleNumber) ? vehicleNumber : ''}
                >
                  <option value="">My Vehicles...</option>
                  {userVehicles.map(v => (
                    <option key={v.vehicleId} value={v.vehicleNumber}>
                      {v.vehicleNumber} ({v.vehicleType})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Repeat offender alert hint */}
            {repeatHint && repeatHint.count > 0 && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: repeatHint.repeatOffender ? '#ef4444' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={14} />
                Vehicle has {repeatHint.count} previous violation(s) recorded!
                {repeatHint.repeatOffender && <strong> (REPEAT OFFENDER STATUS)</strong>}
              </div>
            )}
          </div>

          {/* Violation Type */}
          <div className="form-group">
            <label className="form-label">Violation Category</label>
            <select
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {VIOLATION_TYPES.map(t => (
                <option key={t.id} value={t.id}>
                  {t.label} (Severity: {t.severity} - Fine: ₹{t.fine})
                </option>
              ))}
            </select>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {currentViolationConfig.description}
            </p>
          </div>

          {/* Instant Severity & Fine Preview Box */}
          <div style={{ 
            background: 'rgba(15, 23, 42, 0.7)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '10px', 
            padding: '0.85rem 1rem', 
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                System Fine Assessment:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span className={`badge badge-${severity.toLowerCase()}`}>
                  {severity} SEVERITY
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Standard Penalty Applied
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calculated Fine</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fca5a5' }}>
                ₹{fine}
              </div>
            </div>
          </div>

          {/* Date & Time Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Date of Incident</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Time of Incident</label>
              <input
                type="time"
                className="form-control"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Incident Location</label>
            <select
              className="form-select"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Evidence Upload Section (Section 12 S3 evidence handling) */}
          <div className="form-group">
            <label className="form-label">Photo Evidence (S3 Cloud Storage Upload)</label>
            
            <div className="evidence-preview-box">
              {evidenceUrl ? (
                <>
                  <img src={evidenceUrl} alt="Evidence Preview" className="evidence-preview-img" />
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#60a5fa' }}>
                    {USE_MOCK_API ? 'S3 Bucket Ready: ' : evidenceKey ? 'Uploaded: ' : 'Not yet uploaded — '}
                    {USE_MOCK_API ? 'smart-parking-evidence-vit-2026-xxxxx/evidence/' : evidenceKey || 'pick a file above'}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Camera size={32} style={{ opacity: 0.6, marginBottom: '0.5rem' }} />
                  <div>Click or drop file to upload photo evidence</div>
                </div>
              )}
            </div>

            <div className="flex-gap-2" style={{ marginTop: '0.5rem' }}>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', flex: 1 }}>
                <Upload size={14} /> Upload Custom Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }}
                />
              </label>

              {/* Preset Sample Selector — mock mode only. The live backend
                  needs a real evidenceKey from an actual S3 upload, which
                  a sample stock-photo URL can't provide. */}
              {USE_MOCK_API && (
                <div style={{ flex: 1 }}>
                  <select
                    className="form-select"
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    value={SAMPLE_EVIDENCE_IMAGES.some(img => img.url === evidenceUrl) ? evidenceUrl : ''}
                  >
                    <option value="">Or Pick Sample Evidence...</option>
                    {SAMPLE_EVIDENCE_IMAGES.map((img, idx) => (
                      <option key={idx} value={img.url}>{img.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading || uploading}>
              {loading ? 'Submitting Report...' : 'Submit Violation Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
