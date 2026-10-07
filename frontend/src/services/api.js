import { VIOLATION_TYPES, LOCATION_COORDS } from '../config/constants';

// Configuration switch for API integration (Person 1 mock vs Person 2 API Gateway)
//
// USE_MOCK_API = true  -> everything below reads/writes browser localStorage.
// USE_MOCK_API = false -> everything below calls the real backend at
//                         API_BASE_URL (see backend/infrastructure/README.md
//                         for how to get that URL after `cdk deploy`).
//
// IMPORTANT: only flip this to false once the backend has actually been
// deployed (cdk deploy) AND the DynamoDB GSIs it depends on have been
// added to the existing tables (see backend docs, Section 7.5) — otherwise
// every real-mode call below will fail.
export const USE_MOCK_API = true;
export const API_BASE_URL = 'https://YOUR_API_GATEWAY_URL.execute-api.ap-south-1.amazonaws.com/prod';

// ============================================================
// Real-backend adapter: auth token storage + a shared fetch wrapper that
// speaks the backend's actual contract (see backend/src/utils/responses.js):
// every response is { success: true, data } or { success: false, message }.
// ============================================================
const TOKEN_KEY = 'sp_auth_token';

function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* ignore - storage may be unavailable */ }
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  let body = null;
  try { body = await res.json(); } catch { /* no/invalid JSON body */ }

  if (!res.ok || !body || body.success === false) {
    throw new Error(body?.message || `Request failed (HTTP ${res.status})`);
  }
  return body.data;
}

// Finds the nearest named LOCATIONS entry for a lat/lng pair, since the
// backend stores coordinates but the UI displays a named campus spot.
// Simple nearest-neighbor — fine at campus scale (a handful of fixed spots).
function nearestLocationName(latitude, longitude) {
  if (latitude === undefined || longitude === undefined) return 'Unknown location';
  let best = null;
  let bestDist = Infinity;
  for (const [name, coord] of Object.entries(LOCATION_COORDS)) {
    const d = (coord.latitude - latitude) ** 2 + (coord.longitude - longitude) ** 2;
    if (d < bestDist) { bestDist = d; best = name; }
  }
  return best || 'Unknown location';
}

// Converts one backend violation record into the shape every component in
// this app already expects (the same shape the mock data uses), so no
// component needs to know whether it's looking at mock or real data.
function mapViolationFromBackend(v) {
  const createdAt = v.createdAt ? new Date(v.createdAt) : new Date();
  return {
    violationId: v.violationId,
    vehicleId: v.vehicleId,
    userId: v.reportedBy,
    vehicleNumber: v.vehicleNumber,
    type: v.category,
    severity: v.severity,
    fine: v.fine,
    date: createdAt.toISOString().split('T')[0],
    time: createdAt.toTimeString().split(' ')[0].slice(0, 5),
    location: nearestLocationName(v.latitude, v.longitude),
    latitude: v.latitude,
    longitude: v.longitude,
    evidenceKey: v.evidenceKey || null,
    // evidenceUrl is intentionally left unset here — it requires a
    // separate, short-lived presigned GET call (apiService.getEvidenceUrl),
    // since the S3 bucket is private. Components resolve it on demand.
    evidenceUrl: null,
    // The mock data models "PAID" as a 4th status value; the real backend
    // keeps them as two separate fields (status + paymentStatus). This
    // flattens it back to the single value every component already reads.
    status: v.paymentStatus === 'PAID' ? 'PAID' : v.status,
    repeatOffender: !!v.isRepeatOffender,
    warning: v.isRepeatOffender
      ? `Vehicle ${v.vehicleNumber} has been flagged as a repeat offender`
      : null,
  };
}

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
    severity: 'MINOR',
    fine: 500,
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
    severity: 'MODERATE',
    fine: 750,
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
    type: 'UNAUTHORIZED_PARKING',
    severity: 'MODERATE',
    fine: 750,
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
    type: 'DISABLED_PARKING',
    severity: 'MAJOR',
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
    type: 'EMERGENCY_ACCESS_BLOCK',
    severity: 'SEVERE',
    fine: 2000,
    date: '2026-10-05',
    time: '08:50',
    location: 'VIT Chennai - Women\'s Hostel Block B',
    evidenceUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800',
    status: 'PENDING'
  },
  {
    violationId: 'VL006',
    userId: 'U002',
    vehicleNumber: 'KA03XY9999',
    type: 'PARKING_TIME_EXCEEDED',
    severity: 'MINOR',
    fine: 500,
    date: '2026-10-01',
    time: '18:10',
    location: 'VIT Chennai - Food Court Parking',
    evidenceUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
    status: 'REJECTED'
  }
];

