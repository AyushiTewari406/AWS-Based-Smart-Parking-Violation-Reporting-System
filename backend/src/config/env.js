// Single place that reads process.env. Every environment variable the app
// needs is declared here with a sane default, so handlers never call
// process.env directly.

export const config = {
  region: process.env.AWS_REGION || "ap-south-1",
  tables: {
    users: process.env.USERS_TABLE || "ParkingUsers",
    vehicles: process.env.VEHICLES_TABLE || "ParkingVehicles",
    violations: process.env.VIOLATIONS_TABLE || "ParkingViolations",
    stats: process.env.STATS_TABLE || "ParkingStats",
  },
  evidenceBucket: process.env.EVIDENCE_BUCKET || "smart-parking-evidence-vit-2026-xxxxx",
  evidencePrefix: process.env.EVIDENCE_PREFIX || "evidence/",
  jwt: {
    // In AWS this comes from an environment variable set by our infrastructure
    // code, never a literal value written in source code.
    secret: process.env.JWT_SECRET,
    expiry: process.env.JWT_EXPIRY || "12h",
  },
  repeatViolation: {
    windowDays: Number(process.env.REPEAT_VIOLATION_WINDOW_DAYS) || 90,
    threshold: Number(process.env.REPEAT_VIOLATION_THRESHOLD) || 2,
  },
};
