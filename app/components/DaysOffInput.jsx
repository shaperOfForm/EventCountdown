// components/DaysOffInput.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import DaysActiveCheckboxes from './DaysActiveCheckboxes';

export default function DaysOffInput({ 
  daysOff, 
  maxDaysOff, 
  onChangeDaysOff, 
  initialDaySelections = [true, true, true, true, true, false, false],
  onDaySelectionsChange 
}) {
  const [daySelections, setDaySelections] = useState(initialDaySelections);

  const handleDaySelectionChange = (index, isSelected) => {
    const updatedSelections = [...daySelections];
    updatedSelections[index] = isSelected;
    setDaySelections(updatedSelections);
    // Notify parent component about the change
    if (onDaySelectionsChange) {
      onDaySelectionsChange(updatedSelections);
    }
  };

  // Sync with initialDaySelections if it changes
  useEffect(() => {
    setDaySelections(initialDaySelections);
  }, [initialDaySelections]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Days Off:</Text>
      <TextInput
        style={styles.input}
        value={daysOff}
        onChangeText={onChangeDaysOff}
        keyboardType="numeric"
        maxLength={3}
        placeholder={`0 - ${maxDaysOff}`}
      />
      <Text style={styles.helperText}>Max Days Off: {maxDaysOff}</Text>

      {/* Days Active Checkboxes */}
      <DaysActiveCheckboxes
        daySelections={daySelections}
        onDaySelectionChange={handleDaySelectionChange}
      />
    </View>
  );
}

DaysOffInput.propTypes = {
  daysOff: PropTypes.string.isRequired,
  maxDaysOff: PropTypes.number.isRequired,
  onChangeDaysOff: PropTypes.func.isRequired,
  initialDaySelections: PropTypes.arrayOf(PropTypes.bool),
  onDaySelectionsChange: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    borderRadius: 5,
    width: '100%',
  },
  helperText: {
    marginTop: 5,
    color: '#555',
    fontSize: 12,
  },
});
