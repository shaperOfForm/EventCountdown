// app/HomeScreen.js
import * as Crypto from 'expo-crypto';
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { parseISO, isValid, isAfter } from 'date-fns';
import { buildDateString, computeAdjustedTime } from './utils/dateUtils';
import {
  hasAlreadyRedirected,
  markRedirected,
  resetRedirected,
} from './utils/redirectFlag';
import AddEventForm from './components/AddEventForm';
import EventList from './components/EventList';
import EventDetailPanel from './components/EventDetailPanel';
import { useThemedColor } from './useThemedColor';
import { HueOffsetSlider } from './_layout';


export default function HomeScreen() {
  const router = useRouter();
  const gradientColors = [useThemedColor('#792DE7'), useThemedColor('#4B1382')];
  const containerBg = useThemedColor('#792DE7');

  // Default to tomorrow at 08:00
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const defaultMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const defaultDay = String(tomorrow.getDate()).padStart(2, '0');
  const defaultYear = String(tomorrow.getFullYear());

  const [month, setMonth] = useState(defaultMonth);
  const [day, setDay] = useState(defaultDay);
  const [year, setYear] = useState(defaultYear);
  const [eventName, setEventName] = useState('');

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEventCountdown, setSelectedEventCountdown] = useState(null);
  const [slideAnimation] = useState(new Animated.Value(300));
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load saved events on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('allEvents');
        if (raw) setEvents(JSON.parse(raw));
      } catch {
        Alert.alert('Error', 'Could not load events.');
      }
    })();
  }, []);

  // Update currentTime on the hour
  useEffect(() => {
    let timer;
    const tick = () => {
      const now = new Date();
      const nextHour = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours() + 1,
        0,
        0
      );
      timer = setTimeout(() => {
        setCurrentTime(new Date());
        tick();
      }, nextHour - now);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  // Redirect to full-screen countdown if homepageEventId is set
  useEffect(() => {
    if (!events.length) return;
    (async () => {
      try {
        const homeId = await AsyncStorage.getItem('homepageEventId');
        if (homeId && !hasAlreadyRedirected()) {
          const ev = events.find((e) => e.id === homeId);
          if (ev) {
            markRedirected();
            const fresh = computeAdjustedTime(
              ev.eventDate,
              ev.daysOff || 0,
              ev.daySelections,
              currentTime
            );
            router.replace({
              pathname: '/FullScreenCountdown',
              params: {
                eventName: ev.name,
                eventDate: ev.eventDate,
                daysOff: String(ev.daysOff || 0),
                daySelections: ev.daySelections.map((b) => String(b)),
                countdown: fresh ? JSON.stringify(fresh) : undefined,
              },
            });
            return;
          } else {
            await AsyncStorage.removeItem('homepageEventId');
            resetRedirected();
          }
        }
      } catch {
        // ignore
      }
    })();
  }, [events, router, currentTime]);

  // Slide-in panel handlers
  const toggleSlidePanel = (event, countdown) => {
    setSelectedEventId(event.id);
    setSelectedEventCountdown(countdown);
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSlidePanel = useCallback(() => {
    Animated.timing(slideAnimation, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedEventId(null);
      setSelectedEventCountdown(null);
    });
  }, [slideAnimation]);

  // Add new event
  const addEvent = async () => {
    let dateStr;
    try {
      dateStr = buildDateString(
        parseInt(month, 10),
        parseInt(day, 10),
        parseInt(year, 10)
      );
    } catch {
      return Alert.alert('Invalid Date', 'Please enter a valid date.');
    }
    const dt = parseISO(dateStr);
    if (!isValid(dt) || !isAfter(dt, new Date())) {
      return Alert.alert('Invalid Date', 'Please enter a future date.');
    }

    const usedNumbers = new Set(
      events
        .map((e) => e.name.match(/^Event #(\d+)$/)?.[1])
        .filter(Boolean)
        .map(Number)
    );
    let nextNum = 1;
    while (usedNumbers.has(nextNum)) nextNum++;
    const name = eventName.trim() || `Event #${nextNum}`;

    const newEv = {
      id: Crypto.randomUUID(),
      name,
      eventDate: dateStr,
      daysOff: 0,
      daySelections: [true, true, true, true, true, false, false],
      isHomepageChecked: false,
    };

    const updated = [...events, newEv];
    setEvents(updated);
    try {
      await AsyncStorage.setItem('allEvents', JSON.stringify(updated));
    } catch {
      console.warn('Failed to save event');
    }

    setEventName('');
    setMonth(defaultMonth);
    setDay(defaultDay);
    setYear(defaultYear);
  };

  // Update event date
  const updateEventDate = async (id, newDate) => {
    try {
      const updated = events.map((e) =>
        e.id === id ? { ...e, eventDate: newDate } : e
      );
      setEvents(updated);
      await AsyncStorage.setItem('allEvents', JSON.stringify(updated));
    } catch {
      Alert.alert('Error', 'Could not update date.');
    }
  };

  // Update days off
  const updateDaysOff = async (id, daysOff) => {
    try {
      const updated = events.map((e) =>
        e.id === id ? { ...e, daysOff } : e
      );
      setEvents(updated);
      await AsyncStorage.setItem('allEvents', JSON.stringify(updated));
    } catch {
      Alert.alert('Error', 'Could not update days off.');
    }
  };

  // Update day selections
  const updateDaySelection = async (id, idx, isSelected) => {
    try {
      const updated = events.map((e) => {
        if (e.id === id) {
          const sel = [...e.daySelections];
          sel[idx] = isSelected;
          return { ...e, daySelections: sel };
        }
        return e;
      });
      setEvents(updated);
      await AsyncStorage.setItem('allEvents', JSON.stringify(updated));
    } catch {
      Alert.alert('Error', 'Could not update selections.');
    }
  };

  // Delete an event
  const deleteEvent = async (id) => {
    try {
      const updated = events.filter((e) => e.id !== id);
      setEvents(updated);
      await AsyncStorage.setItem('allEvents', JSON.stringify(updated));
      const homeId = await AsyncStorage.getItem('homepageEventId');
      if (homeId === id) {
        await AsyncStorage.removeItem('homepageEventId');
        resetRedirected();
      }
    } catch {
      Alert.alert('Error', 'Could not delete event.');
    }
  };

  // Toggle homepage setting
  const toggleHomepage = useCallback(
    async (id, countdown) => {
      try {
        const updated = events.map((e) => ({
          ...e,
          isHomepageChecked: e.id === id ? !e.isHomepageChecked : false,
        }));
        setEvents(updated);
        await AsyncStorage.setItem('allEvents', JSON.stringify(updated));

        const toggled = updated.find((e) => e.id === id);
        if (toggled.isHomepageChecked) {
          await AsyncStorage.setItem('homepageEventId', id);
          markRedirected();
          const fresh = countdown
            || computeAdjustedTime(
              toggled.eventDate,
              toggled.daysOff,
              toggled.daySelections,
              currentTime
            );
          router.replace({
            pathname: '/FullScreenCountdown',
            params: {
              eventName: toggled.name,
              eventDate: toggled.eventDate,
              daysOff: String(toggled.daysOff),
              daySelections: toggled.daySelections.map((b) => String(b)),
              countdown: fresh ? JSON.stringify(fresh) : undefined,
            },
          });
        } else {
          await AsyncStorage.removeItem('homepageEventId');
          resetRedirected();
        }
      } catch {
        Alert.alert('Error', 'Could not toggle homepage.');
      }
    },
    [events, router, currentTime]
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    async ({ data }) => {
      setEvents(data);
      await AsyncStorage.setItem('allEvents', JSON.stringify(data));
    },
    []
  );

  return (
    <LinearGradient colors={gradientColors} style={styles.gradientBackground}>
      <View style={[styles.container, { backgroundColor: containerBg }]}>
        <AddEventForm
          month={month}
          setMonth={setMonth}
          day={day}
          setDay={setDay}
          year={year}
          setYear={setYear}
          eventName={eventName}
          setEventName={setEventName}
          onAddEvent={addEvent}
        />

        <EventList
          events={events}
          toggleSlidePanel={toggleSlidePanel}
          deleteEvent={deleteEvent}
          handleDragEnd={handleDragEnd}
          currentTime={currentTime}
        />

        {selectedEventId && (
          <EventDetailPanel
            slideAnimation={slideAnimation}
            selectedEvent={events.find((e) => e.id === selectedEventId)}
            closePanel={closeSlidePanel}
            updateEventDate={updateEventDate}
            updateDaysOff={updateDaysOff}
            updateDaySelection={updateDaySelection}
            selectedCountdown={selectedEventCountdown}
            toggleHomepage={toggleHomepage}
            currentTime={currentTime}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    minHeight: 0,
  },
  container: {
    flex: 1,
    padding: 5,
    minHeight: 0,
  },
});
