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
