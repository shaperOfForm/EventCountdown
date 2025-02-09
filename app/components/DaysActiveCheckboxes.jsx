import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CheckBox from 'expo-checkbox';
import { useThemedColor } from '../useThemedColor';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function DaysActiveCheckboxes({ daySelections, onDaySelectionChange }) {
  const labelColor = useThemedColor('#FFFFFF');
  return (
    <View>
      <Text style={[styles.label, { color: labelColor }]}>Days Active:</Text>
      {DAYS_OF_WEEK.map((day, index) => (
        <TouchableOpacity
          key={index}
          style={styles.checkboxContainer}
          onPress={() => onDaySelectionChange(index, !daySelections[index])}
        >
          <CheckBox
            value={daySelections[index]}
            onValueChange={(newValue) => onDaySelectionChange(index, newValue)}
            style={styles.checkbox}
          />
          <Text style={[styles.dayLabel, { color: labelColor }]}>{day}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dayLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
  },
});

export default React.memo(DaysActiveCheckboxes);
