// components/EventDateInputs.js
import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
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
  1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30,
  7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31,
};

// Base width that design mockups target
const GUIDELINE_BASE_WIDTH = 350;

export default function EventDateInputs({ month, day, year, onDateChange }) {
  // compute scale factor and responsive font size
  const { width } = useWindowDimensions();
  const scale = (size) => (width / GUIDELINE_BASE_WIDTH) * size;
  const fontSize = Math.round(scale(10));  // adjust base font size here

  // theme colors
  const inputBg = useThemedColor('#BFC7FF');
  const textColor = useThemedColor('#000000');

  // compute bounds
  const maxDate = getMaxAllowableDate();
  const currentYear = new Date().getFullYear();
  const maxYear = maxDate.getFullYear();
  const maxMonth = maxDate.getMonth() + 1;
  const maxDay = maxDate.getDate();

  const today = new Date();
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth() + 1;
  const thisDay = today.getDate();

  const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);

  const validateDate = (newM, newD, newY) => {
    const mm = parseInt(newM, 10),
          dd = parseInt(newD, 10),
          yy = parseInt(newY, 10);
    if (isNaN(mm)||isNaN(dd)||isNaN(yy)) return;
    let maxD = DAYS_IN_MONTH[mm] || 31;
    if (mm === 2 && !isLeap(yy)) maxD = 28;
    const dayC = dd > maxD ? maxD : dd;

    let cand = new Date(yy, mm - 1, dayC);
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
    if (cand < tomorrow) cand = tomorrow;
    if (cand > maxDate) {
      onDateChange(
        String(maxMonth).padStart(2,'0'),
        String(maxDay).padStart(2,'0'),
        String(maxYear)
      );
      return;
    }
    onDateChange(
      String(cand.getMonth()+1).padStart(2,'0'),
      String(cand.getDate()).padStart(2,'0'),
      String(cand.getFullYear())
    );
  };

  const yearList = useMemo(
    () => Array.from(
      { length: maxYear - currentYear + 1 },
      (_, i) => String(currentYear + i)
    ),
    [currentYear, maxYear]
  );

  // day bounds
  let maxDays = DAYS_IN_MONTH[parseInt(month,10)] || 31;
  if (parseInt(month,10)===2 && !isLeap(parseInt(year,10))) maxDays=28;
  const dayUpper = (parseInt(year,10)===maxYear && parseInt(month,10)===maxMonth)
    ? maxDay
    : maxDays;
  let dayLower = 1;
  if (parseInt(year,10)===thisYear && parseInt(month,10)===thisMonth) {
    dayLower = thisDay+1;
  }
  const daysOptions = [];
  for (let d=dayLower; d<=dayUpper; d++) daysOptions.push(String(d).padStart(2,'0'));

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={month}
          onValueChange={(v) => validateDate(v, day, year)}
          style={[
            styles.picker,
            { backgroundColor: inputBg, fontSize }
          ]}
          itemStyle={{ color: textColor, fontSize }}
        >
          {MONTH_NAMES
            .filter(m => {
              const mNum = parseInt(m.value,10);
              if (
                (parseInt(year,10)===thisYear && mNum < thisMonth) ||
                (parseInt(year,10)===maxYear && mNum > maxMonth)
              ) return false;
              return true;
            })
            .map(m => (
              <Picker.Item
                key={m.value}
                label={m.label}
                value={m.value}
              />
            ))
          }
        </Picker>

        <Picker
          selectedValue={day}
          onValueChange={(v) => validateDate(month, v, year)}
          style={[
            styles.picker,
            { backgroundColor: inputBg, fontSize }
          ]}
          itemStyle={{ color: textColor, fontSize }}
        >
          {daysOptions.map(d => (
            <Picker.Item key={d} label={d} value={d} />
          ))}
        </Picker>

        <Picker
          selectedValue={year}
          onValueChange={(v) => validateDate(month, day, v)}
          style={[
            styles.picker,
            { backgroundColor: inputBg, fontSize }
          ]}
          itemStyle={{ color: textColor, fontSize }}
        >
          {yearList.map(y => (
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
