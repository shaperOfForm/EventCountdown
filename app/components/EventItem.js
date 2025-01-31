// components/EventItem.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { parseISO, isValid } from 'date-fns';
import { computeAdjustedTime } from '../utils/dateUtils';

/**
 * Format "YYYY-MM-DDT12:00:00" -> "MM-DD-YYYY"
 */
function formatDateMMDDYYYY(isoDateStr) {
  const dateObj = parseISO(isoDateStr);
  if (!isValid(dateObj)) {
    return isoDateStr; // fallback if invalid
  }
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

export default function EventItem({
  event,
  toggleSlidePanel,
  deleteEvent,
  drag,
  currentTime,
}) {
  // 1) Format display date
  const displayDate = formatDateMMDDYYYY(event.eventDate);

  // 2) Compute countdown
  const countdown = computeAdjustedTime(
    event.eventDate,
    event.daysOff || 0,
    event.daySelections?.length === 7
      ? event.daySelections
      : [true, true, true, true, true, false, false],
    currentTime
  );

  const { years, months, weeks, days, hours, totalDays } = countdown;

  // 3) Build short countdown
  const countdownString = [
    years > 0 ? `${years}y` : null,
    months > 0 ? `${months}m` : null,
    weeks > 0 ? `${weeks}w` : null,
    days > 0 ? `${days}d` : null,
    hours > 0 ? `${hours}h` : null,
  ]
    .filter(Boolean)
    .join(',');

  // 4) Display totalDays
  let displayTotalDays;
  if (totalDays === 0 && (years + months + weeks + days + hours) > 0) {
    displayTotalDays = '<1 day';
  } else if (totalDays > 0 && hours > 0) {
    displayTotalDays = `${totalDays + 1} total days`;
  } else {
    displayTotalDays = `${totalDays} total days`;
  }

  return (
    <View style={styles.eventItem}>
      {/* Draggable handle */}
      <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
        <Text style={styles.dragIcon}>≡</Text>
      </TouchableOpacity>

      {/* Event details */}
      <View style={styles.eventDetails}>
        <Text style={styles.eventName}>{event.name}</Text>
        <Text style={styles.eventDate}>{displayDate}</Text>
        <Text style={styles.countdown}>
          {countdownString || '<1h'} - ({displayTotalDays})
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.eventActions}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => toggleSlidePanel(event, countdown)}
        >
          <Text style={styles.buttonText}>⚙</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteEvent(event.id)}
        >
          <Text style={styles.deleteButtonText}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3E106D',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#999',
    // small card shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  dragHandle: {
    padding: 5,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragIcon: {
    color: '#FFFFFF',
    fontSize: 22,
  },
  eventDetails: {
    flex: 1,
  },
  eventName: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
  eventDate: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  countdown: {
    color: '#ff9e9e', // red color for highlight
    fontSize: 14,
    marginTop: 5,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  detailsButton: {
    padding: 7,
    borderRadius: 5,
    marginRight: 5,
    backgroundColor: '#999fff',
  },
  buttonText: {
    opacity: 1,
    color: '#4B1382',
    fontWeight: 'bold',
    fontSize: 24,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#999fff',
  },
  deleteButtonText: {
    color: '#FF0000',
    fontWeight: 'bold',
    fontSize: 22,
  },
});
