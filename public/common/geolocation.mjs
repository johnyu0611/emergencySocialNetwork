export function handleGeolocationPositionError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return new Error(
        "Geolocation permission denied. Please enable it in your browser settings."
      );
    case error.POSITION_UNAVAILABLE:
      return new Error(
        "Location information is unavailable. Please try again later."
      );
    case error.TIMEOUT:
      return new Error(
        "The request to get user location timed out. Please try again later."
      );
    default:
      return error;
  }
}

export function getLocation(options) {
  return new Promise((resolve, reject) => {
    // Check if Geolocation is supported by the browser
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position.coords);
        },
        (error) => {
          reject(handleGeolocationPositionError(error));
        },
        options
      );
    } else {
      reject(new Error("Geolocation is not supported by this browser"));
    }
  });
}
