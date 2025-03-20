import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Picker } from '@react-native-picker/picker';
import { getMaxAllowableDate } from '../utils/dateUtils';
import { useThemedColor } from '../useThemedColor';

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

function EventDateInputs({ month, day, year, onDateChange }) {
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

  // Validate the date so that the candidate date is at least tomorrow.
  // If the selected day exceeds the maximum for the month, set it to the month's last day.
  // If the candidate date is before tomorrow, adjust accordingly.
  const validateDate = (newMonth, newDay, newYear) => {
    const mm = parseInt(newMonth, 10);
    const dd = parseInt(newDay, 10);
    const yyyy = parseInt(newYear, 10);
    if (isNaN(mm) || isNaN(dd) || isNaN(yyyy)) return;

    let maxDays = DAYS_IN_MONTH[mm] || 31;
    if (mm === 2 && !isLeapYear(yyyy)) maxDays = 28;
    const validatedDay = dd > maxDays ? maxDays : dd;
    let candidateDate = new Date(yyyy, mm - 1, validatedDay);

    // Enforce that candidateDate is at least tomorrow.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (candidateDate < tomorrow) {
      candidateDate = tomorrow;
    }

    if (candidateDate > maxAllowableDate) {
      onDateChange(
        String(maxMonth).padStart(2, '0'),
        String(maxDay).padStart(2, '0'),
        String(maxYear)
      );
      return;
    }

    onDateChange(
      String(candidateDate.getMonth() + 1).padStart(2, '0'),
      String(candidateDate.getDate()).padStart(2, '0'),
      String(candidateDate.getFullYear())
    );
  };

  const yearList = Array.from(
    { length: maxYear - currentYear + 1 },
    (_, i) => String(currentYear + i)
  );

  // Determine maximum days in the selected month/year.
  let maxDaysForMonth = DAYS_IN_MONTH[parseInt(month, 10)] || 31;
  if (parseInt(month, 10) === 2 && !isLeapYear(parseInt(year, 10))) {
    maxDaysForMonth = 28;
  }
  const dayUpperBound =
    parseInt(year, 10) === maxYear && parseInt(month, 10) === maxMonth
      ? maxDay
      : maxDaysForMonth;

  // Determine the lower bound for days.
  // If the selected year and month are the current ones, only show days after today.
  let dayLowerBound = 1;
  if (parseInt(year, 10) === thisYear && parseInt(month, 10) === thisMonth) {
    dayLowerBound = thisDay + 1;
  }

  const dayOptions = [];
  for (let d = dayLowerBound; d <= dayUpperBound; d++) {
    dayOptions.push(String(d).padStart(2, '0'));
  }

  const inputBg = useThemedColor('#BFC7FF');
  const textColor = useThemedColor('#000000');

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={month}
          onValueChange={(val) => validateDate(val, day, year)}
          style={[styles.picker, { backgroundColor: inputBg }]}
          itemStyle={{ color: textColor }}
        >
          {MONTH_NAMES.filter((mObj) => {
            const numericMonth = parseInt(mObj.value, 10);
            // Exclude months in the past if current year.
            if (parseInt(year, 10) === thisYear && numericMonth < thisMonth) {
              return false;
            }
            if (parseInt(year, 10) === maxYear && numericMonth > maxMonth) {
              return false;
            }
            return true;
          }).map((mObj) => (
            <Picker.Item key={mObj.value} label={mObj.label} value={mObj.value} />
          ))}
        </Picker>
        <Picker
          selectedValue={day}
          onValueChange={(val) => validateDate(month, val, year)}
          style={[styles.picker, { backgroundColor: inputBg }]}
          itemStyle={{ color: textColor }}
        >
          {dayOptions.map((d) => (
            <Picker.Item key={d} label={d} value={d} />
          ))}
        </Picker>
        <Picker
          selectedValue={year}
          onValueChange={(val) => validateDate(month, day, val)}
          style={[styles.picker, { backgroundColor: inputBg }]}
          itemStyle={{ color: textColor }}
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
    alignItems: 'center',
  },
  picker: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 6,
    overflow: 'hidden',
  },
});

export default React.memo(EventDateInputs);
