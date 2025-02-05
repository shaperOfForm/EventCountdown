// app/layout.jsx
import React from 'react';
import { Stack } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';

export default function Layout() {
  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../assets/images/design.png')} // Adjust the path if needed
          style={styles.headerImage}
          resizeMode="cover"
        />
      </View>
      {/* Stack Navigation – provides the router context */}
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { height: 80, width: '100%' },
  headerImage: { flex: 1, width: '100%' },
});
