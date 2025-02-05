// components/TimeRemaining.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useThemedColor } from '../useThemedColor';

export default function TimeRemaining({ timeRemaining = {} }) {
  if (typeof timeRemaining === 'string') {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: useThemedColor('#FFFFFF') }]}>Time Remaining:</Text>
        <Text style={[styles.value, { color: useThemedColor('#ff9e9e') }]}>{timeRemaining}</Text>
      </View>
    );
  }
  const {
    years = 0,
    months = 0,
    weeks = 0,
    days = 0,
    hours = 0,
    totalDays = 0,
  } = timeRemaining;

  const parts = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}m`);
  if (weeks > 0) parts.push(`${weeks}w`);
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  const countdownString = parts.length > 0 ? parts.join(',') : '<1h';

  let displayTotalDays = `${totalDays} total days`;
  if (totalDays > 0 && hours > 0) {
    displayTotalDays = `<${totalDays + 1} total days`;
  } else if (totalDays === 0 && hours > 0) {
    displayTotalDays = `<1 total day`;
  }

  const labelColor = useThemedColor('#FFFFFF');
  const valueColor = useThemedColor('#ff9e9e');

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: labelColor }]}>Time Remaining:</Text>
      <Text style={[styles.value, { color: valueColor }]}>
        {countdownString} - ({displayTotalDays})
      </Text>
    </View>
  );
}

TimeRemaining.propTypes = {
  timeRemaining: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      years: PropTypes.number,
      months: PropTypes.number,
      weeks: PropTypes.number,
      days: PropTypes.number,
      hours: PropTypes.number,
      totalDays: PropTypes.number,
    }),
  ]),
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
