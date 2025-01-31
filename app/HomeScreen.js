// HomeScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Added for background gradient
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import { parseISO, isValid, isAfter } from 'date-fns';

import { buildDateString, computeAdjustedTime } from './utils/dateUtils';
import {
  hasAlreadyRedirected,
  markRedirected,
  resetRedirected,
} from './utils/redirectFlag';

// ----- Components -----
import EventDetailPanel from './components/EventDetailPanel';
import AddEventForm from './components/AddEventForm';
import EventList from './components/EventList';

export default function HomeScreen() {
  const router = useRouter();
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  // Date input fields for adding a new event
  const [month, setMonth] = useState(String(tomorrow.getMonth() + 1).padStart(2, '0'));
  const [day, setDay] = useState(String(tomorrow.getDate()).padStart(2, '0'));
  const [year, setYear] = useState(String(tomorrow.getFullYear()));

  // Event name & list
  const [eventName, setEventName] = useState('');
  const [events, setEvents] = useState([]);

  // Detail panel
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [slideAnimation] = useState(new Animated.Value(300)); // Slide from right

  // For real-time countdown updates
  const [currentTime, setCurrentTime] = useState(new Date());

  // Store a precomputed countdown from EventItem (optional usage)
  const [selectedEventCountdown, setSelectedEventCountdown] = useState(null);

  // -------------- HELPER to compute a fresh countdown --------------
  const getCountdownForEvent = useCallback((ev) => {
    if (!ev) return null;
    const daySelections = Array.isArray(ev.daySelections) && ev.daySelections.length === 7
      ? ev.daySelections
      : [true, true, true, true, true, false, false];

    // Recompute on the fly:
    return computeAdjustedTime(ev.eventDate, ev.daysOff || 0, daySelections, currentTime);
  }, [currentTime]);
  // ---------------------------------------------------------------

  // --------------------
  // LOAD EVENTS & TIMER
  // --------------------
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const stored = await AsyncStorage.getItem('allEvents');
        if (stored) {
          const parsedEvents = JSON.parse(stored);
          setEvents(parsedEvents);
          console.log('Loaded events from AsyncStorage:', parsedEvents);
        } else {
          console.log('No events found in AsyncStorage.');
        }
      } catch (err) {
        console.error('Error loading events:', err);
        Alert.alert('Error', 'There was a problem loading your events.');
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  // --------------------
  // AUTO-REDIRECT
  // --------------------
  useEffect(() => {
    const redirectToHomepage = async () => {
      try {
        const homepageEventId = await AsyncStorage.getItem('homepageEventId');
        if (homepageEventId && !hasAlreadyRedirected()) {
          const homepageEvent = events.find(event => event.id === homepageEventId);
          if (homepageEvent) {
            console.log('Redirecting to FullScreenCountdown for Homepage Event:', homepageEvent);
            markRedirected();

            // Recompute a fresh countdown so you see correct time
            const freshCountdown = getCountdownForEvent(homepageEvent);

            router.replace({
              pathname: '/FullScreenCountdown',
              params: {
                eventName: homepageEvent.name,
                eventDate: homepageEvent.eventDate,
                daysOff: homepageEvent.daysOff ? String(homepageEvent.daysOff) : '0',
                daySelections: homepageEvent.daySelections
                  ? homepageEvent.daySelections.map((b) => b.toString())
                  : ['true', 'true', 'true', 'true', 'true', 'false', 'false'],
                // Pass precomputed countdown
                countdown: freshCountdown ? JSON.stringify(freshCountdown) : undefined,
              },
            });
          } else {
            console.warn('Homepage Event ID not found in events list. Removing homepageEventId.');
            await AsyncStorage.removeItem('homepageEventId');
            resetRedirected();
          }
        }
      } catch (err) {
        console.error('Error during homepage redirection:', err);
      }
    };

    if (events.length > 0) {
      redirectToHomepage();
    }
  }, [events, router, getCountdownForEvent]);

  // ------------------
  // UPDATE FUNCTIONS
  // ------------------
  const updateEventDate = useCallback(async (eventId, newDateStr) => {
    try {
      const updatedEvents = events.map((event) =>
        event.id === eventId ? { ...event, eventDate: newDateStr } : event
      );
      await AsyncStorage.setItem('allEvents', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
      console.log('Event date updated successfully.');
    } catch (err) {
      console.error('Error updating event date:', err);
      Alert.alert('Error', 'There was a problem updating the event date.');
    }
  }, [events]);

  const updateDaysOff = useCallback(async (eventId, newDaysOff) => {
    try {
      const updatedEvents = events.map((event) =>
        event.id === eventId ? { ...event, daysOff: newDaysOff } : event
      );
      await AsyncStorage.setItem('allEvents', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
      console.log('Days off updated successfully.');
    } catch (err) {
      console.error('Error updating days off:', err);
      Alert.alert('Error', 'There was a problem updating the days off.');
    }
  }, [events]);

  const updateDaySelection = useCallback(async (eventId, dayIndex, isSelected) => {
    try {
      const updatedEvents = events.map((event) => {
        if (event.id === eventId) {
          const updatedDaySelections = [
            ...(event.daySelections || [true, true, true, true, true, false, false]),
          ];
          updatedDaySelections[dayIndex] = isSelected;
          return { ...event, daySelections: updatedDaySelections };
        }
        return event;
      });
      await AsyncStorage.setItem('allEvents', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
      console.log('Day selection updated successfully.');
    } catch (err) {
      console.error('Error updating day selection:', err);
      Alert.alert('Error', 'There was a problem updating the day selection.');
    }
  }, [events]);

  // ------------------
  // HOMEPAGE TOGGLE
  // ------------------
  const toggleHomepage = useCallback(
    async (eventId, countdown = null) => {
      try {
        const updatedEvents = events.map((event) => {
          if (event.id === eventId) {
            // Toggle the isHomepageChecked
            return { ...event, isHomepageChecked: !event.isHomepageChecked };
          }
          // Ensure only one homepage by unchecking others
          return { ...event, isHomepageChecked: false };
        });

        const toggledEvent = updatedEvents.find(event => event.id === eventId);
        const isNowHomepage = toggledEvent.isHomepageChecked;

        if (isNowHomepage) {
          await AsyncStorage.setItem('homepageEventId', eventId);
          console.log('Homepage set for Event ID:', eventId);

          markRedirected(); // so we don't auto-redirect again

          // If no precomputed countdown is given, compute a fresh one
          let finalCountdown = countdown;
          if (!finalCountdown) {
            finalCountdown = getCountdownForEvent(toggledEvent);
          }

          router.replace({
            pathname: '/FullScreenCountdown',
            params: {
              eventName: toggledEvent.name,
              eventDate: toggledEvent.eventDate,
              daysOff: toggledEvent.daysOff ? String(toggledEvent.daysOff) : '0',
              daySelections: toggledEvent.daySelections
                ? toggledEvent.daySelections.map((b) => b.toString())
                : ['true', 'true', 'true', 'true', 'true', 'false', 'false'],
              countdown: finalCountdown ? JSON.stringify(finalCountdown) : undefined,
            },
          });
        } else {
          await AsyncStorage.removeItem('homepageEventId');
          resetRedirected();
          console.log('Homepage unset for Event ID:', eventId);
        }

        setEvents(updatedEvents);
        await AsyncStorage.setItem('allEvents', JSON.stringify(updatedEvents));
        console.log('Homepage checkbox toggled successfully.');
      } catch (err) {
        console.error('Error toggling homepage:', err);
        Alert.alert('Error', 'There was a problem toggling the homepage checkbox.');
      }
    },
    [events, router, getCountdownForEvent]
  );

  // ------------------
  // ADD / DELETE
  // ------------------
  const getNextEventNumber = () => {
    const usedNumbers = new Set();
    events.forEach((event) => {
      if (event.name.startsWith('Event #')) {
        const number = parseInt(event.name.replace('Event #', ''), 10);
        if (!isNaN(number)) usedNumbers.add(number);
      }
    });
    let n = 1;
    while (usedNumbers.has(n)) n++;
    return n;
  };

  const addEvent = async () => {
    // Ensure all date fields
    if (!month || !day || !year) {
      Alert.alert('Incomplete Fields', 'Please complete all date fields before adding an event.');
      return;
    }

    let eventDateStr;
    try {
      eventDateStr = buildDateString(parseInt(month, 10), parseInt(day, 10), parseInt(year, 10));
    } catch (error) {
      Alert.alert('Invalid Date', 'Please enter a valid date.');
      return;
    }

    const eventDate = parseISO(eventDateStr);
    if (!isValid(eventDate) || !isAfter(eventDate, new Date())) {
      Alert.alert('Invalid Date', 'Please enter a valid future date.');
      return;
    }

    const defaultTitle = `Event #${getNextEventNumber()}`;
    const newEvent = {
      id: uuidv4(),
      name: eventName.trim() || defaultTitle,
      eventDate: eventDateStr,
      daysOff: 0,
      daySelections: [true, true, true, true, true, false, false],
      isHomepageChecked: false,
    };

    try {
      const updatedEvents = [...events, newEvent];
      await AsyncStorage.setItem('allEvents', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
      console.log('Event added successfully:', newEvent);

      // Reset form fields
      setEventName('');
      setMonth(String(tomorrow.getMonth() + 1).padStart(2, '0'));
      setDay(String(tomorrow.getDate()).padStart(2, '0'));
      setYear(String(tomorrow.getFullYear()));

      Alert.alert('Success', 'Event added successfully.');
    } catch (err) {
      console.error('Error adding event:', err);
      Alert.alert('Error', 'There was a problem adding your event.');
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const updatedEvents = events.filter((event) => event.id !== eventId);
      await AsyncStorage.setItem('allEvents', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
      console.log('Event deleted successfully:', eventId);

      // If the deleted event was set as homepage, remove it
      const homepageEventId = await AsyncStorage.getItem('homepageEventId');
      if (homepageEventId === eventId) {
        await AsyncStorage.removeItem('homepageEventId');
        resetRedirected();
        console.log('Homepage was deleted. Redirect flag reset.');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      Alert.alert('Error', 'There was a problem deleting your event.');
    }
  };

  // ------------------
  // DETAIL PANEL
  // ------------------
  const toggleSlidePanel = (event, countdown) => {
    console.log('Opening EventDetailPanel for Event:', event);
    setSelectedEventId(event.id);
    setSelectedEventCountdown(countdown);

    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeSlidePanel = useCallback(() => {
    Animated.timing(slideAnimation, {
      toValue: 300,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setSelectedEventId(null);
      setSelectedEventCountdown(null);
    });
  }, [slideAnimation]);

  // ------------------
  // REORDER HANDLING
  // ------------------
  const handleDragEnd = ({ data }) => {
    console.log('Events reordered. New order:', data);
    setEvents(data);
    AsyncStorage.setItem('allEvents', JSON.stringify(data)).catch((err) => {
      console.error('Error saving reordered events:', err);
    });
  };

  // ------------------
  // RENDER
  // ------------------
  return (
    // Use a linear gradient background for a more polished look
    <LinearGradient
      colors={['#5A1E99', '#4B1382']}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        {/* Add Event Form */}
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

        {/* Event List */}
        <EventList
          events={events}
          toggleSlidePanel={toggleSlidePanel}
          deleteEvent={deleteEvent}
          handleDragEnd={handleDragEnd}
          currentTime={currentTime}
        />

        {/* Detail Panel */}
        {selectedEventId && (
          <EventDetailPanel
            slideAnimation={slideAnimation}
            selectedEvent={events.find(e => e.id === selectedEventId)}
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
  },
  container: {
    flex: 1,
    padding: 10,
  },
});
