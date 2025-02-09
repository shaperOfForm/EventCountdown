import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getMaxDays(month, year) {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

function getDateParts(dateString) {
  if (!dateString) {
    const today = new Date();
    return {
      year: String(today.getFullYear()),
      month: String(today.getMonth() + 1).padStart(2, '0'),
      day: String(today.getDate()).padStart(2, '0'),
    };
  }
  const pureDate = dateString.slice(0, 10);
  const parts = pureDate.split('-');
  if (parts.length === 3) {
    return {
      year: parts[0],
      month: parts[1],
      day: parts[2],
    };
  }
  const today = new Date();
  return {
    year: String(today.getFullYear()),
    month: String(today.getMonth() + 1).padStart(2, '0'),
    day: String(today.getDate()).padStart(2, '0'),
  };
}

function isDateValid(year, month, day) {
  if (!year || !month || !day) return false;
  const numericYear = parseInt(year, 10);
  const numericMonth = parseInt(month, 10);
  const numericDay = parseInt(day, 10);

  if (numericMonth < 1 || numericMonth > 12) return false;
  const maxDays = getMaxDays(numericMonth, numericYear);
  if (numericDay < 1 || numericDay > maxDays) return false;

  const enteredDate = new Date(numericYear, numericMonth - 1, numericDay);
  const today = new Date();
  const tomorrow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );
  return enteredDate >= tomorrow;
}

function PanelDateInput({ eventDate, onDateChange }) {
  const [localYear, setLocalYear] = useState('');
  const [localMonth, setLocalMonth] = useState('');
  const [localDay, setLocalDay] = useState('');

  useEffect(() => {
    const { year, month, day } = getDateParts(eventDate);
    setLocalYear(year);
    setLocalMonth(month);
    setLocalDay(day);
  }, [eventDate]);

  const handleChange = (text, setter, maxLength) => {
    const sanitized = text.replace(/[^0-9]/g, '');
    if (sanitized.length <= maxLength) {
      setter(sanitized);
    }
  };

  const handleBlur = (field) => {
    const defaultParts = getDateParts(eventDate);
    let newYear = localYear;
    let newMonth = localMonth;
    let newDay = localDay;

    if (field === 'month') {
      const numericMonth = parseInt(localMonth, 10);
      if (numericMonth < 1 || numericMonth > 12) {
        newMonth = defaultParts.month;
      } else {
        newMonth = String(numericMonth).padStart(2, '0');
      }
    }

    if (field === 'day') {
      const numericMonth = parseInt(localMonth, 10) || parseInt(defaultParts.month, 10);
      const numericYear = parseInt(localYear, 10) || parseInt(defaultParts.year, 10);
      const numericDay = parseInt(localDay, 10);
      const maxDays = getMaxDays(numericMonth, numericYear);
      if (numericDay < 1 || numericDay > maxDays) {
        newDay = defaultParts.day;
      } else {
        newDay = String(numericDay).padStart(2, '0');
      }
    }

    if (field === 'year') {
      if (!isDateValid(localYear, localMonth, localDay)) {
        newYear = defaultParts.year;
        newMonth = defaultParts.month;
        newDay = defaultParts.day;
      }
    }

    if (isDateValid(newYear, newMonth, newDay)) {
      setLocalYear(newYear);
      setLocalMonth(newMonth);
      setLocalDay(newDay);
      onDateChange(`${newYear}-${newMonth}-${newDay}`);
    } else {
      setLocalYear(defaultParts.year);
      setLocalMonth(defaultParts.month);
      setLocalDay(defaultParts.day);
      onDateChange(`${defaultParts.year}-${defaultParts.month}-${defaultParts.day}`);
    }
  };

  return (
    <View style={styles.dateContainer}>
      <Text style={styles.label}>Event Date (MM/DD/YYYY):</Text>
      <View style={styles.dateInputs}>
        <TextInput
          style={styles.dateInput}
          value={localMonth}
          onChangeText={(text) => handleChange(text, setLocalMonth, 2)}
          onBlur={() => handleBlur('month')}
          placeholder="MM"
          keyboardType="numeric"
          maxLength={2}
        />
        <Text style={styles.slash}>/</Text>
        <TextInput
          style={styles.dateInput}
          value={localDay}
          onChangeText={(text) => handleChange(text, setLocalDay, 2)}
          onBlur={() => handleBlur('day')}
          placeholder="DD"
          keyboardType="numeric"
          maxLength={2}
        />
        <Text style={styles.slash}>/</Text>
        <TextInput
          style={styles.dateInput}
          value={localYear}
          onChangeText={(text) => handleChange(text, setLocalYear, 4)}
          onBlur={() => handleBlur('year')}
          placeholder="YYYY"
          keyboardType="numeric"
          maxLength={4}
        />
      </View>
    </View>
  );
}

PanelDateInput.propTypes = {
  eventDate: PropTypes.string.isRequired,
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
    color: '#FFFFFF',
  },
  dateInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    padding: 8,
    borderRadius: 5,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#FFF',
    marginRight: 2,
  },
  slash: {
    fontSize: 20,
    marginHorizontal: 2,
    color: '#FFF',
  },
});

export default React.memo(PanelDateInput);
