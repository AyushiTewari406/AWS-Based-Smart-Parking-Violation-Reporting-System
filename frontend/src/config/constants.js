// This list is kept in sync with the backend's VIOLATION_RULES and
// FINE_BY_SEVERITY (backend/src/utils/constants.js). The `id` of each
// entry here is sent to the backend as `category` and must exactly match
// one of backend/src/utils/constants.js's VIOLATION_CATEGORIES, or
// POST /violations will reject it with a validation error.
export const VIOLATION_TYPES = [
  {
    id: 'NO_PARKING',
    label: 'No Parking',
    severity: 'MINOR',
    fine: 500,
    description: 'Parking in a designated no-parking area',
    icon: 'OctagonAlert'
  },
  {
    id: 'PARKING_TIME_EXCEEDED',
    label: 'Time Limit Exceeded / Overstaying',
    severity: 'MINOR',
    fine: 500,
    description: 'Exceeding the maximum permitted parking duration',
    icon: 'Clock'
  },
  {
    id: 'WRONG_PARKING',
    label: 'Wrong / Improper Parking',
    severity: 'MODERATE',
    fine: 750,
    description: 'Parking outside marked lines or taking multiple spots',
    icon: 'Maximize2'
  },
  {
    id: 'NO_PARKING_ZONE',
    label: 'No Parking Zone',
    severity: 'MODERATE',
    fine: 750,
    description: 'Parking in a zone marked off-limits for parking entirely',
    icon: 'Ban'
  },
  {
    id: 'UNAUTHORIZED_PARKING',
    label: 'Unauthorized Parking',
    severity: 'MODERATE',
    fine: 750,
    description: 'Parking in a reserved or permit-only space without authorization',
    icon: 'ShieldAlert'
  },
  {
    id: 'DISABLED_PARKING',
    label: 'Reserved Disabled Space',
    severity: 'MAJOR',
    fine: 1000,
    description: 'Parking in designated accessible parking without a valid permit',
    icon: 'Accessibility'
  },
  {
    id: 'EMERGENCY_ACCESS_BLOCK',
    label: 'Emergency Access Blocked',
    severity: 'SEVERE',
    fine: 2000,
    description: 'Parking blocking an emergency exit, fire lane, or hydrant',
    icon: 'Flame'
  }
];

// Mirrors backend FINE_BY_SEVERITY exactly — shown here for the fine
// preview in the report form; the backend always recalculates the real
// fine server-side from the category, it never trusts a client-sent value.
export const SEVERITY_RULES = {
  MINOR: { fine: 500, color: '#3b82f6', badgeClass: 'badge-low' },
  MODERATE: { fine: 750, color: '#f59e0b', badgeClass: 'badge-medium' },
  MAJOR: { fine: 1000, color: '#f97316', badgeClass: 'badge-high' },
  SEVERE: { fine: 2000, color: '#ef4444', badgeClass: 'badge-severe' }
};

// STATUS_TYPES is a frontend-only display concept: it combines the
// backend's two separate fields (status: PENDING/VERIFIED/REJECTED, and
// paymentStatus: UNPAID/PAID) into one badge. PAID here means
// status === VERIFIED && paymentStatus === PAID.
export const STATUS_TYPES = {
  PENDING: { label: 'Pending Verification', color: '#f59e0b', bg: '#fef3c7' },
  VERIFIED: { label: 'Verified / Approved', color: '#10b981', bg: '#d1fae5' },
  REJECTED: { label: 'Rejected', color: '#ef4444', bg: '#fee2e2' },
  PAID: { label: 'Fine Paid', color: '#6366f1', bg: '#e0e7ff' }
};

export const LOCATIONS = [
  'VIT Chennai - Main Gate',
  'VIT Chennai - Central Library',
  'VIT Chennai - Men\'s Hostel Block A',
  'VIT Chennai - Women\'s Hostel Block B',
  'VIT Chennai - AB1 Academic Building',
  'VIT Chennai - AB2 Science Block',
  'VIT Chennai - Sports Complex & Gym',
  'VIT Chennai - Food Court Parking'
];

// The backend requires latitude/longitude on every reported violation
// (POST /violations validates both are present), but this UI only lets a
// user pick a named campus location, not drop a GPS pin. These are
// approximate coordinates for each named spot on the VIT Chennai campus
// (base ~12.8406 N, 80.1534 E, offset per location) so the two sides can
// actually talk to each other. Swap these for real surveyed coordinates,
// or wire up navigator.geolocation, whenever that becomes a priority.
export const LOCATION_COORDS = {
  'VIT Chennai - Main Gate': { latitude: 12.8406, longitude: 80.1534 },
  'VIT Chennai - Central Library': { latitude: 12.8420, longitude: 80.1548 },
  'VIT Chennai - Men\'s Hostel Block A': { latitude: 12.8432, longitude: 80.1561 },
  'VIT Chennai - Women\'s Hostel Block B': { latitude: 12.8398, longitude: 80.1570 },
  'VIT Chennai - AB1 Academic Building': { latitude: 12.8415, longitude: 80.1540 },
  'VIT Chennai - AB2 Science Block': { latitude: 12.8409, longitude: 80.1555 },
  'VIT Chennai - Sports Complex & Gym': { latitude: 12.8441, longitude: 80.1525 },
  'VIT Chennai - Food Court Parking': { latitude: 12.8424, longitude: 80.1519 }
};

export const VEHICLE_TYPES = ['CAR', 'BIKE', 'SUV', 'TRUCK', 'SCOOTER'];
