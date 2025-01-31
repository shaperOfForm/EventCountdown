// components/FullScreenCountdown.js

import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { computeAdjustedTime } from './utils/dateUtils';
import { parseISO, isValid, isFuture } from 'date-fns';
import TimeRemaining from './components/TimeRemaining';
import { markRedirected } from './utils/redirectFlag'; // ADDED

export default function FullScreenCountdown() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Pull out params
  const { eventName, eventDate, daysOff, daySelections, countdown } = params;

  // Safely convert daySelections into boolean array (7 entries)
  const activeDaySelections =
    Array.isArray(daySelections) && daySelections.length === 7
      ? daySelections.map((val) => val === 'true' || val === true)
      : [true, true, true, true, true, false, false];

  // We'll track the "current time" locally and update it every minute
  const [currentTime, setCurrentTime] = useState(new Date());

  // Basic validation of event date and initial checks
  useEffect(() => {
    if (!eventName || !eventDate) {
      Alert.alert(
        'Invalid Event',
        'Event details are missing or incomplete. Redirecting to the main menu.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ],
        { cancelable: false }
      );
      return;
    }

    if (typeof eventDate !== 'string') {
      Alert.alert(
        'Invalid Date Format',
        'The event date format is incorrect. Redirecting to the main menu.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ],
        { cancelable: false }
      );
      return;
    }

    const eventDateObj = parseISO(eventDate);
    if (!isValid(eventDateObj)) {
      Alert.alert(
        'Invalid Date',
        'The event date format is invalid. Redirecting to the main menu.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ],
        { cancelable: false }
      );
      return;
    }

    if (!isFuture(eventDateObj)) {
      Alert.alert(
        'Event Passed',
        'The event date has already passed. Redirecting to the main menu.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ],
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

  // If a precomputed countdown was passed, parse it
  let parsedCountdown;
  if (countdown) {
    try {
      parsedCountdown = JSON.parse(countdown);
    } catch (err) {
      console.warn('Failed to parse countdown param', err);
    }
  }

  // If we have a stored countdown, let's use that.
  // Otherwise, compute dynamically as before.
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

  // If countdown is fully zero, we can redirect out
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
        [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ],
        { cancelable: false }
      );
    }
  }, [finalCountdown, router]);

  // Mark we've redirected so Home won't auto-redirect again,
  // then go back to main
  function handleBackToMain() {
    markRedirected();
    router.replace('/');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{eventName || 'Unnamed Event'}</Text>
      <Text style={styles.date}>{eventDate || 'Invalid Date'}</Text>

      {/* Display finalCountdown using TimeRemaining */}
      <TimeRemaining timeRemaining={finalCountdown} />

      <Button title="Back to Main Menu" onPress={handleBackToMain} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4B1382',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  date: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
});
