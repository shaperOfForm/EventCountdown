// components/DaysOffInput.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

export default function DaysOffInput({
  initialDaysOff = 0,
  maxDaysOff,
  onSubmitDaysOff = null,
  initialDaySelections = [true, true, true, true, true, false, false],
  onDaySelectionsChange = null,
}) {
  // Store the input as a string for the TextInput
  const [localDaysOff, setLocalDaysOff] = useState(String(initialDaysOff));
  // Keep track of the last valid value so we can revert if necessary
  const [previousValidDaysOff, setPreviousValidDaysOff] = useState(String(initialDaysOff));
  // Store the day-of-week checkbox selections (even if not rendered here)
  const [daySelections, setDaySelections] = useState(initialDaySelections);

  // When the parent updates initialDaysOff, update local state and previous value.
  useEffect(() => {
    const initialValue = String(initialDaysOff);
    setLocalDaysOff(initialValue);
    setPreviousValidDaysOff(initialValue);
  }, [initialDaysOff]);

  // Sync the day selections if they change externally.
  useEffect(() => {
    setDaySelections(initialDaySelections);
  }, [initialDaySelections]);

  // Handle text changes with the following logic:
  // 1. If the current value is "0" and the new input is longer than one digit,
  //    remove the leading zero(s).
  // 2. If the new numeric value exceeds maxDaysOff, revert to the previous valid value.
  // 3. Otherwise, update the input and store the new value as valid.
  const handleTextChange = (text) => {
    // Remove leading zeros if the field is exactly "0" and more digits are added
    if (localDaysOff === '0' && text.length > 1) {
      text = text.replace(/^0+/, '');
    }

    // Allow empty text (the user might be deleting)
    if (text === '') {
      setLocalDaysOff(text);
      return;
    }

    // Convert text to a number (if possible)
    const numericValue = parseInt(text, 10);

    if (!isNaN(numericValue)) {
      if (numericValue > maxDaysOff) {
        // If the new number exceeds the maximum allowed, revert to the previous valid value
        setLocalDaysOff(previousValidDaysOff);
        return;
      } else {
        // Valid input—update both the local state and the previous valid value
        setLocalDaysOff(text);
        setPreviousValidDaysOff(text);
      }
    } else {
      // In case text is not a valid number, just update the state (this branch is precautionary)
      setLocalDaysOff(text);
    }
  };

  // When the input loses focus, call the parent's submission callback if provided.
  const handleBlur = () => {
    if (onSubmitDaysOff) {
      onSubmitDaysOff(localDaysOff);
    }
  };

  // (If needed, handle checkbox changes with this function.)
  const handleDaySelectionChange = (index, isSelected) => {
    const updatedSelections = [...daySelections];
    updatedSelections[index] = isSelected;
    setDaySelections(updatedSelections);
    if (onDaySelectionsChange) {
      onDaySelectionsChange(updatedSelections);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Days Off:</Text>
      <TextInput
        style={styles.input}
        value={localDaysOff}
        onChangeText={handleTextChange}
        onBlur={handleBlur}
        keyboardType="numeric"
        maxLength={5} // Allow up to 5 digits
        placeholder={`0 - ${maxDaysOff}`}
        placeholderTextColor="#888"
      />
      <Text style={styles.helperText}>Max Days Off: {maxDaysOff}</Text>
    </View>
  );
}

DaysOffInput.propTypes = {
  initialDaysOff: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxDaysOff: PropTypes.number.isRequired,
  onSubmitDaysOff: PropTypes.func,
  initialDaySelections: PropTypes.arrayOf(PropTypes.bool),
  onDaySelectionsChange: PropTypes.func,
};

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
    color: '#888888',
    fontSize: 12,
  },
});
