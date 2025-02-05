// utils/dateUtils.js
import { differenceInDays, differenceInHours, addDays } from 'date-fns';

/**
 * Build a date string in the format "YYYY-MM-DDT08:00:00" for local 8 AM.
 *
 * @param {number} month - Month (1-12)
 * @param {number} day - Day (1-31)
 * @param {number} year - Year (e.g., 2025)
 * @returns {string} - Formatted date string
 */
export function buildDateString(month, day, year) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}T08:00:00`;
}

/**
 * Calculate the maximum allowable date: "today + 100 years, minus 1 day",
 * set to the end of that day (23:59:59.999).
 *
 * @returns {Date} - Maximum allowable date
 */
export function getMaxAllowableDate() {
  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() + 100,
    today.getMonth(),
    today.getDate() - 1
  );
  maxDate.setHours(23, 59, 59, 999);
  return maxDate;
}

/**
 * Parse a date string in the format "YYYY-MM-DDTHH:mm:ss" (local time, no time zone).
 *
 * @param {string} dateStr - Date string in "YYYY-MM-DDTHH:mm:ss" format
 * @returns {Date} - Parsed Date object
 */
export function parseLocalDateTime(dateStr) {
  const [datePart, timePart = '00:00:00'] = dateStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
}

/**
 * Parse a date string in the format "YYYY-MM-DD" as a local date at midnight.
 *
 * @param {string} dateStr - Date string in "YYYY-MM-DD" format
 * @returns {Date} - Parsed Date object
 */
export function parseLocalDateOnly(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0);
}

/**
 * Compute the adjusted time remaining until an event, factoring in inactive days
 * based on provided day selections and extra days off.
 *
 * Note: The daySelections array represents:
 *   index 0 -> Monday, index 1 -> Tuesday, ..., index 6 -> Sunday.
 * Since JavaScript's getDay() returns Sunday as 0, Monday as 1, etc.,
 * we shift the index using: dayIndex = (getDay() + 6) % 7.
 *
 * When the countdown reaches zero (or the event is in the past), the function
 * returns the string "Countdown Complete!".
 *
 * @param {string} eventDateStr - Event date string (e.g., "YYYY-MM-DDT08:00:00")
 * @param {number} [daysOff=0] - Additional days to subtract from the countdown
 * @param {boolean[]} [daySelections=[true, true, true, true, true, false, false]]
 *        - Array of booleans for Monday through Sunday (default: Monday-Friday active)
 * @param {Date|string} [currentTimeVal=new Date()] - The current time
 * @returns {object|string} - Countdown details object or "Countdown Complete!" if finished
 */
export function computeAdjustedTime(
  eventDateStr,
  daysOff = 0,
  daySelections = [true, true, true, true, true, false, false],
  currentTimeVal = new Date()
) {
  // Convert the event string and current time to Date objects
  const event = parseLocalDateTime(eventDateStr);
  const now =
    typeof currentTimeVal === 'string'
      ? parseLocalDateTime(currentTimeVal)
      : currentTimeVal;

  // If the event has already passed or is exactly now, return completion message.
  if (event <= now) {
    return "Countdown Complete!";
  }

  // Compute the raw difference in days and hours between the event and now.
  const totalDaysRaw = differenceInDays(event, now);
  const remainingHours = differenceInHours(event, now) % 24;

  // Calculate the number of inactive days within the range.
  let inactiveDays = 0;
  let tempDate = new Date(now);
  for (let i = 0; i < totalDaysRaw; i++) {
    tempDate = addDays(tempDate, 1);
    const dayIndex = (tempDate.getDay() + 6) % 7;
    if (!daySelections[dayIndex]) {
      inactiveDays++;
    }
  }

  // Adjust total active days by subtracting inactive days and additional days off.
  let totalDays = totalDaysRaw - inactiveDays - daysOff;
  if (totalDays < 0) {
    totalDays = 0;
  }

  // If the adjusted countdown is zero days and no extra hours, it is complete.
  if (totalDays === 0 && remainingHours === 0) {
    return "Countdown Complete!";
  }

  // Break down the active days into years, months, weeks, and days.
  const years = Math.floor(totalDays / 365);
  const remainingAfterYears = totalDays % 365;
  const months = Math.floor(remainingAfterYears / 30);
  const remainingAfterMonths = remainingAfterYears % 30;
  const weeks = Math.floor(remainingAfterMonths / 7);
  const days = remainingAfterMonths % 7;

  return {
    years,
    months,
    weeks,
    days,
    hours: remainingHours,
    totalDays,
  };
}
