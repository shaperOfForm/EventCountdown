import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, Dimensions } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { computeAdjustedTime } from './utils/dateUtils';
import { parseISO, isValid, isFuture } from 'date-fns';
import TimeRemaining from './components/TimeRemaining';
import { markRedirected } from './utils/redirectFlag';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemedColor } from './useThemedColor';
import tinycolor from 'tinycolor2';
import * as Notifications from 'expo-notifications';

// --- Responsive scaling helper ---
const { width } = Dimensions.get('window');
const guidelineBaseWidth = 350;
const scale = size => (width / guidelineBaseWidth) * size;

export default function FullScreenCountdown() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { eventName, eventDate, daysOff, daySelections, countdown } = params;

  // Convert daySelections into a boolean array (7 entries)
  const activeDaySelections =
    Array.isArray(daySelections) && daySelections.length === 7
      ? daySelections.map(val => val === 'true' || val === true)
      : [true, true, true, true, true, false, false];

  // Track current time locally; update it every minute
  const [currentTime, setCurrentTime] = useState(new Date());

  // State for daily notifications toggle and scheduled notification ID
  const [dailyEnabled, setDailyEnabled] = useState(false);
  const [dailyNotificationId, setDailyNotificationId] = useState(null);

  // Request notification permissions when the component mounts
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your settings to receive event alerts.'
        );
      }
    })();
  }, []);

  // Validate event details and redirect if needed
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

  // Schedule a one-time notification for the event time (works even in the background)
  useEffect(() => {
    const eventDateObj = parseISO(eventDate);
    if (isValid(eventDateObj) && isFuture(eventDateObj)) {
      const secondsUntilEvent = Math.ceil((eventDateObj.getTime() - Date.now()) / 1000);
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Event Reached',
          body: `The event "${eventName}" has been reached.`,
          sound: 'default',
        },
        trigger: { seconds: secondsUntilEvent },
      });
    }
  }, [eventName, eventDate]);

  // Update current time every minute so we can recalc the countdown
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60 * 1000);
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
  const finalCountdown = parsedCountdown
    ? parsedCountdown
    : computeAdjustedTime(
        eventDate,
        parseInt(daysOff || '0', 10),
        activeDaySelections,
        currentTime
      );

  // If countdown reaches zero, alert the user and redirect to main menu
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

  // Function to schedule a daily notification (fires at 9:00 AM daily)
  const scheduleDailyNotification = async () => {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Reminder',
          body: `Don't forget to check the countdown for "${eventName}".`,
          sound: 'default',
        },
        trigger: { hour: 9, minute: 0, repeats: true },
      });
      setDailyNotificationId(id);
    } catch (error) {
      console.error('Error scheduling daily notification:', error);
    }
  };

  // Function to cancel the daily notification
  const cancelDailyNotification = async () => {
    if (dailyNotificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(dailyNotificationId);
        setDailyNotificationId(null);
      } catch (error) {
        console.error('Error cancelling daily notification:', error);
      }
    }
  };

  // When the checkbox is toggled on, check/request permissions if necessary before scheduling daily notifications.
  const handleToggleDaily = async (newValue) => {
    if (newValue) {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            'Notifications Required',
            'Please enable notifications in your settings to receive daily reminders.'
          );
          setDailyEnabled(false);
          return;
        }
      }
      await scheduleDailyNotification();
    } else {
      await cancelDailyNotification();
    }
    setDailyEnabled(newValue);
  };

  // Themed colors for gradient and text
  const themedGradientColor1 = useThemedColor('#4B1382');
  const themedGradientColor2 = useThemedColor('#3E106D');
  const titleColor = useThemedColor('#FFFFFF');
  const dateColor = useThemedColor('#FFFFFF');
  const themedButtonColor = useThemedColor('#2277FF');

  // Create a semi-transparent container overlay color
  const baseContainerColor = '#4B1382';
  const themedContainerColorRaw = useThemedColor(baseContainerColor);
  const themedContainerColor = tinycolor(themedContainerColorRaw)
    .setAlpha(0.8)
    .toRgbString();

  // Format the event date as MM-DD-YYYY
  let formattedEventDate = eventDate;
  try {
    const dateObj = parseISO(eventDate);
    if (isValid(dateObj)) {
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      const yyyy = dateObj.getFullYear();
      formattedEventDate = `${mm}-${dd}-${yyyy}`;
    }
  } catch (error) {
    console.error('Error formatting eventDate', error);
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[themedGradientColor1, themedGradientColor2]}
        style={styles.gradientContainer}
        accessible
        accessibilityLabel={`Event countdown for ${eventName}`}
      >
        <View
          style={[styles.contentContainer, { backgroundColor: themedContainerColor }]}
          accessible
          accessibilityLabel={`Event details: ${eventName}, scheduled for ${formattedEventDate}`}
        >
          <Text style={[styles.title, { color: titleColor }]} allowFontScaling>
            {eventName || 'Unnamed Event'}
          </Text>
          <Text style={[styles.date, { color: dateColor }]} allowFontScaling>
            {formattedEventDate || 'Invalid Date'}
          </Text>
          <TimeRemaining
            timeRemaining={finalCountdown}
            hideLabel
            valueStyle={{ fontSize: scale(26) }}
          />
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={dailyEnabled}
              onValueChange={handleToggleDaily}
              color={dailyEnabled ? "#4630EB" : undefined}
            />
            <Text style={styles.checkboxLabel}>Turn on daily notifications</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title="Back to Main Menu"
              onPress={handleBackToMain}
              color={themedButtonColor}
              accessibilityRole="button"
              accessibilityLabel="Back to Main Menu"
              accessibilityHint="Navigates back to the main menu"
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
    paddingBottom: 0,
  },
  contentContainer: {
    flex: 1,
    maxWidth: '95%',
    minWidth: '75%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  title: {
    fontSize: scale(32),
    fontWeight: 'bold',
    marginBottom: scale(10),
    textAlign: 'center',
  },
  date: {
    fontSize: scale(24),
    marginBottom: scale(20),
    textAlign: 'center',
  },
  buttonContainer: {
    height: scale(100),
    justifyContent: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: scale(10),
  },
  checkboxLabel: {
    color: '#FFF',
    fontSize: scale(16),
    marginLeft: scale(8),
  },
});
