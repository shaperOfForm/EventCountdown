import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import EventDateInputs from './EventDateInputs';
import { useThemedColor } from '../useThemedColor';
import { HueOffsetSlider } from '../_layout';

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
  const headerColor = useThemedColor('#FFFFFF');
  const inputBg = useThemedColor('#D9E3F0');
  const inputText = useThemedColor('#000000');
  const addButtonBg = useThemedColor('#BFD6FF');
  const addButtonText = useThemedColor('#4B1382');

  return (
    <View style={styles.formContainer}>
      <Text style={[styles.formHeader, { color: headerColor }]}>Add New Event</Text>
      <HueOffsetSlider style={{ marginVertical: -22.5 }} />
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
      <TextInput
        placeholder="Event Name"
        value={eventName}
        onChangeText={setEventName}
        style={[styles.input, { backgroundColor: inputBg, color: inputText }]}
        placeholderTextColor={useThemedColor('#999')}
      />
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: addButtonBg }]}
        onPress={onAddEvent}
      >
        <Text style={[styles.addButtonText, { color: addButtonText }]}>
          Add Event
        </Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  formHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: -7.5,
    textAlign: 'center',
  },
  input: {
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  addButton: {
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});
