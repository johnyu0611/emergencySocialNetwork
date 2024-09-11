export function camelToUpper(camelCaseString) {
  const r = /([a-z])([A-Z])/gu;
  const s = camelCaseString.replace(r, "$1_$2");
  return s.toUpperCase();
}

export function camelToLower(camelCaseString) {
  const r = /([a-z])([A-Z])/gu;
  const s = camelCaseString.replace(r, "$1_$2");
  return s.toLowerCase();
}
