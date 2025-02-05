// components/FullScreenCountdown.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { computeAdjustedTime } from './utils/dateUtils';
import { parseISO, isValid, isFuture } from 'date-fns';
import TimeRemaining from './components/TimeRemaining';
import { markRedirected } from './utils/redirectFlag';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemedColor } from './useThemedColor';
import tinycolor from 'tinycolor2';

export default function FullScreenCountdown() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Pull out params
  const { eventName, eventDate, daysOff, daySelections, countdown } = params;

  // Convert daySelections into a boolean array (7 entries)
  const activeDaySelections =
    Array.isArray(daySelections) && daySelections.length === 7
      ? daySelections.map((val) => val === 'true' || val === true)
      : [true, true, true, true, true, false, false];

  // Track current time locally; update it every minute
  const [currentTime, setCurrentTime] = useState(new Date());

  // Basic validation of event details
  useEffect(() => {
    if (!eventName || !eventDate) {
      Alert.alert(
        'Invalid Event',
        'Event details are missing or incomplete. Redirecting to the main menu.',
        [{ text: 'OK', onPress: () => router.replace('/') }],
        { cancelable: false }
      );
      return;
    }

    if (typeof eventDate !== 'string') {
      Alert.alert(
        'Invalid Date Format',
        'The event date format is incorrect. Redirecting to the main menu.',
        [{ text: 'OK', onPress: () => router.replace('/') }],
        { cancelable: false }
      );
      return;
    }

    const eventDateObj = parseISO(eventDate);
    if (!isValid(eventDateObj)) {
      Alert.alert(
        'Invalid Date',
        'The event date is invalid. Redirecting to the main menu.',
        [{ text: 'OK', onPress: () => router.replace('/') }],
        { cancelable: false }
      );
      return;
    }

    if (!isFuture(eventDateObj)) {
      Alert.alert(
        'Event Passed',
        'The event date has already passed. Redirecting to the main menu.',
        [{ text: 'OK', onPress: () => router.replace('/') }],
        { cancelable: false }
      );
    }
  }, [eventName, eventDate, router]);

  // Update currentTime every minute so we can recalc the countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // Parse precomputed countdown if passed
  let parsedCountdown;
  if (countdown) {
    try {
      parsedCountdown = JSON.parse(countdown);
    } catch (err) {
      console.warn('Failed to parse countdown param', err);
    }
  }

  // Compute final countdown
  let finalCountdown;
  if (parsedCountdown) {
    finalCountdown = parsedCountdown;
  } else {
    finalCountdown = computeAdjustedTime(
      eventDate,
      parseInt(daysOff || '0', 10),
      activeDaySelections,
      currentTime
    );
  }

  // If countdown is fully zero, redirect out
  useEffect(() => {
    if (
      finalCountdown.years === 0 &&
      finalCountdown.months === 0 &&
      finalCountdown.weeks === 0 &&
      finalCountdown.days === 0 &&
      finalCountdown.hours === 0
    ) {
      Alert.alert(
        'Event Reached',
        'The event date has been reached. Redirecting to the main menu.',
        [{ text: 'OK', onPress: () => router.replace('/') }],
        { cancelable: false }
      );
    }
  }, [finalCountdown, router]);

  function handleBackToMain() {
    markRedirected();
    router.replace('/');
  }

  // Get themed colors for the gradient and texts.
  const themedGradientColor1 = useThemedColor('#4B1382'); // Base gradient color 1
  const themedGradientColor2 = useThemedColor('#3E106D'); // Base gradient color 2
  const titleColor = useThemedColor('#FFFFFF'); // Title text color
  const dateColor = useThemedColor('#FFFFFF');  // Date text color

  // For the content container, we want a solid overlay that shows the gradient behind it.
  // We use a base color (same as the gradient start) and apply the hue shift.
  // Then we apply an alpha value for transparency.
  const baseContainerColor = '#4B1382';
  const themedContainerColorRaw = useThemedColor(baseContainerColor);
  const themedContainerColor = tinycolor(themedContainerColorRaw)
    .setAlpha(0.8)
    .toRgbString();
  
  // Compute a themed button color (you can choose your base button color).
  const themedButtonColor = useThemedColor('#2277FF');

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[themedGradientColor1, themedGradientColor2]}
        style={styles.gradientContainer}
      >
        {/* Use the original container width/style (as before) */}
        <View style={[styles.contentContainer, { backgroundColor: themedContainerColor }]}>
          <Text style={[styles.title, { color: titleColor }]}>{eventName || 'Unnamed Event'}</Text>
          <Text style={[styles.date, { color: dateColor }]}>{eventDate || 'Invalid Date'}</Text>

          <TimeRemaining timeRemaining={finalCountdown} />

          <View style={styles.buttonContainer}>
            <Button title="Back to Main Menu" onPress={handleBackToMain} color={themedButtonColor} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  contentContainer: {
    flex: 1,
    // Remove or do not override width so it remains as originally styled.
    // In the original code, the container style was used for both the gradient and the inner view.
    // We'll assume the original style did not force a specific width.
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  date: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    height: 100,
  },
});
