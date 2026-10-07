import { getViolationsByVehicle } from "../../repositories/violationRepository.js";
import { config } from "../../config/env.js";
import { VIOLATION_STATUS } from "../../utils/constants.js";

export async function checkRepeatViolation(vehicleId) {
  const allViolations = await getViolationsByVehicle(vehicleId);

  const windowMs = config.repeatViolation.windowDays * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - windowMs;

  const recentVerified = allViolations.filter((v) => {
    const isVerified = v.status === VIOLATION_STATUS.VERIFIED;
    const isRecent = new Date(v.createdAt).getTime() >= cutoff;
    return isVerified && isRecent;
  });

  const isRepeatOffender = recentVerified.length >= config.repeatViolation.threshold;

  return {
    isRepeatOffender,
    recentVerifiedCount: recentVerified.length,
    threshold: config.repeatViolation.threshold,
    windowDays: config.repeatViolation.windowDays,
  };
}