import { VIOLATION_TYPES } from '../config/constants';

// Configuration switch for API integration (Person 1 mock vs Person 2 API Gateway)
export const USE_MOCK_API = true;
export const API_BASE_URL = 'https://YOUR_API_GATEWAY_URL.execute-api.us-east-1.amazonaws.com/prod';

// Initial Mock Seed Data as per Section 4 Schema
const INITIAL_USERS = [
  {
    userId: 'U001',
    name: 'Rahul Kumar',
    email: 'rahul@gmail.com',
    password: 'password123',
    role: 'USER'
  },
  {
    userId: 'U002',
    name: 'Priya Sharma',
    email: 'priya@gmail.com',
    password: 'password123',
    role: 'USER'
  },
  {
    userId: 'U000',
    name: 'Campus Admin',
    email: 'admin@vit.ac.in',
    password: 'adminpassword',
    role: 'ADMIN'
  }
];

const INITIAL_VEHICLES = [
  {
    vehicleId: 'V001',
    userId: 'U001',
    vehicleNumber: 'TN01AB1234',
    vehicleType: 'CAR'
  },
  {
    vehicleId: 'V002',
    userId: 'U001',
    vehicleNumber: 'TN05CD5678',
    vehicleType: 'BIKE'
  },
  {
    vehicleId: 'V003',
    userId: 'U002',
    vehicleNumber: 'TN09EF9012',
    vehicleType: 'SUV'
  },
  {
    vehicleId: 'V004',
    userId: 'U002',
    vehicleNumber: 'KA03XY9999',
    vehicleType: 'CAR'
  }
];

const INITIAL_VIOLATIONS = [
  {
    violationId: 'VL001',
    userId: 'U001',
    vehicleNumber: 'TN01AB1234',
    type: 'NO_PARKING',
    severity: 'HIGH',
    fine: 1000,
    date: '2026-10-04',
    time: '14:30',
    location: 'VIT Chennai - Main Gate',
    evidenceUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800',
    status: 'PENDING'
  },
  {
    violationId: 'VL002',
    userId: 'U001',
    vehicleNumber: 'TN01AB1234',
    type: 'WRONG_PARKING',
    severity: 'MEDIUM',
    fine: 500,
    date: '2026-10-02',
    time: '11:15',
    location: 'VIT Chennai - Central Library',
    evidenceUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
    status: 'VERIFIED'
  },
  {
    violationId: 'VL003',
    userId: 'U001',
    vehicleNumber: 'TN01AB1234',
    type: 'DOUBLE_PARKING',
    severity: 'MEDIUM',
    fine: 500,
    date: '2026-09-28',
    time: '16:45',
    location: 'VIT Chennai - AB1 Academic Building',
    evidenceUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
    status: 'VERIFIED'
  },
  {
    violationId: 'VL004',
    userId: 'U001',
    vehicleNumber: 'TN01AB1234',
    type: 'DISABLED_ZONE',
    severity: 'HIGH',
    fine: 1000,
    date: '2026-09-20',
    time: '09:20',
    location: 'VIT Chennai - Men\'s Hostel Block A',
    evidenceUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800',
    status: 'PAID'
  },
  {
    violationId: 'VL005',
    userId: 'U002',
    vehicleNumber: 'TN09EF9012',
    type: 'FIRE_ZONE',
    severity: 'HIGH',
    fine: 1000,
    date: '2026-10-05',
    time: '08:50',
    location: 'VIT Chennai - Women\'s Hostel Block B',
    evidenceUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800',
    status: 'PENDING'
  },
  {
    violationId: 'VL006',
    userId: 'U002',
    vehicleNumber: 'KA03XY9999',
    type: 'TIME_LIMIT',
    severity: 'LOW',
    fine: 300,
    date: '2026-10-01',
    time: '18:10',
    location: 'VIT Chennai - Food Court Parking',
    evidenceUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800',
    status: 'REJECTED'
  }
];

// LocalStorage Helper methods
const getStorageItem = (key, defaultVal) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.error('LocalStorage error', e);
    return defaultVal;
  }
};

const setStorageItem = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage set error', e);
  }
};

