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
import { useThemedColor } from '../useThemedColor';

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
  // Local states remain unchanged...
  const [localMonth, setLocalMonth] = useState('');
  const [localDay, setLocalDay] = useState('');
  const [localYear, setLocalYear] = useState('');
  const [localDaysOff, setLocalDaysOff] = useState(0);
  const [localDaySelections, setLocalDaySelections] = useState([true, true, true, true, true, false, false]);
  const isFirstRun = useRef(true);

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

  // (Additional effects omitted for brevity)

  const themedContainerBg = useThemedColor('rgba(62, 16, 109, 0.95)');
  const themedHeaderText = useThemedColor('#FFFFFF');
  const themedLoadingText = useThemedColor('#EEEEEE');

  if (!selectedEvent) {
    return (
      <Animated.View style={[styles.container, { transform: [{ translateX: slideAnimation }] }]}>
        <Header title="Event Details" onClose={closePanel} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: themedLoadingText }]}>Loading event details...</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={closePanel}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <Animated.View style={[styles.container, { backgroundColor: themedContainerBg, transform: [{ translateX: slideAnimation }] }]}>
            <ScrollView>
              <Header title={selectedEvent.name} onClose={closePanel} />
              {selectedCountdown ? (
                <TimeRemaining timeRemaining={selectedCountdown} />
              ) : (
                <Text style={[styles.loadingText, { color: themedLoadingText }]}>Calculating time remaining...</Text>
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
              <DaysOffInput
                initialDaysOff={String(localDaysOff)}
                maxDaysOff={selectedEvent.totalDays || 0}
                onSubmitDaysOff={(val) => {
                  setLocalDaysOff(val);
                  updateDaysOff(selectedEvent.id, parseInt(val, 10) || 0);
                }}
                initialDaySelections={localDaySelections}
                onDaySelectionsChange={(updatedSelections) => {
                  updatedSelections.forEach((isSelected, index) => {
                    updateDaySelection(selectedEvent.id, index, isSelected);
                  });
                }}
              />
              <DaysActiveCheckboxes
                daySelections={localDaySelections}
                onDaySelectionChange={(index, isSelected) => {
                  const copy = [...localDaySelections];
                  copy[index] = isSelected;
                  setLocalDaySelections(copy);
                  updateDaySelection(selectedEvent.id, index, isSelected);
                }}
              />
              <HomepageCheckbox
                isHomepageChecked={selectedEvent.isHomepageChecked}
                onToggleHomepage={() => toggleHomepage(selectedEvent.id, selectedCountdown)}
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '80%',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 2 },
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
    textAlign: 'center',
    marginTop: 20,
  },
});