function getStorageItem(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

if (!localStorage.getItem('sp_users')) setStorageItem('sp_users', INITIAL_USERS);
if (!localStorage.getItem('sp_vehicles')) setStorageItem('sp_vehicles', INITIAL_VEHICLES);
if (!localStorage.getItem('sp_violations')) setStorageItem('sp_violations', INITIAL_VIOLATIONS);

// API Service Implementation
export const apiService = {
  // Business Logic Helpers (Matches Backend Rules in Section 6 & 14)
  // Only used in mock mode for the instant fine preview in the report
  // form — in real mode the backend always recalculates the fine itself
  // from the category and never trusts a client-sent value.
  classifySeverityAndFine(violationTypeId) {
    const match = VIOLATION_TYPES.find(t => t.id === violationTypeId);
    if (!match) return { severity: 'MINOR', fine: 500 };
    return { severity: match.severity, fine: match.fine };
  },

  checkRepeatOffender(vehicleNumber) {
    const violations = getStorageItem('sp_violations', []);
    const vehicleViolations = violations.filter(
      v => v.vehicleNumber.toUpperCase() === vehicleNumber.toUpperCase()
    );
    const count = vehicleViolations.length;
    return {
      repeatOffender: count >= 3,
      count,
      warning: count >= 3 ? `Vehicle ${vehicleNumber} has ${count} reported violations (Repeat Offender Warning!)` : null
    };
  },

  // User & Authentication APIs
  async login(email, password) {
    if (!USE_MOCK_API) {
      const { user, token } = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(token);
      return user;
    }

    const users = getStorageItem('sp_users', []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const { password: _, ...userData } = user;
    return userData;
  },

  async register(name, email, phone, password, role = 'USER') {
    if (!USE_MOCK_API) {
      const { user, token } = await apiFetch('/users/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, password }),
      });
      setToken(token);
      // Note: the real backend always creates a USER account — there is
      // no self-service admin signup. The `role` argument is honored only
      // in mock mode; a real registration ignores it.
      return user;
    }

    const users = getStorageItem('sp_users', []);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }

    const newUser = {
      userId: `U${String(users.length + 1).padStart(3, '0')}`,
      name,
      email,
      phone,
      password,
      role
    };

    users.push(newUser);
    setStorageItem('sp_users', users);
    const { password: _, ...userData } = newUser;
    return userData;
  },

  logout() {
    setToken(null);
  },

  // Vehicles APIs
  async getVehicles(userId) {
    if (!USE_MOCK_API) {
      // The real endpoint identifies the user from the JWT, not a path
      // parameter — it always returns "my vehicles".
      return apiFetch('/vehicles');
    }
    const vehicles = getStorageItem('sp_vehicles', []);
    if (userId) {
      return vehicles.filter(v => v.userId === userId);
    }
    return vehicles;
  },

  async addVehicle(userId, vehicleNumber, vehicleType) {
    if (!USE_MOCK_API) {
      return apiFetch('/vehicles', {
        method: 'POST',
        body: JSON.stringify({ vehicleNumber: vehicleNumber.toUpperCase().replace(/\s+/g, ''), vehicleType }),
      });
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
      if (role === 'ADMIN') {
        // The real backend only exposes a "pending review queue" list for
        // admins (GET /admin/violations/pending) — there is no endpoint
        // that lists violations of every status at once. This is enough
        // for the Verify Violations tab; the Admin Overview tab's totals
        // come from getAdminStatistics() instead, which does cover all
        // statuses (via /admin/dashboard).
        const pending = await apiFetch('/admin/violations/pending');
        return pending.map(mapViolationFromBackend);
      }
      // No "all violations for this user" endpoint either — compose it
      // from the user's vehicles plus each vehicle's violation history.
      const vehicles = await apiFetch('/vehicles');
      const perVehicle = await Promise.all(
        vehicles.map(v => apiFetch(`/vehicles/${v.vehicleId}/violations`))
      );
      return perVehicle.flat().map(mapViolationFromBackend);
    }

    const violations = getStorageItem('sp_violations', []);
    if (role === 'ADMIN' || !userId) {
      return violations;
    }

    // User role: Return violations for user's vehicles or violations reported by user
    const userVehicles = (await this.getVehicles(userId)).map(v => v.vehicleNumber);
    return violations.filter(v => v.userId === userId || userVehicles.includes(v.vehicleNumber));
  },

  // Real-mode only: uploads a File to S3 via the backend's two-step
  // presigned-URL flow (POST /uploads/evidence-url, then a direct PUT to
  // S3) and returns the evidenceKey to attach to the violation report.
  async uploadEvidence(file) {
    if (USE_MOCK_API) {
      throw new Error('uploadEvidence() is only used in real-API mode');
    }
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const { uploadUrl, evidenceKey } = await apiFetch('/uploads/evidence-url', {
      method: 'POST',
      body: JSON.stringify({ fileExtension: ext }),
    });

    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!putRes.ok) {
      throw new Error('Evidence photo upload to S3 failed');
    }
    return evidenceKey;
  },

  // Real-mode only: resolves a short-lived viewable URL for an evidence
  // photo already attached to a violation (the bucket is private, so the
  // key alone can't be used as an <img src>).
  async getEvidenceUrl(violationId) {
    if (USE_MOCK_API) {
      throw new Error('getEvidenceUrl() is only used in real-API mode');
    }
    const { evidenceUrl } = await apiFetch(`/violations/${violationId}/evidence-url`);
    return evidenceUrl;
  },

  async reportViolation(data) {
    const { userId, vehicleNumber, type, date, time, location, evidenceUrl, evidenceKey } = data;
    const cleanNum = vehicleNumber.toUpperCase().replace(/\s+/g, '');

    // Business Logic calculation (mock-mode / preview only — the real
    // backend always recalculates this itself from the category)
    const { severity, fine } = this.classifySeverityAndFine(type);
    const repeatInfo = this.checkRepeatOffender(cleanNum);

    if (!USE_MOCK_API) {
      const coords = LOCATION_COORDS[location] || {};
      const created = await apiFetch('/violations', {
        method: 'POST',
        body: JSON.stringify({
          vehicleNumber: cleanNum,
          category: type,
          latitude: coords.latitude,
          longitude: coords.longitude,
          evidenceKey: evidenceKey || null,
        }),
      });
      return mapViolationFromBackend(created);
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
      // The real backend has three separate, single-purpose endpoints
      // instead of one generic "set status" call.
      let updated;
      if (newStatus === 'VERIFIED') {
        updated = await apiFetch(`/admin/violations/${violationId}/verify`, { method: 'POST' });
      } else if (newStatus === 'REJECTED') {
        updated = await apiFetch(`/admin/violations/${violationId}/reject`, { method: 'POST' });
      } else if (newStatus === 'PAID') {
        updated = await apiFetch(`/violations/${violationId}/pay`, { method: 'POST' });
      } else {
        throw new Error(`Unsupported status transition: ${newStatus}`);
      }
      return mapViolationFromBackend(updated);
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
      // The real backend splits this across three endpoints: overall
      // totals (/admin/dashboard) and the two aggregate reports
      // (/reports/location-wise, /reports/monthly-stats). Fetch all
      // three in parallel and reshape into what AdminDashboard.jsx expects.
      const [dashboard, locationReport, monthlyReport] = await Promise.all([
        apiFetch('/admin/dashboard'),
        apiFetch('/reports/location-wise'),
        (async () => {
          const now = new Date();
          try {
            return await apiFetch(`/reports/monthly-stats?year=${now.getUTCFullYear()}&month=${now.getUTCMonth() + 1}`);
          } catch {
            return null; // no violations this month yet is not an error the UI needs to show
          }
        })(),
      ]);

      const locationStats = locationReport.map(entry => ({
        location: nearestLocationName(
          Number(entry.location.split(',')[0]),
          Number(entry.location.split(',')[1])
        ).replace('VIT Chennai - ', ''),
        fullLocation: entry.location,
        count: entry.count,
      }));

      return {
        totalViolations: dashboard.violations.total,
        pending: dashboard.violations.pending,
        verified: dashboard.violations.verified,
        rejected: dashboard.violations.rejected,
        // paid: not separately exposed by /admin/dashboard today — the
        // PAID count would need its own aggregation (paymentStatus is
        // only tracked per violation, not summarized by the backend).
        totalFines: dashboard.totalFinesCollected,
        collectedFines: dashboard.totalFinesCollected,
        totalUsers: dashboard.totalUsers,
        totalVehicles: dashboard.totalVehicles,
        repeatOffenderCount: dashboard.repeatOffenderCount,
        locationStats,
        // The backend only reports one month at a time (query params
        // year/month), so this chart only has real data for the current
        // month until the admin UI is extended to request a range.
        monthlyStats: monthlyReport
          ? [{ month: new Date(monthlyReport.year, monthlyReport.month - 1).toLocaleString('en-US', { month: 'short' }), violations: monthlyReport.totalViolations }]
          : [],
      };
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
      const report = await apiFetch('/admin/repeat-offenders');
      return report.map(entry => ({
        vehicleNumber: entry.vehicleNumber,
        count: entry.count,
        totalFines: entry.totalFines,
        userId: undefined, // not returned by this endpoint
        violations: [],
      }));
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
