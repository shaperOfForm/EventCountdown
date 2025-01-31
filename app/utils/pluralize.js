// utils/pluralize.js

/**
 * Returns the word with appropriate pluralization based on the count.
 * @param {number} count - The number to determine plurality.
 * @param {string} singular - The singular form of the word.
 * @param {string} plural - The plural form of the word.
 * @returns {string} - The correctly pluralized word.
 */
export function pluralize(count, singular, plural) {
    return count === 1 ? singular : plural;
  }
  