// components/DaysOffInput.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import DaysActiveCheckboxes from './DaysActiveCheckboxes';

export default function DaysOffInput({
  // Set default values directly in the function parameters
  initialDaysOff = 0, // Default to 0 if not provided
  maxDaysOff,
  onSubmitDaysOff = null, // Default to null if not provided
  initialDaySelections = [true, true, true, true, true, false, false],
  onDaySelectionsChange = null,
}) {
  // ---------------------------
  // Local state: text for daysOff
  // ---------------------------
  const [localDaysOff, setLocalDaysOff] = useState(String(initialDaysOff));

  // ---------------------------
  // Local state: day-of-week checkboxes
  // ---------------------------
  const [daySelections, setDaySelections] = useState(initialDaySelections);

  // If parent changes `initialDaysOff` externally, sync local
  useEffect(() => {
    setLocalDaysOff(String(initialDaysOff));
  }, [initialDaysOff]);

  // If parent changes `initialDaySelections`, sync local
  useEffect(() => {
    setDaySelections(initialDaySelections);
  }, [initialDaySelections]);

  // ---------------------------
  // When user toggles a day
  // ---------------------------
  const handleDaySelectionChange = (index, isSelected) => {
    const updatedSelections = [...daySelections];
    updatedSelections[index] = isSelected;
    setDaySelections(updatedSelections);

    // Notify parent immediately, or you could also do this on blur if desired
    if (onDaySelectionsChange) {
      onDaySelectionsChange(updatedSelections);
    }
  };

  // ---------------------------
  // Submit daysOff ONLY on blur
  // ---------------------------
  const handleBlur = () => {
    if (onSubmitDaysOff) {
      onSubmitDaysOff(localDaysOff);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Days Off:</Text>
      <TextInput
        style={styles.input}
        value={localDaysOff}
        onChangeText={setLocalDaysOff} // updates local state only
        onBlur={handleBlur} // fires callback when user clicks away
        keyboardType="numeric"
        maxLength={3}
        placeholder={`0 - ${maxDaysOff}`}
        placeholderTextColor={'#888'}
      />
      <Text style={styles.helperText}>Max Days Off: {maxDaysOff}</Text>
    </View>
  );
}

DaysOffInput.propTypes = {
  // Accept either a string or number for the initialDaysOff
  initialDaysOff: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  maxDaysOff: PropTypes.number.isRequired,
  // Called once user blurs from the TextInput
  onSubmitDaysOff: PropTypes.func,
  initialDaySelections: PropTypes.arrayOf(PropTypes.bool),
  onDaySelectionsChange: PropTypes.func,
};

// Removed defaultProps as defaults are now handled in function parameters

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  helperText: {
    marginTop: 5,
    color: '#555',
    fontSize: 12,
  },
});