// Initialize Storage if empty
if (!localStorage.getItem('sp_users')) setStorageItem('sp_users', INITIAL_USERS);
if (!localStorage.getItem('sp_vehicles')) setStorageItem('sp_vehicles', INITIAL_VEHICLES);
if (!localStorage.getItem('sp_violations')) setStorageItem('sp_violations', INITIAL_VIOLATIONS);

// API Service Implementation
export const apiService = {
  // Business Logic Helpers (Matches Backend Rules in Section 6 & 14)
  classifySeverityAndFine(violationTypeId) {
    const match = VIOLATION_TYPES.find(t => t.id === violationTypeId);
    if (!match) return { severity: 'LOW', fine: 300 };
    return { severity: match.severity, fine: match.fine };
  },

  checkRepeatOffender(vehicleNumber) {
    const violations = getStorageItem('sp_violations', []);
    // Count previous violations for this vehicle
    const vehicleViolations = violations.filter(
      v => v.vehicleNumber.toUpperCase() === vehicleNumber.toUpperCase()
    );
    const count = vehicleViolations.length;
    return {
      repeatOffender: count >= 3,
      count: count,
      warning: count >= 3 ? `Vehicle ${vehicleNumber} has ${count} reported violations (Repeat Offender Warning!)` : null
    };
  },

  // User & Authentication APIs
  async login(email, password) {
    if (!USE_MOCK_API) {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return res.json();
    }
    
    const users = getStorageItem('sp_users', []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const { password: _, ...userData } = user;
    return userData;
  },

  async register(name, email, password, role = 'USER') {
    if (!USE_MOCK_API) {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      return res.json();
    }

    const users = getStorageItem('sp_users', []);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }

    const newUser = {
      userId: `U${String(users.length + 1).padStart(3, '0')}`,
      name,
      email,
      password,
      role
    };

    users.push(newUser);
    setStorageItem('sp_users', users);
    const { password: _, ...userData } = newUser;
    return userData;
  },

  // Vehicles APIs
  async getVehicles(userId) {
    if (!USE_MOCK_API) {
      const res = await fetch(`${API_BASE_URL}/vehicles/${userId}`);
      return res.json();
    }
    const vehicles = getStorageItem('sp_vehicles', []);
    if (userId) {
      return vehicles.filter(v => v.userId === userId);
    }
    return vehicles;
  },

  async addVehicle(userId, vehicleNumber, vehicleType) {
    if (!USE_MOCK_API) {
      const res = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, vehicleNumber, vehicleType })
      });
      return res.json();
    }

    const vehicles = getStorageItem('sp_vehicles', []);
    const cleanNum = vehicleNumber.toUpperCase().replace(/\s+/g, '');
    
    // Check if vehicle already exists
    const existing = vehicles.find(v => v.vehicleNumber === cleanNum);
    if (existing) {
      throw new Error(`Vehicle ${cleanNum} is already registered in the system`);
    }

    const newVehicle = {
      vehicleId: `V${String(vehicles.length + 1).padStart(3, '0')}`,
      userId,
      vehicleNumber: cleanNum,
      vehicleType
    };

    vehicles.push(newVehicle);
    setStorageItem('sp_vehicles', vehicles);
    return newVehicle;
  },

  // Violation APIs
  async getViolations(userId = null, role = 'USER') {
    if (!USE_MOCK_API) {
      const url = role === 'ADMIN' ? `${API_BASE_URL}/admin/violations` : `${API_BASE_URL}/violations/${userId}`;
      const res = await fetch(url);
      return res.json();
    }

    const violations = getStorageItem('sp_violations', []);
    if (role === 'ADMIN' || !userId) {
      return violations;
    }
    
    // User role: Return violations for user's vehicles or violations reported by user
    const userVehicles = (await this.getVehicles(userId)).map(v => v.vehicleNumber);
    return violations.filter(v => v.userId === userId || userVehicles.includes(v.vehicleNumber));
  },

  async reportViolation(data) {
    const { userId, vehicleNumber, type, date, time, location, evidenceUrl } = data;
    const cleanNum = vehicleNumber.toUpperCase().replace(/\s+/g, '');

    // Business Logic calculation
    const { severity, fine } = this.classifySeverityAndFine(type);
    const repeatInfo = this.checkRepeatOffender(cleanNum);

    if (!USE_MOCK_API) {
      const res = await fetch(`${API_BASE_URL}/violations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          vehicleNumber: cleanNum,
          type,
          severity,
          fine,
          date,
          time,
          location,
          evidenceUrl
        })
      });
      return res.json();
    }

    const violations = getStorageItem('sp_violations', []);
    const newViolation = {
      violationId: `VL${String(violations.length + 1).padStart(3, '0')}`,
      userId: userId || 'U001',
      vehicleNumber: cleanNum,
      type,
      severity,
      fine,
      date: date || new Date().toISOString().split('T')[0],
      time: time || new Date().toTimeString().split(' ')[0].slice(0, 5),
      location,
      evidenceUrl: evidenceUrl || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800',
      status: 'PENDING',
      repeatOffender: repeatInfo.repeatOffender,
      warning: repeatInfo.warning
    };

    violations.unshift(newViolation); // add to top
    setStorageItem('sp_violations', violations);
    return newViolation;
  },

  async updateViolationStatus(violationId, newStatus) {
    if (!USE_MOCK_API) {
      const res = await fetch(`${API_BASE_URL}/violation/${violationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      return res.json();
    }

    const violations = getStorageItem('sp_violations', []);
    const index = violations.findIndex(v => v.violationId === violationId);
    if (index === -1) throw new Error('Violation not found');

    violations[index].status = newStatus;
    setStorageItem('sp_violations', violations);
    return violations[index];
  },

  // Analytics & Admin Dashboard APIs
  async getAdminStatistics() {
    if (!USE_MOCK_API) {
      const res = await fetch(`${API_BASE_URL}/admin/statistics`);
      return res.json();
    }

    const violations = getStorageItem('sp_violations', []);
    const totalViolations = violations.length;
    const pending = violations.filter(v => v.status === 'PENDING').length;
    const verified = violations.filter(v => v.status === 'VERIFIED').length;
    const rejected = violations.filter(v => v.status === 'REJECTED').length;
    const paid = violations.filter(v => v.status === 'PAID').length;
    const totalFines = violations.reduce((acc, v) => acc + (v.status !== 'REJECTED' ? v.fine : 0), 0);
    const collectedFines = violations.reduce((acc, v) => acc + (v.status === 'PAID' ? v.fine : 0), 0);

    // Location breakdown (Section 13)
    const locationMap = {};
    violations.forEach(v => {
      const loc = v.location || 'Unknown';
      locationMap[loc] = (locationMap[loc] || 0) + 1;
    });

    const locationStats = Object.keys(locationMap).map(loc => ({
      location: loc.replace('VIT Chennai - ', ''),
      fullLocation: loc,
      count: locationMap[loc]
    })).sort((a, b) => b.count - a.count);

    // Monthly breakdown
    const monthlyMap = {
      'Jul': 8,
      'Aug': 15,
      'Sep': 22,
      'Oct': violations.length
    };
    const monthlyStats = Object.keys(monthlyMap).map(m => ({
      month: m,
      violations: monthlyMap[m]
    }));

    return {
      totalViolations,
      pending,
      verified,
      rejected,
      paid,
      totalFines,
      collectedFines,
      locationStats,
      monthlyStats
    };
  },

  async getRepeatOffenders() {
    if (!USE_MOCK_API) {
      const res = await fetch(`${API_BASE_URL}/admin/repeat-offenders`);
      return res.json();
    }

    const violations = getStorageItem('sp_violations', []);
    const vehicleMap = {};

    violations.forEach(v => {
      if (!vehicleMap[v.vehicleNumber]) {
        vehicleMap[v.vehicleNumber] = {
          vehicleNumber: v.vehicleNumber,
          count: 0,
          totalFines: 0,
          userId: v.userId,
          violations: []
        };
      }
      vehicleMap[v.vehicleNumber].count += 1;
      vehicleMap[v.vehicleNumber].totalFines += v.fine;
      vehicleMap[v.vehicleNumber].violations.push(v);
    });

    return Object.values(vehicleMap)
      .filter(v => v.count >= 2) // vehicles with 2 or more violations
      .sort((a, b) => b.count - a.count);
  }
};
