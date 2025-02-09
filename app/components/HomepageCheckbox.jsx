import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CheckBox from 'expo-checkbox';

function HomepageCheckbox({ isHomepageChecked, onToggleHomepage }) {
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
    width: 24,
    height: 24,
  },
});

export default React.memo(HomepageCheckbox);
