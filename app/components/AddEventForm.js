// components/AddEventForm.js

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import EventDateInputs from './EventDateInputs'; // Your custom date pickers

export default function AddEventForm({
  month,
  setMonth,
  day,
  setDay,
  year,
  setYear,
  eventName,
  setEventName,
  onAddEvent,
}) {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.formHeader}>Add New Event</Text>

      {/* Date Inputs */}
      <EventDateInputs
        month={month}
        day={day}
        year={year}
        onDateChange={(newMonth, newDay, newYear) => {
          setMonth(newMonth);
          setDay(newDay);
          setYear(newYear);
        }}
      />

      {/* Event Name Input */}
      <TextInput
        placeholder="Event Name"
        value={eventName}
        onChangeText={setEventName}
        style={styles.input}
        placeholderTextColor="#555"
      />

      {/* Add Event Button */}
      <TouchableOpacity style={styles.addButton} onPress={onAddEvent}>
        <Text style={styles.addButtonText}>Add Event</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: 'rgba(62, 16, 109, 0.4)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    // Subtle shadow / elevation for a "card" look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  formHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#D9E3F0', // Light purple for inputs
    color: '#000',
    borderRadius: 8,
    padding: 10,
    marginVertical: 0,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#BFD6FF', // accent color
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#4B1382',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
