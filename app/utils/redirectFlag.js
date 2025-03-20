// utils/redirectFlag.js

let hasRedirected = false;

/**
 * Checks if the app has already redirected to the FullScreenCountdown screen in the current session.
 * @returns {boolean} True if redirected, false otherwise.
 */
export const hasAlreadyRedirected = () => hasRedirected;

/**
 * Marks that the app has redirected to prevent future redirects during the same session.
 */
export const markRedirected = () => {
  hasRedirected = true;
  console.log('Redirect marked as completed.');
};

/**
 * Resets the redirected flag. Useful when the homepageEvent is cleared or changed.
 */
export const resetRedirected = () => {
  hasRedirected = false;
  console.log('Redirect flag has been reset.');
};

export default {
  hasAlreadyRedirected,
  markRedirected,
  resetRedirected,
};