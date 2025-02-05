// components/TimeRemaining.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

/**
 * TimeRemaining Component
 * Displays the countdown in the format:
 * [# of years]y,[# of months]m,[# of weeks]w,[# of days]d,[# of hours]h - ([# of total days] total days)
 *
 * If the countdown has completed, it displays "Countdown Complete!".
 *
 * @param {Object} props
 * @param {Object|string} [props.timeRemaining={}] - Contains years, months, weeks, days, hours, totalDays
 */
export default function TimeRemaining({ timeRemaining = {} }) {
  // If timeRemaining is a string, we assume it is the "Countdown Complete!" message.
  if (typeof timeRemaining === 'string') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Time Remaining:</Text>
        <Text style={styles.value}>{timeRemaining}</Text>
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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Time Remaining:</Text>
      <Text style={styles.value}>
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
    color: '#FFFFFF',
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff9e9e',
  },
});
