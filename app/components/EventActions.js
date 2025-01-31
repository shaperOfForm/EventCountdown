// components/EventActions.js

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const EventActions = ({ onSettingsPress, onDeletePress }) => {
  return (
    <View style={styles.eventActions}>
      <TouchableOpacity onPress={onSettingsPress}>
        <Text style={styles.gearIcon}>⚙</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDeletePress}>
        <Text style={styles.deleteIcon}>X</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  gearIcon: {
    fontSize: 30,
    color: 'black',
  },
  deleteIcon: {
    fontSize: 30,
    color: 'red',
    marginLeft: 10,
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default EventActions;
