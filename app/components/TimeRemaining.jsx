import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

/**
 * TimeRemaining Component
 * Displays the countdown in the format:
 * [# of years]y,[# of months]m,[# of weeks]w,[# of days]d,[# of hours]h - ([# of remaining days until event] total days)
 *
 * @param {Object} props
 * @param {Object} [props.timeRemaining] - Contains years, months, weeks, days, hours, totalDays
 */
export default function TimeRemaining({ timeRemaining = {} }) {
  // Destructure with defaults to prevent crashes
  const {
    years = 0,
    months = 0,
    weeks = 0,
    days = 0,
    hours = 0,
    totalDays = 0,
  } = timeRemaining;

  // Construct the countdown string without spaces between numbers and letters
  const countdownString = [
    years > 0 ? `${years}y` : null,
    months > 0 ? `${months}m` : null,
    weeks > 0 ? `${weeks}w` : null,
    days > 0 ? `${days}d` : null,
    hours > 0 ? `${hours}h` : null,
  ]
    .filter(Boolean)
    .join(',');

  // Determine how to display totalDays
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
        {countdownString || '<1h'} - ({displayTotalDays})
      </Text>
    </View>
  );
}

TimeRemaining.propTypes = {
  timeRemaining: PropTypes.shape({
    years: PropTypes.number,
    months: PropTypes.number,
    weeks: PropTypes.number,
    days: PropTypes.number,
    hours: PropTypes.number,
    totalDays: PropTypes.number,
  }),
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
