import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useThemedColor } from '../useThemedColor';

function TimeRemaining({ timeRemaining = {}, hideLabel = false, valueStyle = {}, containerStyle = {} }) {
  const labelColor = useThemedColor('#FFFFFF');
  const valueColor = useThemedColor('#ff9e9e');

  if (typeof timeRemaining === 'string') {
    return (
      <View style={[styles.container, containerStyle]}>
        {!hideLabel && (
          <Text style={[styles.label, { color: labelColor }]} allowFontScaling>
            Time Remaining:
          </Text>
        )}
        <Text style={[styles.value, { color: valueColor }, valueStyle]} allowFontScaling>
          {timeRemaining}
        </Text>
      </View>
    );
  }

  const { years = 0, months = 0, weeks = 0, days = 0, hours = 0, totalDays = 0 } = timeRemaining;
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
    <View style={[styles.container, containerStyle]}>
      {!hideLabel && (
        <Text style={[styles.label, { color: labelColor }]} allowFontScaling>
          Time Remaining:
        </Text>
      )}
      <Text style={[styles.value, { color: valueColor }, valueStyle]} allowFontScaling>
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
  hideLabel: PropTypes.bool,
  valueStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    alignItems: 'center',
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

export default React.memo(TimeRemaining);
