import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import UserDashboard from './components/UserDashboard';
import VehiclesTab from './components/VehiclesTab';
import ViolationHistoryTab from './components/ViolationHistoryTab';
import VehicleReportTab from './components/VehicleReportTab';
import ReportViolationModal from './components/ReportViolationModal';
import AdminDashboard from './components/AdminDashboard';
import AdminViolationManager from './components/AdminViolationManager';
import UsersDirectoryTab from './components/UsersDirectoryTab';
import { apiService, USE_MOCK_API } from './services/api';

import { 
  LayoutDashboard, Car, AlertTriangle, FileText, 
  ShieldAlert, Shield, Users, BarChart3, PlusCircle, CheckCircle2 
} from 'lucide-react';

export default function App() {
  // Authentication & Role state
  const [currentUser, setCurrentUser] = useState({
    userId: 'U001',
    name: 'Rahul Kumar',
    email: 'rahul@gmail.com',
    role: 'USER'
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Application Data state
  const [vehicles, setVehicles] = useState([]);
  const [violations, setViolations] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [repeatOffenders, setRepeatOffenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Sync tab on role switch
  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('dashboard');
    }
  }, [currentUser?.role]);

  // Load state on mount & user change
  useEffect(() => {
    loadAppData();
  }, [currentUser]);

  const loadAppData = async () => {
    setLoading(true);
    try {
      if (currentUser?.role === 'ADMIN') {
        const [allV, stats, repeat] = await Promise.all([
          apiService.getViolations(null, 'ADMIN'),
          apiService.getAdminStatistics(),
          apiService.getRepeatOffenders()
        ]);
        setViolations(allV);
        setAdminStats(stats);
        setRepeatOffenders(repeat);
      } else {
        const [userVeh, userViol] = await Promise.all([
          apiService.getVehicles(currentUser?.userId),
          apiService.getViolations(currentUser?.userId, 'USER')
        ]);
        setVehicles(userVeh);
        setViolations(userViol);
      }
    } catch (err) {
      console.error('Error loading app data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Toggle user role between USER and ADMIN for live demonstration
  const handleToggleRole = () => {
    if (currentUser?.role === 'ADMIN') {
      setCurrentUser({
        userId: 'U001',
        name: 'Rahul Kumar',
        email: 'rahul@gmail.com',
        role: 'USER'
      });
      showToast('Switched to User Mode (Rahul Kumar)');
    } else {
      setCurrentUser({
        userId: 'U000',
        name: 'Campus Admin',
        email: 'admin@vit.ac.in',
        role: 'ADMIN'
      });
      showToast('Switched to Admin Control Mode', 'info');
    }
  };

  const handleViolationReported = (newViolation) => {
    showToast(`Violation reported successfully! ID: ${newViolation.violationId}`);
    loadAppData();
  };

  const handleViolationUpdated = (updated) => {
    showToast(`Violation ${updated.violationId} status updated to ${updated.status}`);
    loadAppData();
  };

  const handleVehicleAdded = (newVehicle) => {
    showToast(`Vehicle ${newVehicle.vehicleNumber} registered successfully!`);
    loadAppData();
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="app-container">
      <Header 
        currentUser={currentUser}
        onToggleRole={handleToggleRole}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 200,
          background: notification.type === 'info' ? '#2563eb' : '#10b981',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} />
          {notification.msg}
        </div>
      )}

      <main className="main-wrapper">
        {/* Navigation Tabs Bar */}
        <div className="nav-tabs">
          {!isAdmin ? (
            <>
              <button 
                className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={18} /> User Dashboard
              </button>
              <button 
                className={`tab-btn ${activeTab === 'vehicles' ? 'active' : ''}`}
                onClick={() => setActiveTab('vehicles')}
              >
                <Car size={18} /> Registered Vehicles ({vehicles.length})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <AlertTriangle size={18} /> Violation History ({violations.length})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                <BarChart3 size={18} /> Vehicle Reports
              </button>
            </>
          ) : (
            <>
              <button 
                className={`tab-btn ${activeTab === 'admin-dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin-dashboard')}
              >
                <Shield size={18} /> Admin Overview
              </button>
              <button 
                className={`tab-btn ${activeTab === 'admin-violations' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin-violations')}
              >
                <ShieldAlert size={18} /> Verify Violations ({violations.filter(v => v.status === 'PENDING').length} Pending)
              </button>
              <button 
                className={`tab-btn ${activeTab === 'admin-users' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin-users')}
              >
                <Users size={18} /> Users & Vehicles DB
              </button>
            </>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Mode: <strong style={{ color: '#60a5fa' }}>{USE_MOCK_API ? 'Person 1 Mock API' : 'AWS API Gateway'}</strong>
            </span>
          </div>
        </div>

        {/* Tab View Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            Loading Parking System Data...
          </div>
        ) : (
          <>
            {/* USER VIEWS */}
            {!isAdmin && activeTab === 'dashboard' && (
              <UserDashboard 
                vehicles={vehicles}
                violations={violations}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onViewViolation={(v) => setActiveTab('history')}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {!isAdmin && activeTab === 'vehicles' && (
              <VehiclesTab 
                vehicles={vehicles}
                violations={violations}
                currentUser={currentUser}
                onVehicleAdded={handleVehicleAdded}
                onOpenReportForVehicle={(vNum) => {
                  setIsReportModalOpen(true);
                }}
              />
            )}

            {!isAdmin && activeTab === 'history' && (
              <ViolationHistoryTab 
                violations={violations}
                onViolationUpdated={handleViolationUpdated}
              />
            )}

            {!isAdmin && activeTab === 'reports' && (
              <VehicleReportTab 
                violations={violations}
                vehicles={vehicles}
              />
            )}

            {/* ADMIN VIEWS */}
            {isAdmin && activeTab === 'admin-dashboard' && (
              <AdminDashboard 
                stats={adminStats}
                repeatOffenders={repeatOffenders}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {isAdmin && activeTab === 'admin-violations' && (
              <AdminViolationManager 
                violations={violations}
                onViolationUpdated={handleViolationUpdated}
              />
            )}

            {isAdmin && activeTab === 'admin-users' && (
              <UsersDirectoryTab />
            )}
          </>
        )}
      </main>

      {/* Floating CTA for Reporting Violation */}
      {!isAdmin && (
        <button 
          onClick={() => setIsReportModalOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 90,
            borderRadius: '50px',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontFamily: 'Outfit, sans-serif'
          }}
        >
          <PlusCircle size={20} /> Report Parking Violation
        </button>
      )}

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name}!`);
        }}
      />

      <ReportViolationModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userVehicles={vehicles}
        currentUser={currentUser}
        onViolationReported={handleViolationReported}
      />
    </div>
  );
}
