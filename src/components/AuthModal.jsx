import React, { useState } from 'react';
import { X, User, Mail, Lock, Shield, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('rahul@gmail.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        user = await apiService.register(name, email, password, role);
      } else {
        user = await apiService.login(email, password);
      }
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (type) => {
    setError('');
    if (type === 'USER') {
      setEmail('rahul@gmail.com');
      setPassword('password123');
      setIsRegister(false);
    } else {
      setEmail('admin@vit.ac.in');
      setPassword('adminpassword');
      setIsRegister(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
          <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Demo Preset buttons for fast evaluation */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
            ⚡ QUICK DEMO CREDENTIALS:
          </div>
          <div className="flex-gap-2">
            <button 
              type="button"
              className="btn btn-secondary btn-sm" 
              onClick={() => setDemoCredentials('USER')}
              style={{ fontSize: '0.75rem', flex: 1 }}
            >
              <User size={13} /> Rahul (User)
            </button>
            <button 
              type="button"
              className="btn btn-secondary btn-sm" 
              onClick={() => setDemoCredentials('ADMIN')}
              style={{ fontSize: '0.75rem', flex: 1, borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
            >
              <Shield size={13} /> Campus Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="alert-banner" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Rahul Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="rahul@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select 
                className="form-select" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">User (Vehicle Owner / Reporter)</option>
                <option value="ADMIN">Admin (Campus Security / Verification)</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => { setIsRegister(false); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 600 }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => { setIsRegister(true); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 600 }}
              >
                Register Here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
