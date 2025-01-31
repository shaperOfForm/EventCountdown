// HomeScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

import EventDetailPanel from './components/EventDetailPanel';
import AddEventForm from './components/AddEventForm';
import EventList from './components/EventList';

export default function HomeScreen() {
  const router = useRouter();
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  // --------------------
  // State: date form inputs
  // --------------------
  const [month, setMonth] = useState(String(tomorrow.getMonth() + 1).padStart(2, '0'));
  const [day, setDay] = useState(String(tomorrow.getDate()).padStart(2, '0'));
  const [year, setYear] = useState(String(tomorrow.getFullYear()));
  const [eventName, setEventName] = useState('');

  // --------------------
  // State: events list
  // --------------------
  const [events, setEvents] = useState([]);

  // --------------------
  // State: detail panel
  // --------------------
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEventCountdown, setSelectedEventCountdown] = useState(null);
  const [slideAnimation] = useState(new Animated.Value(300));

  // --------------------
  // State: "currentTime" updates once per hour
  // --------------------
  const [currentTime, setCurrentTime] = useState(new Date());

  // -------------- HELPER to compute a fresh countdown --------------
  const getCountdownForEvent = useCallback((ev) => {
    if (!ev) return null;
    const daySelections = Array.isArray(ev.daySelections) && ev.daySelections.length === 7
      ? ev.daySelections
      : [true, true, true, true, true, false, false];

    return computeAdjustedTime(ev.eventDate, ev.daysOff || 0, daySelections, currentTime);
  }, [currentTime]);

  // --------------------
  // Load events from AsyncStorage
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

  // --------------------------------------------------------------
  // Update "currentTime" once per hour, on the hour
  // --------------------------------------------------------------
  useEffect(() => {
    let hourTimer;

    const scheduleNextHour = () => {
      const now = new Date();
      // Next hour => same day/month, hour+1, minute=0, second=0
      const nextHour = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours() + 1,
        0,
        0,
        0
      );
      const msUntilNextHour = nextHour - now;

      hourTimer = setTimeout(() => {
        setCurrentTime(new Date());
        scheduleNextHour(); // schedule the following hour again
      }, msUntilNextHour);
    };

    scheduleNextHour();

    return () => clearTimeout(hourTimer);
  }, []);

  // --------------------
  // AUTO-REDIRECT to homepage event
  // --------------------
  useEffect(() => {
    const redirectToHomepage = async () => {
      try {
        const homepageEventId = await AsyncStorage.getItem('homepageEventId');
        if (homepageEventId && !hasAlreadyRedirected()) {
          const homepageEvent = events.find((event) => event.id === homepageEventId);
          if (homepageEvent) {
            console.log('Redirecting to FullScreenCountdown for Homepage Event:', homepageEvent);
            markRedirected();

            // Recompute countdown for that event
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
                countdown: freshCountdown ? JSON.stringify(freshCountdown) : undefined,
              },
            });
          } else {
            console.warn('Homepage Event ID not found. Removing homepageEventId.');
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

  // --------------------------------------------------------------
  // UPDATE FUNCTIONS (stable callbacks, functional setEvents)
  // --------------------------------------------------------------
  const updateEventDate = useCallback(async (eventId, newDateStr) => {
    try {
      setEvents((prevEvents) => {
        const updated = prevEvents.map((event) =>
          event.id === eventId ? { ...event, eventDate: newDateStr } : event
        );
        AsyncStorage.setItem('allEvents', JSON.stringify(updated));
        console.log('Event date updated successfully.');
        return updated;
      });
    } catch (err) {
      console.error('Error updating event date:', err);
      Alert.alert('Error', 'There was a problem updating the event date.');
    }
  }, []);

  const updateDaysOff = useCallback(async (eventId, newDaysOff) => {
    try {
      setEvents((prevEvents) => {
        const updated = prevEvents.map((event) =>
          event.id === eventId ? { ...event, daysOff: newDaysOff } : event
        );
        AsyncStorage.setItem('allEvents', JSON.stringify(updated));
        console.log('Days off updated successfully.');
        return updated;
      });
    } catch (err) {
      console.error('Error updating days off:', err);
      Alert.alert('Error', 'There was a problem updating the days off.');
    }
  }, []);

  const updateDaySelection = useCallback(async (eventId, dayIndex, isSelected) => {
    try {
      setEvents((prevEvents) => {
        const updated = prevEvents.map((event) => {
          if (event.id === eventId) {
            const newDaySelections = [...(event.daySelections || [true, true, true, true, true, false, false])];
            newDaySelections[dayIndex] = isSelected;
            return { ...event, daySelections: newDaySelections };
          }
          return event;
        });
        AsyncStorage.setItem('allEvents', JSON.stringify(updated));
        console.log('Day selection updated successfully.');
        return updated;
      });
    } catch (err) {
      console.error('Error updating day selection:', err);
      Alert.alert('Error', 'There was a problem updating the day selection.');
    }
  }, []);

  // ------------------
  // HOMEPAGE TOGGLE
  // ------------------
  const toggleHomepage = useCallback(async (eventId, countdown = null) => {
    try {
      setEvents((prevEvents) => {
        const updated = prevEvents.map((event) => {
          if (event.id === eventId) {
            return { ...event, isHomepageChecked: !event.isHomepageChecked };
          }
          // ensure only one homepage is checked by unchecking others
          return { ...event, isHomepageChecked: false };
        });

        AsyncStorage.setItem('allEvents', JSON.stringify(updated)).catch(console.error);

        const toggledEvent = updated.find((e) => e.id === eventId);
        const isNowHomepage = toggledEvent?.isHomepageChecked;

        if (isNowHomepage) {
          (async () => {
            await AsyncStorage.setItem('homepageEventId', eventId);
            console.log('Homepage set for Event ID:', eventId);
            markRedirected();

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
          })();
        } else {
          (async () => {
            await AsyncStorage.removeItem('homepageEventId');
            resetRedirected();
            console.log('Homepage unset for Event ID:', eventId);
          })();
        }

        return updated;
      });
    } catch (err) {
      console.error('Error toggling homepage:', err);
      Alert.alert('Error', 'There was a problem toggling the homepage checkbox.');
    }
  }, [getCountdownForEvent, router]);

  // --------------------------------------------------------------
  // ADD / DELETE
  // --------------------------------------------------------------
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
    // Validate date input
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
      setEvents((prevEvents) => {
        const updated = [...prevEvents, newEvent];
        AsyncStorage.setItem('allEvents', JSON.stringify(updated));
        console.log('Event added successfully:', newEvent);
        return updated;
      });

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
      setEvents((prevEvents) => {
        const updated = prevEvents.filter((event) => event.id !== eventId);
        AsyncStorage.setItem('allEvents', JSON.stringify(updated));
        console.log('Event deleted successfully:', eventId);
        return updated;
      });

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

  // --------------------------------------------------------------
  // DETAIL PANEL: open/close
  // --------------------------------------------------------------
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

  // --------------------------------------------------------------
  // REORDER HANDLING
  // --------------------------------------------------------------
  const handleDragEnd = ({ data }) => {
    console.log('Events reordered. New order:', data);
    setEvents(data);
    AsyncStorage.setItem('allEvents', JSON.stringify(data)).catch((err) => {
      console.error('Error saving reordered events:', err);
    });
  };

  // --------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------
  return (
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
          currentTime={currentTime} // optional usage in EventItem
        />

        {/* Detail Panel */}
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
  },
  container: {
    flex: 1,
    padding: 10,
  },
});
