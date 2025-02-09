import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { parseISO, isValid } from 'date-fns';
import { computeAdjustedTime } from '../utils/dateUtils';
import { useThemedColor } from '../useThemedColor';

function formatDateMMDDYYYY(isoDateStr) {
  const dateObj = parseISO(isoDateStr);
  if (!isValid(dateObj)) return isoDateStr;
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

function EventItem({ event, toggleSlidePanel, deleteEvent, drag, currentTime }) {
  const white = useThemedColor('#FFFFFF');
  const lightGray = useThemedColor('#DDD');
  const countdownColor = useThemedColor('#ff9e9e');
  const detailsButtonBg = useThemedColor('#c4a2f5');
  const buttonTextColor = useThemedColor('#4B1382');
  const deleteButtonBg = useThemedColor('#ff6b6b');

  const displayDate = formatDateMMDDYYYY(event.eventDate);
  const countdownResult = computeAdjustedTime(
    event.eventDate,
    event.daysOff || 0,
    Array.isArray(event.daySelections) && event.daySelections.length === 7
      ? event.daySelections
      : [true, true, true, true, true, false, false],
    currentTime
  );

  let countdownContent;
  if (typeof countdownResult === 'string') {
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
      <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
        <Text style={[styles.dragIcon, { color: white }]}>≡</Text>
      </TouchableOpacity>
      <View style={styles.eventDetails}>
        <Text style={[styles.eventName, { color: white }]}>{event.name}</Text>
        <Text style={[styles.eventDate, { color: lightGray }]}>{displayDate}</Text>
        <Text style={[styles.countdown, { color: countdownColor }]}>{countdownContent}</Text>
      </View>
      <View style={styles.eventActions}>
        <TouchableOpacity
          style={[styles.detailsButton, { backgroundColor: detailsButtonBg }]}
          onPress={() => toggleSlidePanel(event, countdownResult)}
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>⚙</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Delete event?',
              'Are you sure you want to delete this event?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => deleteEvent(event.id),
                },
              ]
            );
          }}
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
    fontSize: 20,
  },
  eventDetails: {
    flex: 1,
  },
  eventName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  eventDate: {
    fontSize: 14,
  },
  countdown: {
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
  },
  buttonText: {
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

export default React.memo(EventItem);
