// components/EventDetailPanel.js

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Animated,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  Alert,
} from 'react-native';
import PropTypes from 'prop-types';
import Header from './Header';
import TimeRemaining from './TimeRemaining';
import PanelDateInput from './PanelDateInput';
import DaysOffInput from './DaysOffInput';
import DaysActiveCheckboxes from './DaysActiveCheckboxes';
import HomepageCheckbox from './HomepageCheckbox';
import { parseLocalDateOnly, buildDateString, computeAdjustedTime } from '../utils/dateUtils';

export default function EventDetailPanel({
  slideAnimation,
  selectedEvent,
  selectedCountdown,
  closePanel,
  updateEventDate,
  updateDaysOff,
  updateDaySelection,
  toggleHomepage,
  currentTime,
}) {
  const [localMonth, setLocalMonth] = useState('');
  const [localDay, setLocalDay] = useState('');
  const [localYear, setLocalYear] = useState('');
  const [localDaysOff, setLocalDaysOff] = useState(0);
  const [localDaySelections, setLocalDaySelections] = useState(
    [true, true, true, true, true, false, false]
  );

  const isFirstRun = useRef(true);

  // Initialize local states from selectedEvent
  useEffect(() => {
    if (!selectedEvent) return;

    const dateObj = parseLocalDateOnly(selectedEvent.eventDate);
    if (!isNaN(dateObj)) {
      setLocalMonth(String(dateObj.getMonth() + 1).padStart(2, '0'));
      setLocalDay(String(dateObj.getDate()).padStart(2, '0'));
      setLocalYear(String(dateObj.getFullYear()));
    }

    setLocalDaysOff(selectedEvent.daysOff || 0);

    if (Array.isArray(selectedEvent.daySelections) && selectedEvent.daySelections.length === 7) {
      setLocalDaySelections(selectedEvent.daySelections);
    } else {
      setLocalDaySelections([true, true, true, true, true, false, false]);
    }
  }, [selectedEvent]);

  // If local date changes, update parent (which updates storage)
  useEffect(() => {
    if (!selectedEvent || isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (!localMonth || !localDay || !localYear) return;

    const newDateStr = buildDateString(localMonth, localDay, localYear);
    if (newDateStr !== selectedEvent.eventDate) {
      const newDateObj = parseLocalDateOnly(newDateStr);
      if (newDateObj > currentTime) {
        updateEventDate(selectedEvent.id, newDateStr);
      } else {
        // revert
        const prevObj = parseLocalDateOnly(selectedEvent.eventDate);
        setLocalMonth(String(prevObj.getMonth() + 1).padStart(2, '0'));
        setLocalDay(String(prevObj.getDate()).padStart(2, '0'));
        setLocalYear(String(prevObj.getFullYear()));
        Alert.alert(
          'Invalid Date',
          'Selected date is not in the future. Reverting to the previous date.'
        );
      }
    }
  }, [localMonth, localDay, localYear, selectedEvent, currentTime, updateEventDate]);

  // Always compute countdown from local states
  const localCountdown = useMemo(() => {
    if (!selectedEvent) return null;
    const constructedDateStr = buildDateString(localMonth, localDay, localYear);

    return computeAdjustedTime(
      constructedDateStr,
      parseInt(localDaysOff, 10) || 0,
      localDaySelections,
      currentTime
    );
  }, [selectedEvent, localMonth, localDay, localYear, localDaysOff, localDaySelections, currentTime]);

  // Toggle daySelections -> update local + parent
  const handleDaySelectionsChange = (index, isSelected) => {
    const updated = [...localDaySelections];
    updated[index] = isSelected;
    setLocalDaySelections(updated);

    if (selectedEvent) {
      updateDaySelection(selectedEvent.id, index, isSelected);
    }
  };

  // DaysOff -> update local + parent
  const handleDaysOffChange = (newValue) => {
    setLocalDaysOff(newValue);
    if (selectedEvent) {
      updateDaysOff(selectedEvent.id, parseInt(newValue, 10) || 0);
    }
  };

  // Pass latest localCountdown when toggling homepage
  const handleToggleHomepage = () => {
    if (selectedEvent && localCountdown) {
      toggleHomepage(selectedEvent.id, localCountdown);
    }
  };

  if (!selectedEvent) {
    return (
      <Animated.View style={[styles.container, { transform: [{ translateX: slideAnimation }] }]}>
        <Header title="Event Details" onClose={closePanel} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={closePanel}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <Animated.View style={[styles.container, { transform: [{ translateX: slideAnimation }] }]}>
            <ScrollView>
              <Header title={selectedEvent.name} onClose={closePanel} />

              {localCountdown ? (
                <TimeRemaining timeRemaining={localCountdown} />
              ) : (
                <Text style={styles.loadingText}>Calculating time remaining...</Text>
              )}

              <PanelDateInput
                month={localMonth}
                day={localDay}
                year={localYear}
                onDateChange={(m, d, y) => {
                  setLocalMonth(m);
                  setLocalDay(d);
                  setLocalYear(y);
                }}
              />

              <DaysActiveCheckboxes
                daySelections={localDaySelections}
                onDaySelectionChange={handleDaySelectionsChange}
              />

              <DaysOffInput
                daysOff={String(localDaysOff)}
                maxDaysOff={9999}
                onChangeDaysOff={handleDaysOffChange}
              />

              <HomepageCheckbox
                isHomepageChecked={selectedEvent.isHomepageChecked}
                onToggleHomepage={handleToggleHomepage}
              />
            </ScrollView>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

EventDetailPanel.propTypes = {
  slideAnimation: PropTypes.object.isRequired,
  selectedEvent: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    eventDate: PropTypes.string.isRequired,
    daysOff: PropTypes.number,
    daySelections: PropTypes.arrayOf(PropTypes.bool),
    isHomepageChecked: PropTypes.bool,
  }),
  selectedCountdown: PropTypes.shape({
    years: PropTypes.number,
    months: PropTypes.number,
    weeks: PropTypes.number,
    days: PropTypes.number,
    hours: PropTypes.number,
    totalDays: PropTypes.number,
  }),
  closePanel: PropTypes.func.isRequired,
  updateEventDate: PropTypes.func.isRequired,
  updateDaysOff: PropTypes.func.isRequired,
  updateDaySelection: PropTypes.func.isRequired,
  toggleHomepage: PropTypes.func.isRequired,
  currentTime: PropTypes.instanceOf(Date).isRequired,
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: '#FFF',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
  },
});
