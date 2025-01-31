// EventForm.js

import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import EventDateInputs from './EventDateInputs';
import { getMaxAllowableDate } from '../utils/dateUtils';

export default function EventForm({ onSave, onCancel }) {
  const [eventName, setEventName] = useState('');

  // Default to today's date + 1 day, for example
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const defaultMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const defaultDay = String(tomorrow.getDate()).padStart(2, '0');
  const defaultYear = String(tomorrow.getFullYear());

  const [month, setMonth] = useState(defaultMonth);
  const [day, setDay] = useState(defaultDay);
  const [year, setYear] = useState(defaultYear);

  const maxDate = getMaxAllowableDate();

  const handleDateChange = (newMonth, newDay, newYear) => {
    setMonth(newMonth);
    setDay(newDay);
    setYear(newYear);
  };

  const handleSave = () => {
    if (!month || !day || !year) {
      Alert.alert('Invalid Date', 'Please select a valid date.');
      return;
    }

    // Combine into "YYYY-MM-DD"
    const dateString = `${year}-${month}-${day}`; // e.g. "2025-01-24"

    // Validate if it’s <= maxAllowableDate
    // We'll parse it as local midnight
    const [yyyy, mm, dd] = dateString.split('-').map(Number);
    const localDate = new Date(yyyy, mm - 1, dd); // local midnight
    if (localDate > maxDate) {
      Alert.alert(
        'Invalid Date',
        `Event date cannot exceed ${maxDate.toDateString()}.`
      );
      return;
    }

    const newEvent = {
      name: eventName.trim() || 'Untitled Event',
      // store just YYYY-MM-DD
      eventDate: dateString,
    };

    onSave(newEvent);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.formHeader}>Add New Event</Text>

      <TextInput
        placeholder="Event Name"
        value={eventName}
        onChangeText={setEventName}
        style={styles.input}
        placeholderTextColor="#AAAAAA"
      />

      <EventDateInputs
        month={month}
        day={day}
        year={year}
        onDateChange={handleDateChange}
      />

      <View style={styles.buttonContainer}>
        <Button title="Save Event" onPress={handleSave} color="#28a745" />
        <View style={styles.buttonSpacer} />
        <Button title="Cancel" onPress={onCancel} color="#dc3545" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#4B1382',
  },
  formHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#3E106D',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonSpacer: {
    width: 20,
  },
});
