// components/EventNameDisplay.js

// components/EventNameDisplay.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO, isValid } from 'date-fns';

/**
 * EventNameDisplay Component
 * Displays the event name and its corresponding date.
 */
export default function EventNameDisplay({ eventName, eventDate }) {
  const getFormattedDate = (dateStr) => {
    try {
      const dateObj = parseISO(dateStr);
      if (isValid(dateObj)) {
        return format(dateObj, 'MMMM do, yyyy'); // e.g., January 1st, 2025
      } else {
        console.warn('Invalid date provided:', dateStr);
        return dateStr;
      }
    } catch (error) {
      console.error('Error parsing date:', error);
      return dateStr;
    }
  };

  const formattedDate = getFormattedDate(eventDate);

  return (
    <View style={styles.container}>
      <Text style={styles.name}>
        {eventName}: <Text style={styles.date}>{formattedDate}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  name: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  date: {
    color: '#FFD700', // gold accent
    fontWeight: 'normal',
  },
});
