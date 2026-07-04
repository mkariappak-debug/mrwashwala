/**
 * Geocoding helpers built on OpenStreetMap's free Nominatim API.
 * No Google Maps / paid APIs are used anywhere in this project.
 */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

/**
 * Reverse geocode coordinates -> a human readable address string.
 * Mirrors the logic already used for "Use Current Location".
 */
export async function reverseGeocode(latitude, longitude) {
  const response = await fetch(
    `${NOMINATIM_BASE}/reverse?format=json&lat=${latitude}&lon=${longitude}`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await response.json();

  let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

  if (data.address) {
    const parts = [];
    if (data.address.road) parts.push(data.address.road);
    if (data.address.house_number && data.address.road) {
      parts[0] = `${data.address.house_number} ${data.address.road}`;
    }
    if (data.address.city || data.address.town || data.address.village) {
      parts.push(data.address.city || data.address.town || data.address.village);
    }
    if (data.address.state) parts.push(data.address.state);
    if (data.address.postcode) parts.push(data.address.postcode);

    address = parts.filter(Boolean).join(", ");
  }

  return address;
}

/**
 * Address autocomplete suggestions using OpenStreetMap Nominatim's search
 * endpoint. Unlike `forwardGeocode`, this returns several candidates with
 * their own display text so the customer can pick the exact match instead of
 * us guessing at one result from free-typed text. Selecting a suggestion
 * gives guaranteed-accurate coordinates (no parsing ambiguity), which is what
 * makes branch recommendation reliable for manually entered addresses.
 */
export async function searchAddressSuggestions(query, limit = 5) {
  const q = (query || "").trim();
  if (q.length < 3) return [];

  const response = await fetch(
    `${NOMINATIM_BASE}/search?format=json&addressdetails=1&limit=${limit}&countrycodes=in&q=${encodeURIComponent(
      q
    )}`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await response.json();

  if (!Array.isArray(data)) return [];

  return data
    .map((item) => {
      const latitude = parseFloat(item.lat);
      const longitude = parseFloat(item.lon);
      if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
      return {
        id: item.place_id,
        displayName: item.display_name,
        latitude,
        longitude
      };
    })
    .filter(Boolean);
}

/**
 * Forward geocode a free-text address -> { latitude, longitude } using
 * OpenStreetMap Nominatim's search endpoint. Returns null if no match is found.
 */
export async function forwardGeocode(addressText) {
  const query = (addressText || "").trim();
  if (!query) return null;

  const response = await fetch(
    `${NOMINATIM_BASE}/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(
      query
    )}`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const { lat, lon } = data[0];
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  return { latitude, longitude };
}
