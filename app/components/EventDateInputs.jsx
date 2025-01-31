// components/EventDateInputs.js

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Picker } from '@react-native-picker/picker';
import { getMaxAllowableDate } from '../utils/dateUtils';

const MONTH_NAMES = [
  { label: 'January', value: '01' },
  { label: 'February', value: '02' },
  { label: 'March', value: '03' },
  { label: 'April', value: '04' },
  { label: 'May', value: '05' },
  { label: 'June', value: '06' },
  { label: 'July', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

// Days in each month (29 for February, handle leap year below)
const DAYS_IN_MONTH = {
  1: 31,
  2: 29,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
};

export default function EventDateInputs({ month, day, year, onDateChange }) {
  const maxAllowableDate = getMaxAllowableDate();
  const currentYear = new Date().getFullYear();
  const maxYear = maxAllowableDate.getFullYear();
  const maxMonth = maxAllowableDate.getMonth() + 1;
  const maxDay = maxAllowableDate.getDate();

  const today = new Date();
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth() + 1;
  const thisDay = today.getDate();

  const isLeapYear = (y) =>
    (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);

  const validateDate = (newMonth, newDay, newYear) => {
    const mm = parseInt(newMonth, 10);
    const dd = parseInt(newDay, 10);
    const yyyy = parseInt(newYear, 10);

    if (isNaN(mm) || isNaN(dd) || isNaN(yyyy)) {
      return;
    }

    let maxDays = DAYS_IN_MONTH[mm] || 31;
    if (mm === 2 && !isLeapYear(yyyy)) {
      maxDays = 28;
    }
    let validatedDay = Math.min(dd, maxDays);

    const candidateDate = new Date(yyyy, mm - 1, validatedDay);

    // If beyond maxAllowableDate, clamp
    if (candidateDate > maxAllowableDate) {
      onDateChange(
        String(maxMonth).padStart(2, '0'),
        String(maxDay).padStart(2, '0'),
        String(maxYear)
      );
      return;
    }

    // If user picks the current month & year, disallow days <= today
    if (yyyy === thisYear && mm === thisMonth) {
      if (validatedDay <= thisDay) {
        validatedDay = thisDay + 1;
      }
    }

    onDateChange(
      String(mm).padStart(2, '0'),
      String(validatedDay).padStart(2, '0'),
      String(yyyy)
    );
  };

  const yearList = Array.from(
    { length: maxYear - currentYear + 1 },
    (_, i) => String(currentYear + i)
  );

  let maxDaysForMonth = DAYS_IN_MONTH[parseInt(month, 10)] || 31;
  if (parseInt(month, 10) === 2 && !isLeapYear(parseInt(year, 10))) {
    maxDaysForMonth = 28;
  }

  let dayUpperBound =
    parseInt(year, 10) === maxYear && parseInt(month, 10) === maxMonth
      ? maxDay
      : maxDaysForMonth;

  let dayLowerBound = 1;
  if (
    parseInt(year, 10) === thisYear &&
    parseInt(month, 10) === thisMonth
  ) {
    dayLowerBound = thisDay + 1;
  }

  const dayOptions = [];
  for (let d = dayLowerBound; d <= dayUpperBound; d++) {
    dayOptions.push(String(d).padStart(2, '0'));
  }

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={month}
          onValueChange={(val) => validateDate(val, day, year)}
          style={styles.picker}
        >
          {MONTH_NAMES
            .filter((mObj) => {
              const numericMonth = parseInt(mObj.value, 10);
              if (year === String(maxYear)) {
                return numericMonth <= maxMonth;
              }
              return true;
            })
            .map((mObj) => (
              <Picker.Item
                key={mObj.value}
                label={mObj.label}
                value={mObj.value}
              />
            ))}
        </Picker>

        <Picker
          selectedValue={day}
          onValueChange={(val) => validateDate(month, val, year)}
          style={styles.picker}
        >
          {dayOptions.map((d) => (
            <Picker.Item key={d} label={d} value={d} />
          ))}
        </Picker>

        <Picker
          selectedValue={year}
          onValueChange={(val) => validateDate(month, day, val)}
          style={styles.picker}
        >
          {yearList.map((y) => (
            <Picker.Item key={y} label={y} value={y} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

EventDateInputs.propTypes = {
  month: PropTypes.string.isRequired,
  day: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#BFC7FF', // consistent with input color
    color: '#000',
  },
});
