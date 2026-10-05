/**
 * Verhoeff Checksum Algorithm & ICAO Doc 9303 MRZ Validation
 * Used for AI Document & Identity Screening System (InnovateX).
 */

// The multiplication table (d) based on dihedral group D5
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// The permutation table (p)
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

// The inverse table (inv)
const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Validates a number string using the Verhoeff algorithm.
 * Returns true if valid, false otherwise.
 */
export function validateVerhoeff(numStr) {
  if (!numStr) return false;
  const clean = numStr.replace(/\s+/g, '');
  if (!/^\d+$/.test(clean)) return false;

  let c = 0;
  const digits = clean.split('').reverse().map(Number);

  for (let i = 0; i < digits.length; i++) {
    c = d[c][p[i % 8][digits[i]]];
  }

  return c === 0;
}

/**
 * Computes the Verhoeff check digit for a given numeric string.
 */
export function generateVerhoeffCheckDigit(numStr) {
  const clean = numStr.replace(/\s+/g, '');
  if (!/^\d+$/.test(clean)) return null;

  let c = 0;
  const digits = clean.split('').reverse().map(Number);

  for (let i = 0; i < digits.length; i++) {
    c = d[c][p[(i + 1) % 8][digits[i]]];
  }

  return inv[c];
}

/**
 * ICAO 9303 Check Digit Calculator (weights 7, 3, 1)
 */
export function calculateIcaoCheckDigit(str) {
  const weights = [7, 3, 1];
  let sum = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i].toUpperCase();
    let val = 0;
    if (char >= '0' && char <= '9') {
      val = char.charCodeAt(0) - 48;
    } else if (char >= 'A' && char <= 'Z') {
      val = char.charCodeAt(0) - 55;
    } else if (char === '<') {
      val = 0;
    }
    sum += val * weights[i % 3];
  }

  return sum % 10;
}

/**
 * Validates a standard passport MRZ string snippet (e.g. DocNumber + CheckDigit)
 */
export function validatePassportField(fieldVal, checkDigit) {
  if (!fieldVal || checkDigit == null) return false;
  const calculated = calculateIcaoCheckDigit(fieldVal);
  return calculated === Number(checkDigit);
}
