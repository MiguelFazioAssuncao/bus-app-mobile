import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Directions from './src/pages/Directions';
import Lines from './src/pages/Lines';
import Stations from './src/pages/Stations';
import Search from './src/pages/Search';
import UserProfile from './src/pages/UserProfile';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['http://localhost:8081', 'http://localhost:19006', 'http://localhost'],
  config: {
    screens: {
      Login: 'login',
      Register: 'register',
      Directions: 'directions',
      Lines: 'lines',
      Stations: 'stations',
      Search: 'search',
      Profile: 'profile',
    },
  },
};

const NAV_STATE_KEY = 'NAVIGATION_STATE_V1';

export default function App() {
  const [initialState, setInitialState] = useState();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let stored = null;
        if (Platform.OS === 'web') stored = window.localStorage.getItem(NAV_STATE_KEY);
        else stored = await AsyncStorage.getItem(NAV_STATE_KEY);
        if (stored) setInitialState(JSON.parse(stored));
      } catch {}
      setReady(true);
    })();
  }, []);

  const handleStateChange = async (state) => {
    try {
      const serialized = JSON.stringify(state);
      if (Platform.OS === 'web') window.localStorage.setItem(NAV_STATE_KEY, serialized);
      else await AsyncStorage.setItem(NAV_STATE_KEY, serialized);
    } catch {}
  };

  if (!ready) return null;

  return (
    <NavigationContainer linking={linking} initialState={initialState} onStateChange={handleStateChange}>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Directions" component={Directions} />
        <Stack.Screen name="Lines" component={Lines} />
        <Stack.Screen name="Stations" component={Stations} />
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="Profile" component={UserProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
