import React from 'react';
import { Shield, Car, User, LogOut, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Header({ currentUser, onToggleRole, onOpenAuth, onLogout }) {
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand-logo">
          <div className="brand-icon">
            <Car size={22} />
          </div>
          <div>
            <span>Smart Park</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span className="brand-sub">AWS Serverless</span>
              <span className="brand-sub" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                VIT Campus
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {/* Quick Role Switcher for demonstration */}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onToggleRole}
            title="Switch between User Portal and Admin Portal"
            style={{ border: '1px solid rgba(59, 130, 246, 0.4)' }}
          >
            <RefreshCw size={14} />
            Switch to {isAdmin ? 'User Mode' : 'Admin Mode'}
          </button>

          {currentUser ? (
            <div className="user-badge">
              <div className={`user-avatar ${isAdmin ? 'admin' : ''}`}>
                {isAdmin ? <Shield size={14} /> : currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.7rem', color: isAdmin ? '#f59e0b' : '#60a5fa', textTransform: 'uppercase', fontWeight: 700 }}>
                  {currentUser.role}
                </div>
              </div>
              <button 
                onClick={onLogout} 
                className="btn btn-secondary btn-sm" 
                style={{ padding: '4px 6px', marginLeft: '6px' }}
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onOpenAuth}>
              <User size={15} /> Login / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
