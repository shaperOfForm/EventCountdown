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
          resizeMode="cover" // Ensure the image fills the width and fits the height
        />
      </View>

      {/* Stack Navigation */}
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: 80, // Specify the desired height for the header
    width: '100%', // Ensure it spans the full width of the container
  },
  headerImage: {
    flex: 1, // Allow the image to stretch and fill the container vertically
    width: '100%', // Ensure the image spans the full width
  },
});
