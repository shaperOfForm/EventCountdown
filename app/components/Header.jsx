import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemedColor } from '../useThemedColor';

function Header({ title, onClose }) {
  const titleColor = useThemedColor('#FFFFFF');
  const closeColor = useThemedColor('#FF0000');
  return (
    <View style={styles.headerContainer}>
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      <TouchableOpacity onPress={onClose}
        style={styles.closeTouch}
        accessibilityRole="button"
        accessibilityLabel="Close">
        <Text style={[styles.closeButton, { color: closeColor }]}>X</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: 17,
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
    flexShrink: 1,
    top: 17,
  },
  closeTouch: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    fontSize: 24,
    lineHeight: 24,
    textAlign: 'center',
    top: 17,
  },
});

export default React.memo(Header);
