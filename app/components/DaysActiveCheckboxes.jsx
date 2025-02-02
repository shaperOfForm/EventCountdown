import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CheckBox from 'expo-checkbox';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * @param {boolean[]} daySelections - array of 7 booleans
 * @param {function} onDaySelectionChange - callback(index, newValue)
 */
export default function DaysActiveCheckboxes({ daySelections, onDaySelectionChange }) {
  return (
    <View>
      <Text style={styles.label}>Days Active:</Text>
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
          <Text style={styles.dayLabel}>{day}</Text>
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
    color: '#FFFFFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dayLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FFFFFF',
  },
  checkbox: {
    // Increase the size of the checkbox for better touch targets
    width: 24,
    height: 24,
  },
});
