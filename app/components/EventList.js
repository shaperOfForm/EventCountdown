// components/EventList.js
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

  // Filter out events that exceed maxDate
  const validEvents = events.filter(
    (event) => new Date(event.eventDate) <= maxDate
  );

  const renderItem = ({ item, drag }) => (
    <EventItem
      event={item}
      toggleSlidePanel={toggleSlidePanel}
      deleteEvent={deleteEvent}
      drag={drag}
      currentTime={currentTime}
    />
  );

  return (
    <View style={styles.eventContainer}>
      {validEvents.length === 0 ? (
        <Text style={styles.emptyText}>
          No valid events added yet. Start by adding one!
        </Text>
      ) : (
        <DraggableFlatList
          data={validEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onDragEnd={handleDragEnd}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  eventContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#EFEFEF',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
