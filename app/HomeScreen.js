// HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import { parseISO, isValid, isAfter } from 'date-fns';
import { buildDateString, computeAdjustedTime } from './utils/dateUtils';
import { hasAlreadyRedirected, markRedirected, resetRedirected } from './utils/redirectFlag';
import EventDetailPanel from './components/EventDetailPanel';
import AddEventForm from './components/AddEventForm';
import EventList from './components/EventList';
import { useThemedColor } from './useThemedColor';

export default function HomeScreen() {
  const router = useRouter();

  // Compute themed background colors for HomeScreen
  const themedGradientColors = [useThemedColor('#792DE7'), useThemedColor('#4B1382')];
  const themedContainerBg = useThemedColor('#792DE7');

  // Set default date values using tomorrow’s date
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const defaultMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const defaultDay = String(tomorrow.getDate()).padStart(2, '0');
  const defaultYear = String(tomorrow.getFullYear());

  // State: Date Input Fields
  const [month, setMonth] = useState(defaultMonth);
  const [day, setDay] = useState(defaultDay);
  const [year, setYear] = useState(defaultYear);
  const [eventName, setEventName] = useState('');

  // State: Events & Detail Panel
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEventCountdown, setSelectedEventCountdown] = useState(null);
  const [slideAnimation] = useState(new Animated.Value(300));

  // State: Current Time (updates hourly)
  const [currentTime, setCurrentTime] = useState(new Date());

  const getCountdownForEvent = useCallback(
    (ev) => {
      if (!ev) return null;
      const daySelections =
        Array.isArray(ev.daySelections) && ev.daySelections.length === 7
          ? ev.daySelections
          : [true, true, true, true, true, false, false];
      return computeAdjustedTime(ev.eventDate, ev.daysOff || 0, daySelections, currentTime);
    },
    [currentTime]
  );

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const stored = await AsyncStorage.getItem('allEvents');
        if (stored) {
          setEvents(JSON.parse(stored));
        }
      } catch (err) {
        Alert.alert('Error', 'There was a problem loading your events.');
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    let hourTimer;
    const scheduleNextHour = () => {
      const now = new Date();
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
        scheduleNextHour();
      }, msUntilNextHour);
    };
    scheduleNextHour();
    return () => clearTimeout(hourTimer);
  }, []);

  useEffect(() => {
    const redirectToHomepage = async () => {
      try {
        const homepageEventId = await AsyncStorage.getItem('homepageEventId');
        if (homepageEventId && !hasAlreadyRedirected()) {
          const homepageEvent = events.find((event) => event.id === homepageEventId);
          if (homepageEvent) {
            markRedirected();
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
            await AsyncStorage.removeItem('homepageEventId');
            resetRedirected();
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (events.length > 0) {
      redirectToHomepage();
    }
  }, [events, router, getCountdownForEvent]);

  const updateEventDate = useCallback(async (eventId, newDateStr) => {
    try {
      setEvents((prevEvents) => {
        const updated = prevEvents.map((event) =>
          event.id === eventId ? { ...event, eventDate: newDateStr } : event
        );
        AsyncStorage.setItem('allEvents', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      Alert.alert('Error', 'Could not update the event date.');
    }
  }, []);

  const updateDaysOff = useCallback(async (eventId, newDaysOff) => {
    try {
      setEvents((prevEvents) => {
        const updated = prevEvents.map((event) =>
          event.id === eventId ? { ...event, daysOff: newDaysOff } : event
        );
        AsyncStorage.setItem('allEvents', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      Alert.alert('Error', 'Could not update the days off.');
    }
  }, []);

  const updateDaySelection = useCallback(async (eventId, dayIndex, isSelected) => {
    try {
      setEvents((prevEvents) => {
        const updated = prevEvents.map((event) => {
          if (event.id === eventId) {
            const newSelections = [...(event.daySelections || [true, true, true, true, true, false, false])];
            newSelections[dayIndex] = isSelected;
            return { ...event, daySelections: newSelections };
          }
          return event;
        });
        AsyncStorage.setItem('allEvents', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      Alert.alert('Error', 'Could not update the day selection.');
    }
  }, []);

  const toggleHomepage = useCallback(async (eventId, countdown = null) => {
    try {
      setEvents((prevEvents) => {
        const updated = prevEvents.map((event) => {
          if (event.id === eventId) {
            return { ...event, isHomepageChecked: !event.isHomepageChecked };
          }
          return { ...event, isHomepageChecked: false };
        });
        AsyncStorage.setItem('allEvents', JSON.stringify(updated));
        const toggledEvent = updated.find((e) => e.id === eventId);
        if (toggledEvent && toggledEvent.isHomepageChecked) {
          (async () => {
            await AsyncStorage.setItem('homepageEventId', eventId);
            markRedirected();
            let finalCountdown = countdown || getCountdownForEvent(toggledEvent);
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
          })();
        }
        return updated;
      });
    } catch (err) {
      Alert.alert('Error', 'Could not toggle the homepage setting.');
    }
  }, [getCountdownForEvent, router]);

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
    if (!month || !day || !year) {
      Alert.alert('Incomplete Fields', 'Please fill in all date fields.');
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
        return updated;
      });
      setEventName('');
      setMonth(defaultMonth);
      setDay(defaultDay);
      setYear(defaultYear);
    } catch (err) {
      Alert.alert('Error', 'There was a problem adding your event.');
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      setEvents((prevEvents) => {
        const updated = prevEvents.filter((event) => event.id !== eventId);
        AsyncStorage.setItem('allEvents', JSON.stringify(updated));
        return updated;
      });
      const homepageEventId = await AsyncStorage.getItem('homepageEventId');
      if (homepageEventId === eventId) {
        await AsyncStorage.removeItem('homepageEventId');
        resetRedirected();
      }
    } catch (err) {
      Alert.alert('Error', 'There was a problem deleting your event.');
    }
  };

  const toggleSlidePanel = (event, countdown) => {
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

  const handleDragEnd = ({ data }) => {
    setEvents(data);
    AsyncStorage.setItem('allEvents', JSON.stringify(data));
  };

  return (
    <LinearGradient colors={themedGradientColors} style={styles.gradientBackground}>
      <View style={[styles.container, { backgroundColor: themedContainerBg }]}>
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
  },
  container: {
    flex: 1,
    padding: 5,
  },
});
