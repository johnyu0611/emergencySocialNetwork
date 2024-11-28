export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseQueryParameters(url) {
  const parameters = {};

  const queryString = new URL(url).search;
  const urlParameters = new URLSearchParams(queryString);

  for (const [key, value] of urlParameters.entries()) {
    parameters[key] = value;
  }

  return parameters;
}

export function setQueryParameters(parameters) {
  const url = new URL(window.location.href);

  url.search = "";

  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  }

  window.history.replaceState(null, "", url.toString());
}

export function getJWTPayload(token) {
  return JSON.parse(atob(token.split(".")[1]));
}

export function degToRad(deg) {
  return deg * (Math.PI / 180);
}

// Calculate distance between two geographical coordinates
export function calculateDistance(coord1, coord2) {
  // Earth's radius in km
  const R = 6371;
  const dLatitude = degToRad(coord2.latitude - coord1.latitude);
  const dLongitude = degToRad(coord2.longitude - coord1.longitude);
  const a =
    Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2) +
    Math.cos(degToRad(coord1.latitude)) *
      Math.cos(degToRad(coord2.latitude)) *
      Math.sin(dLongitude / 2) *
      Math.sin(dLongitude / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Distance in m
  return R * c * 1000;
}

export function formatDuration(timestampDiff) {
  if (timestampDiff <= 1000) {
    return "now";
  }

  const formatter = new Intl.DurationFormat("en", {
    style: "narrow"
  });

  const seconds = Math.floor(timestampDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const duration = {
    days: days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60
  };

  return formatter.format(duration);
}

export function meterToFoot(meter) {
  return meter * 3.28084;
}

export function footToMile(foot) {
  return foot / 5280;
}

export function meterToImperialFormatted(meter) {
  const foot = meterToFoot(meter);
  const mile = footToMile(foot);

  if (foot < 1000) {
    return `${foot.toFixed(2)} ft`;
  }
  return `${mile.toFixed(2)} mi`;
}
