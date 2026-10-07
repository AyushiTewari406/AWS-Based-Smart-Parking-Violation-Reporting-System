// Single source of truth for every Lambda + API Gateway route in this
// project. The CDK stack loops over this array instead of repeating
// near-identical boilerplate 21 times. "access" entries control which
// least-privilege IAM grants each function gets — a function only
// receives the grants it actually needs, never a blanket admin role.

export const routes = [
  // ---- auth / users ----
  { name: "RegisterUser", file: "src/handlers/users/register.js", method: "POST", path: "/users/register", access: { users: "readwrite" } },
  { name: "LoginUser", file: "src/handlers/users/login.js", method: "POST", path: "/users/login", access: { users: "read" } },
  { name: "GetMe", file: "src/handlers/users/getMe.js", method: "GET", path: "/users/me", access: { users: "read" } },
  { name: "UpdateMe", file: "src/handlers/users/updateMe.js", method: "PUT", path: "/users/me", access: { users: "readwrite" } },

  // ---- vehicles ----
  { name: "CreateVehicle", file: "src/handlers/vehicles/createVehicle.js", method: "POST", path: "/vehicles", access: { vehicles: "readwrite" } },
  { name: "ListMyVehicles", file: "src/handlers/vehicles/listMyVehicles.js", method: "GET", path: "/vehicles", access: { vehicles: "read" } },
  { name: "GetVehicle", file: "src/handlers/vehicles/getVehicle.js", method: "GET", path: "/vehicles/{vehicleId}", access: { vehicles: "read" } },
  { name: "UpdateVehicle", file: "src/handlers/vehicles/updateVehicle.js", method: "PUT", path: "/vehicles/{vehicleId}", access: { vehicles: "readwrite" } },
  { name: "DeleteVehicle", file: "src/handlers/vehicles/deleteVehicle.js", method: "DELETE", path: "/vehicles/{vehicleId}", access: { vehicles: "readwrite" } },

  // ---- violations ----
  { name: "CreateViolation", file: "src/handlers/violations/createViolation.js", method: "POST", path: "/violations", access: { violations: "readwrite", vehicles: "read" } },
  { name: "GetViolation", file: "src/handlers/violations/getViolation.js", method: "GET", path: "/violations/{violationId}", access: { violations: "read" } },
  { name: "GetVehicleViolations", file: "src/handlers/violations/getVehicleViolations.js", method: "GET", path: "/vehicles/{vehicleId}/violations", access: { violations: "read", vehicles: "read" } },
  { name: "GetEvidenceUrl", file: "src/handlers/violations/getEvidenceUrl.js", method: "GET", path: "/violations/{violationId}/evidence-url", access: { violations: "read", s3: "get" } },
  { name: "PayFine", file: "src/handlers/violations/payFine.js", method: "POST", path: "/violations/{violationId}/pay", access: { violations: "readwrite", vehicles: "read" } },

  // ---- uploads ----
  { name: "GetUploadUrl", file: "src/handlers/uploads/getUploadUrl.js", method: "POST", path: "/uploads/evidence-url", access: { s3: "put" } },

  // ---- admin ----
  { name: "ListPendingViolations", file: "src/handlers/admin/listPendingViolations.js", method: "GET", path: "/admin/violations/pending", access: { violations: "read" } },
  { name: "VerifyViolation", file: "src/handlers/admin/verifyViolation.js", method: "POST", path: "/admin/violations/{violationId}/verify", access: { violations: "readwrite" } },
  { name: "RejectViolation", file: "src/handlers/admin/rejectViolation.js", method: "POST", path: "/admin/violations/{violationId}/reject", access: { violations: "readwrite" } },
  { name: "GetDashboardStats", file: "src/handlers/admin/getDashboardStats.js", method: "GET", path: "/admin/dashboard", access: { violations: "read", users: "read", vehicles: "read" } },
  { name: "RepeatOffenders", file: "src/handlers/admin/repeatOffenders.js", method: "GET", path: "/admin/repeat-offenders", access: { violations: "read" } },

  // ---- reports ----
  { name: "LocationWiseReport", file: "src/handlers/reports/locationWiseReport.js", method: "GET", path: "/reports/location-wise", access: { violations: "read" } },
  { name: "MonthlyStatsReport", file: "src/handlers/reports/monthlyStatsReport.js", method: "GET", path: "/reports/monthly-stats", access: { violations: "read" } },
];
