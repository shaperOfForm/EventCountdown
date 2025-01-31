// utils/dateUtils.js

import {
  differenceInDays,
  differenceInHours,
  addDays,
  parseISO,
  isValid as isValidDate,
} from 'date-fns';

/**
 * Build "YYYY-MM-DDT12:00:00" for local noon
 * @param {number} month - Month (1-12)
 * @param {number} day - Day (1-31)
 * @param {number} year - Year (e.g., 2025)
 * @returns {string} - Formatted date string
 */
export function buildDateString(month, day, year) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const yyyy = String(year);
  return `${yyyy}-${mm}-${dd}T12:00:00`;
}

/**
 * Returns the maximum allowable date: "today + 100 years, minus 1 day"
 * set to the end of that day (23:59:59.999).
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
 * Parse "YYYY-MM-DDTHH:mm:ss" (no Z) as local time
 * @param {string} dateStr - Date string in "YYYY-MM-DDTHH:mm:ss" format
 * @returns {Date} - Parsed Date object
 */
export function parseLocalDateTime(dateStr) {
  // dateStr is "YYYY-MM-DDTHH:mm:ss"
  const [datePart, timePart = '00:00:00'] = dateStr.split('T');
  const [yyyy, mm, dd] = datePart.split('-').map(Number);
  const [HH, MM, SS] = timePart.split(':').map(Number);

  return new Date(yyyy, mm - 1, dd, HH || 0, MM || 0, SS || 0);
}

/**
 * Parse "YYYY-MM-DD" as local date at midnight
 * @param {string} dateStr - Date string in "YYYY-MM-DD" format
 * @returns {Date} - Parsed Date object
 */
export function parseLocalDateOnly(dateStr) {
  // dateStr is "YYYY-MM-DD"
  const [yyyy, mm, ddAndTime] = dateStr.split('-');
  const dd = parseInt(ddAndTime, 10);
  return new Date(Number(yyyy), Number(mm) - 1, dd, 0, 0, 0);
}

/**
 * Compute time left, factoring in daySelections & daysOff.
 *
 * NOTE: Because your checkboxes now represent:
 *   index=0 -> Monday, index=1 -> Tuesday, ..., index=6 -> Sunday,
 * we map Sunday (JS getDay()=0) -> index=6,
 * Monday (JS getDay()=1) -> index=0, and so on.
 *
 * @param {string} eventDateStr - Event date string, e.g. "YYYY-MM-DDT12:00:00"
 * @param {number} daysOff - Number of days off
 * @param {boolean[]} daySelections - Array of length 7, index=0=Mon,...=6=Sun
 * @param {Date|string} currentTimeVal - Current time
 * @returns {object} - Object containing countdown details
 */
export function computeAdjustedTime(
  eventDateStr,
  daysOff = 0,
  daySelections = [true, true, true, true, true, false, false], // Mon-Fri=active
  currentTimeVal = new Date()
) {
  // Convert event date & current time to local Date objects
  const event = parseLocalDateTime(eventDateStr);

  let now;
  if (typeof currentTimeVal === 'string') {
    now = parseLocalDateTime(currentTimeVal);
  } else {
    now = currentTimeVal;
  }

  // If event is in the past or exactly now, return zeros
  if (event <= now) {
    return {
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      totalDays: 0,
    };
  }

  // Raw difference in days & hours
  const totalDaysRaw = differenceInDays(event, now);
  const totalHours = differenceInHours(event, now) % 24;

  // Count how many of those days are "inactive"
  // JavaScript getDay(): Sunday=0, Monday=1, ..., Saturday=6
  // Our daySelections: index=0=Mon, ..., index=6=Sun
  // Shift formula: dayIndex = (getDay() + 6) % 7
  let inactiveDays = 0;
  let tempDate = new Date(now);
  for (let i = 0; i < totalDaysRaw; i++) {
    tempDate = addDays(tempDate, 1);
    const dayIndex = (tempDate.getDay() + 6) % 7; // shift Sunday->6, Monday->0, ...
    if (!daySelections[dayIndex]) {
      inactiveDays++;
    }
  }

  // Subtract inactive days & daysOff
  let totalDays = totalDaysRaw - inactiveDays - daysOff;
  if (totalDays < 0) {
    totalDays = 0;
  }

  // Break down totalDays into years, months, weeks, days
  const years = Math.floor(totalDays / 365);
  const leftoverAfterYears = totalDays % 365;
  const months = Math.floor(leftoverAfterYears / 30);
  const leftoverAfterMonths = leftoverAfterYears % 30;
  const weeks = Math.floor(leftoverAfterMonths / 7);
  const days = leftoverAfterMonths % 7;

  return {
    years,
    months,
    weeks,
    days,
    hours: totalHours,
    totalDays,
  };
}
