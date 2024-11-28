export function validateQuizDescription(description) {
  const trimmedDescription = description.trim();

  if (trimmedDescription.length < 10 || trimmedDescription.length > 300) {
    return false;
  }

  if (/^\d+$/.test(trimmedDescription)) {
    return false;
  }

  if (/^[^\w\s]+$/.test(trimmedDescription)) {
    return false;
  }

  if (trimmedDescription === "") {
    return false;
  }

  return true;
}
