import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CheckBox from 'expo-checkbox';

export default function HomepageCheckbox({ isHomepageChecked, onToggleHomepage }) {
  return (
    <View style={styles.container}>
      <CheckBox
        value={isHomepageChecked}
        onValueChange={onToggleHomepage}
        color={isHomepageChecked ? '#FF6B6B' : undefined}
        style={styles.checkbox}
      />
      <Text style={styles.label}>Set as Homepage</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 15,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FFFFFF',
  },
  checkbox: {
    // Increase the size of the checkbox for better touch targets
    width: 24,
    height: 24,
  },
});
