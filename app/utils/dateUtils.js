// utils/dateUtils.js
import { differenceInDays, differenceInHours, addDays } from 'date-fns';

/**
 * Builds a date string in the format "YYYY-MM-DDT08:00:00" representing 8 AM local time.
 */
export function buildDateString(month, day, year) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}T08:00:00`;
}

/**
 * Returns the maximum allowable date which is "today + 100 years minus 1 day"
 * and set to 23:59:59.999.
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
 * Parses a local date time string in the format "YYYY-MM-DDTHH:mm:ss".
 */
export function parseLocalDateTime(dateStr) {
  const [datePart, timePart = '00:00:00'] = dateStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
}

/**
 * Parses a date string in the "YYYY-MM-DD" format as a local date at midnight.
 */
export function parseLocalDateOnly(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0);
}

/**
 * Computes the adjusted time remaining until an event by accounting for
 * inactive days (using daySelections) and extra days off.
 *
 * @param {string} eventDateStr - Event date string in the format "YYYY-MM-DDT08:00:00"
 * @param {number} [daysOff=0] - Additional days to subtract from the countdown.
 * @param {boolean[]} [daySelections=[true, true, true, true, true, false, false]]
 *   - An array for Monday (index 0) through Sunday (index 6). (JavaScript’s getDay() is shifted accordingly.)
 * @param {Date|string} [currentTimeVal=new Date()] - The current time.
 * @returns {object|string} - An object with years, months, weeks, days, hours, totalDays, 
 *   and totalDaysIgnoringDaysOff, or a "Countdown Complete!" message if the event is in the past.
 */
export function computeAdjustedTime(
  eventDateStr,
  daysOff = 0,
  daySelections = [true, true, true, true, true, false, false],
  currentTimeVal = new Date()
) {
  const eventDate = parseLocalDateTime(eventDateStr);
  const now =
    typeof currentTimeVal === 'string'
      ? parseLocalDateTime(currentTimeVal)
      : currentTimeVal;

  // If the event is in the past or exactly now, return completion.
  if (eventDate <= now) {
    return 'Countdown Complete!';
  }

  // Compute raw difference in days and remaining hours.
  const totalDaysRaw = differenceInDays(eventDate, now);
  const remainingHours = differenceInHours(eventDate, now) % 24;

  // Count inactive days based on daySelections.
  let inactiveDays = 0;
  let tempDate = new Date(now);
  for (let i = 0; i < totalDaysRaw; i++) {
    tempDate = addDays(tempDate, 1);
    // Adjust JavaScript’s getDay() to have Monday as index 0.
    const dayIndex = (tempDate.getDay() + 6) % 7;
    if (!daySelections[dayIndex]) {
      inactiveDays++;
    }
  }

  // totalDaysIgnoringDaysOff excludes subtraction of daysOff
  const totalDaysIgnoringDaysOff = totalDaysRaw - inactiveDays;

  // totalDays includes daysOff
  let totalDays = totalDaysIgnoringDaysOff - daysOff;
  if (totalDays < 0) totalDays = 0;

  if (totalDays === 0 && remainingHours === 0) {
    return 'Countdown Complete!';
  }

  // Breakdown active days into years, months, weeks, and days.
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
    // Actual countdown (subtracting daysOff).
    totalDays,
    // The total ignoring 'daysOff', for use in UI (e.g., maxDaysOff).
    totalDaysIgnoringDaysOff,
  };
}
