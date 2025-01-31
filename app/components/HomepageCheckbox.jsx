import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CheckBox from 'expo-checkbox';

export default function HomepageCheckbox({ isHomepageChecked, onToggleHomepage }) {
  return (
    <View style={styles.container}>
      <CheckBox
        value={isHomepageChecked}
        onValueChange={onToggleHomepage}
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
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
  },
});
