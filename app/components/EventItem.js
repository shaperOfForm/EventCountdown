// components/EventItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { parseISO, isValid } from 'date-fns';
import { computeAdjustedTime } from '../utils/dateUtils';

/**
 * Format a date string in the format "YYYY-MM-DDT08:00:00" into "MM-DD-YYYY"
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
  // 1) Format the display date.
  const displayDate = formatDateMMDDYYYY(event.eventDate);

  // 2) Compute the countdown to 8 AM.
  const countdownResult = computeAdjustedTime(
    event.eventDate,
    event.daysOff || 0,
    Array.isArray(event.daySelections) && event.daySelections.length === 7
      ? event.daySelections
      : [true, true, true, true, true, false, false],
    currentTime
  );

  // 3) Build the countdown content.
  let countdownContent;
  if (typeof countdownResult === 'string') {
    // Countdown is complete.
    countdownContent = countdownResult;
  } else {
    const { years, months, weeks, days, hours, totalDays } = countdownResult;
    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    if (weeks > 0) parts.push(`${weeks}w`);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    const countdownString = parts.length > 0 ? parts.join(',') : '<1h';

    let displayTotalDays;
    if (totalDays === 0 && (years + months + weeks + days + hours) > 0) {
      displayTotalDays = '<1 day';
    } else if (totalDays > 0 && hours > 0) {
      displayTotalDays = `<${totalDays + 1} total days`;
    } else {
      displayTotalDays = `${totalDays} total days`;
    }

    countdownContent = `${countdownString} - (${displayTotalDays})`;
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
        <Text style={styles.countdown}>{countdownContent}</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.eventActions}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => toggleSlidePanel(event, countdownResult)}
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
    backgroundColor: 'rgba(62, 16, 109, 0.3)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    // Shadow for a small card effect.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  dragHandle: {
    padding: 5,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragIcon: {
    color: '#FFFFFF',
    fontSize: 20,
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
    color: '#DDD',
    fontSize: 14,
  },
  countdown: {
    color: '#ff9e9e',
    fontSize: 14,
    marginTop: 5,
    fontStyle: 'italic',
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  detailsButton: {
    paddingHorizontal: 8,
    paddingVertical: 11,
    borderRadius: 8,
    marginRight: 5,
    backgroundColor: '#c4a2f5',
  },
  buttonText: {
    color: '#4B1382',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ff6b6b',
  },
  deleteButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 22,
  },
});
