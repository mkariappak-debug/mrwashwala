/**
 * Branch locator utilities.
 *
 * Pure, dependency-free helpers that work over ANY number of branches from
 * `src/config/branches.js`. No branch-count is hardcoded anywhere here —
 * adding a 3rd/4th/5th branch to the config just works.
 */

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

/**
 * Great-circle distance between two lat/lon points using the Haversine formula.
 * Returns distance in kilometers.
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    [lat1, lon1, lat2, lon2].some(
      (value) => typeof value !== "number" || Number.isNaN(value)
    )
  ) {
    return Infinity;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

const parseTimeToMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

/**
 * Determines whether a branch is open right now, based on its businessHours.
 */
export function isBranchOpenNow(branch, now = new Date()) {
  if (!branch || branch.isActive === false) return false;

  const hours = branch.businessHours;
  if (!hours) return true; // No hours configured => assume always open.

  const currentDay = now.getDay();
  if (Array.isArray(hours.daysOpen) && !hours.daysOpen.includes(currentDay)) {
    return false;
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTimeToMinutes(hours.open);
  const closeMinutes = parseTimeToMinutes(hours.close);

  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

/**
 * Human readable status for a branch, e.g. "Open Today" / "Closed Today - Opens Tomorrow".
 */
export function getBranchStatusLabel(branch, now = new Date()) {
  if (!branch) return "";

  if (branch.isActive === false) {
    return "Temporarily Unavailable";
  }

  if (isBranchOpenNow(branch, now)) {
    return "Open Today";
  }

  const hours = branch.businessHours;
  if (!hours) return "Closed";

  const currentDay = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTimeToMinutes(hours.open);
  const closeMinutes = parseTimeToMinutes(hours.close);

  const opensToday =
    Array.isArray(hours.daysOpen) && hours.daysOpen.includes(currentDay);

  if (opensToday && nowMinutes < openMinutes) {
    return `Opens Today at ${hours.open}`;
  }

  if (opensToday && nowMinutes >= closeMinutes) {
    // Find the next day the branch is open.
    for (let offset = 1; offset <= 7; offset += 1) {
      const nextDay = (currentDay + offset) % 7;
      if (
        !Array.isArray(hours.daysOpen) ||
        hours.daysOpen.includes(nextDay)
      ) {
        return offset === 1
          ? `Closed Today - Opens Tomorrow at ${hours.open}`
          : `Closed Today - Opens ${DAY_LABELS[nextDay]} at ${hours.open}`;
      }
    }
  }

  // Doesn't open today at all - find the next open day.
  for (let offset = 1; offset <= 7; offset += 1) {
    const nextDay = (currentDay + offset) % 7;
    if (!Array.isArray(hours.daysOpen) || hours.daysOpen.includes(nextDay)) {
      return offset === 1
        ? `Closed Today - Opens Tomorrow at ${hours.open}`
        : `Closed Today - Opens ${DAY_LABELS[nextDay]} at ${hours.open}`;
    }
  }

  return "Closed Today";
}

/**
 * Ranks every active branch by distance from the given coordinates.
 * Returns a new array of branches enriched with `distanceKm` and `isOpenNow`,
 * sorted nearest-first. Inactive branches are excluded entirely.
 */
export function rankBranchesByDistance(branchList, latitude, longitude, now = new Date()) {
  return branchList
    .filter((branch) => branch.isActive !== false)
    .map((branch) => ({
      ...branch,
      distanceKm: haversineDistanceKm(
        latitude,
        longitude,
        branch.latitude,
        branch.longitude
      ),
      isOpenNow: isBranchOpenNow(branch, now),
      statusLabel: getBranchStatusLabel(branch, now)
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Picks the recommended branch from a ranked list: nearest OPEN branch.
 * If every branch is closed, falls back to the nearest branch overall so the
 * customer still sees a sensible default (they can always override manually).
 */
export function pickRecommendedBranch(rankedBranches) {
  if (!Array.isArray(rankedBranches) || rankedBranches.length === 0) {
    return null;
  }

  const nearestOpen = rankedBranches.find((branch) => branch.isOpenNow);
  return nearestOpen || rankedBranches[0];
}

export function formatDistance(distanceKm) {
  if (!Number.isFinite(distanceKm)) return "";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`;
  return `${distanceKm.toFixed(1)} km away`;
}
