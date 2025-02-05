import 'react-native-get-random-values'; // Must be at the very top
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './HomeScreen';
import ErrorBoundary from './components/ErrorBoundary';

export default function IndexRoute() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <HomeScreen />
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
