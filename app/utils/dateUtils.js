// utils/dateUtils.js
import { addDays } from 'date-fns';

/**
 * Builds a date string in the format "YYYY-MM-DDT08:00:00" representing 8 AM local time.
 */
export function buildDateString(month, day, year) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}T08:00:00`;
}

/**
 * Returns the maximum allowable date: today + 100 years - 1 day at 23:59:59.999.
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
 * Parses a local date time string "YYYY-MM-DDTHH:mm:ss".
 */
export function parseLocalDateTime(dateStr) {
  const [datePart, timePart = '00:00:00'] = dateStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
}

/**
 * Parses a local date-only string "YYYY-MM-DD" as midnight.
 */
export function parseLocalDateOnly(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0);
}

/**
 * Computes the adjusted time remaining until an event by accounting for
 * inactive days (via daySelections) and extra days off, down to hours.
 * Uses millisecond arithmetic so DST transitions are respected.
 *
 * @param {string} eventDateStr - "YYYY-MM-DDTHH:mm:ss" at target time (e.g., 08:00). 
 * @param {number} daysOff - full days to subtract.
 * @param {boolean[]} daySelections - Mon (0) ... Sun (6).
 * @param {Date|string} currentTimeVal - Date or ISO string.
 * @returns {object|string} - { years, months, weeks, days, hours, totalDays } or 'Countdown Complete!'
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

  if (eventDate <= now) {
    return 'Countdown Complete!';
  }

  // Millisecond difference (accounts for DST)
  const msDiff = eventDate.getTime() - now.getTime();
  const totalHoursRaw = Math.floor(msDiff / (1000 * 60 * 60));
  const totalDaysRaw = Math.floor(msDiff / (1000 * 60 * 60 * 24));

  // Count inactive calendar days
  let inactiveDays = 0;
  let temp = new Date(now);
  for (let i = 0; i < totalDaysRaw; i++) {
    temp = addDays(temp, 1);
    const dayIndex = (temp.getDay() + 6) % 7;
    if (!daySelections[dayIndex]) inactiveDays++;
  }

  // Compute total active hours after removing inactive days and daysOff
  const hoursAfterInactive = totalHoursRaw - inactiveDays * 24;
  const totalActiveHours = hoursAfterInactive - daysOff * 24;
  if (totalActiveHours <= 0) {
    return 'Countdown Complete!';
  }

  // Breakdown into days and hours
  const days = Math.floor(totalActiveHours / 24);
  const hours = totalActiveHours % 24;

  // Further breakdown days into y/m/w/d (approximate months = 30 days)
  const years = Math.floor(days / 365);
  const remAfterYears = days % 365;
  const months = Math.floor(remAfterYears / 30);
  const remAfterMonths = remAfterYears % 30;
  const weeks = Math.floor(remAfterMonths / 7);
  const remDays = remAfterMonths % 7;

  return {
    years,
    months,
    weeks,
    days: remDays,
    hours,
    totalDays: days,
  };
}

export default {
  buildDateString,
  getMaxAllowableDate,
  parseLocalDateTime,
  parseLocalDateOnly,
  computeAdjustedTime,
};
