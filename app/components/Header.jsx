// components/Header.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemedColor } from '../useThemedColor';

export default function Header({ title, onClose }) {
  const titleColor = useThemedColor('#FFFFFF');
  const closeColor = useThemedColor('#FF0000');
  return (
    <View style={styles.headerContainer}>
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      <TouchableOpacity onPress={onClose}>
        <Text style={[styles.closeButton, { color: closeColor }]}>X</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 6,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
  },
});
