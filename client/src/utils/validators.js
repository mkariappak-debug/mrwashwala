/**
 * Validates whether a given string is a valid 10-digit Indian phone number.
 * Accepts exactly 10 numeric digits.
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const clean = String(phone).trim().replace(/\D/g, '');
  return clean.length === 10;
};

/**
 * Sanitizes phone input to only allow numeric digits and maximum 10 characters.
 */
export const sanitizePhoneInput = (value) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '').slice(0, 10);
};

/**
 * Returns a standardized error message if phone number is invalid, or empty string if valid.
 */
export const getPhoneValidationMessage = (phone, required = true) => {
  if (!phone || !String(phone).trim()) {
    return required ? 'Please enter a valid 10-digit phone number.' : '';
  }
  const clean = String(phone).trim().replace(/\D/g, '');
  if (clean.length !== 10) {
    return 'Please enter a valid 10-digit phone number.';
  }
  return '';
};
