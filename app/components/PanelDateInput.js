import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';

/**
 * Helper function to determine if a year is a leap year.
 * @param {number} year
 * @returns {boolean}
 */
const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/**
 * Helper function to get the maximum number of days in a given month and year.
 * @param {number} month
 * @param {number} year
 * @returns {number}
 */
const getMaxDays = (month, year) => {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
};

/**
 * Helper function to get the maximum allowable date (today + 99 years + 364 days).
 * @returns {Date}
 */
const getMaxAllowableDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setFullYear(today.getFullYear() + 99);
    maxDate.setDate(maxDate.getDate() + 364);
    return maxDate;
  };

  const maxAllowableDate = getMaxAllowableDate();

const isDateValid = (year, month, day) => {
  if (!year || !month || !day) return false;

  const numericYear = parseInt(year, 10);
  const numericMonth = parseInt(month, 10);
  const numericDay = parseInt(day, 10);

  if (numericMonth < 1 || numericMonth > 12) return false;

  const maxDays = getMaxDays(numericMonth, numericYear);
  if (numericDay < 1 || numericDay > maxDays) return false;

  const enteredDate = new Date(numericYear, numericMonth - 1, numericDay);
  return enteredDate <= maxAllowableDate;
};

export default function PanelDateInput({ month, day, year, onDateChange }) {
  const [internalMonth, setInternalMonth] = useState('');
  const [internalDay, setInternalDay] = useState('');
  const [internalYear, setInternalYear] = useState('');
  const [initialMonth, setInitialMonth] = useState('');
  const [initialDay, setInitialDay] = useState('');
  const [initialYear, setInitialYear] = useState('');

  const maxAllowableDate = getMaxAllowableDate();

  // Initialize the state with the provided month, day, and year props
  useEffect(() => {
    setInternalMonth(month);
    setInitialMonth(month);
    setInternalDay(day);
    setInitialDay(day);
    setInternalYear(year);
    setInitialYear(year);
  }, [month, day, year]);

  const isDateValid = (year, month, day) => {
    if (!year || !month || !day) return false;

    const numericYear = parseInt(year, 10);
    const numericMonth = parseInt(month, 10);
    const numericDay = parseInt(day, 10);

    if (numericMonth < 1 || numericMonth > 12) return false;

    const maxDays = getMaxDays(numericMonth, numericYear);
    if (numericDay < 1 || numericDay > maxDays) return false;

    const enteredDate = new Date(numericYear, numericMonth - 1, numericDay);
    return enteredDate <= maxAllowableDate;
  };

  const handleMonthChange = (text) => {
    const sanitized = text.replace(/[^0-9]/g, '');
    if (sanitized.length > 2) return;
    setInternalMonth(sanitized);
  };

  const handleDayChange = (text) => {
    const sanitized = text.replace(/[^0-9]/g, '');
    if (sanitized.length > 2) return;
    setInternalDay(sanitized);
  };

  const handleYearChange = (text) => {
    const sanitized = text.replace(/[^0-9]/g, '');
    if (sanitized.length > 4) return;
    setInternalYear(sanitized);
  };

  const handleBlur = (field) => {
    const numericYear = parseInt(internalYear || '0', 10);
    const numericMonth = parseInt(internalMonth || '0', 10);
    const numericDay = parseInt(internalDay || '0', 10);

    if (field === 'month') {
      if (numericMonth < 1 || numericMonth > 12) {
        setInternalMonth(initialMonth);
      } else {
        const paddedMonth = String(numericMonth).padStart(2, '0');
        setInternalMonth(paddedMonth);
        onDateChange(paddedMonth, internalDay, internalYear);
      }
    }

    if (field === 'day') {
      const maxDays = getMaxDays(numericMonth, numericYear || new Date().getFullYear());
      if (numericDay < 1 || numericDay > maxDays) {
        setInternalDay(initialDay);
      } else {
        const paddedDay = String(numericDay).padStart(2, '0');
        setInternalDay(paddedDay);
        onDateChange(internalMonth, paddedDay, internalYear);
      }
    }

    if (field === 'year') {
      if (!isDateValid(numericYear, internalMonth, internalDay)) {
        setInternalYear(initialYear);
      } else {
        onDateChange(internalMonth, internalDay, internalYear);
      }
    }

    if (!isDateValid(internalYear, internalMonth, internalDay)) {
      setInternalMonth(initialMonth);
      setInternalDay(initialDay);
      setInternalYear(initialYear);
    }
  };

  const handleFocus = (field) => {
    if (field === 'month') setInternalMonth('');
    if (field === 'day') setInternalDay('');
    if (field === 'year') setInternalYear('');
  };

  return (
    <View style={styles.dateContainer}>
      <Text style={styles.label}>Event Date (MM/DD/YYYY):</Text>
      <View style={styles.dateInputs}>
        <TextInput
          style={styles.dateInput}
          value={internalMonth}
          onChangeText={handleMonthChange}
          onBlur={() => handleBlur('month')}
          onFocus={() => handleFocus('month')}
          placeholder="MM"
          keyboardType="numeric"
          maxLength={2}
        />
        <Text style={styles.slash}>/</Text>
        <TextInput
          style={styles.dateInput}
          value={internalDay}
          onChangeText={handleDayChange}
          onBlur={() => handleBlur('day')}
          onFocus={() => handleFocus('day')}
          placeholder="DD"
          keyboardType="numeric"
          maxLength={2}
        />
        <Text style={styles.slash}>/</Text>
        <TextInput
          style={styles.dateInput}
          value={internalYear}
          onChangeText={handleYearChange}
          onBlur={() => handleBlur('year')}
          onFocus={() => handleFocus('year')}
          placeholder="YYYY"
          keyboardType="numeric"
          maxLength={4}
        />
      </View>
    </View>
  );
}

PanelDateInput.propTypes = {
  month: PropTypes.string.isRequired,
  day: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  dateContainer: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
  },
  dateInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    padding: 8,
    borderRadius: 5,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  slash: {
    fontSize: 20,
    marginHorizontal: 2,
    color: '#333',
  },
});
