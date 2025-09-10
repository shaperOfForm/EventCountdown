// app/components/EventList.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { getMaxAllowableDate } from '../utils/dateUtils';
import EventItem from './EventItem';

export default function EventList({
  events,
  toggleSlidePanel,
  deleteEvent,
  handleDragEnd,
  currentTime,
}) {
  const maxDate = getMaxAllowableDate();
  const validEvents = events.filter(
    (e) => new Date(e.eventDate) <= maxDate
  );

  if (validEvents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No valid events added yet. Start by adding one!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.eventContainer}>
      <DraggableFlatList
      style={{ flex: 1, overflowY: 'auto' }}
        data={validEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item, drag }) => (
          <EventItem
            event={item}
            toggleSlidePanel={toggleSlidePanel}
            deleteEvent={deleteEvent}
            drag={drag}
            currentTime={currentTime}
          />
        )}
        onDragEnd={({ data }) => handleDragEnd({ data })}
        activationDistance={1}
        activationDelay={0}
        dragItemOverflow
        enableAutoscroll
        autoscrollThreshold={40}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  eventContainer: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: 10,
    overflowY: 'scroll',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#EFEFEF',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
