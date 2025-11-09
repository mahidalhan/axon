import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import SessionScreen from './src/screens/SessionScreen';
import HealthScreen from './src/screens/HealthScreen';
import EducationScreen from './src/screens/EducationScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: any;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Session') {
                iconName = focused ? 'pulse' : 'pulse-outline';
              } else if (route.name === 'Health') {
                iconName = focused ? 'heart' : 'heart-outline';
              } else if (route.name === 'Learn') {
                iconName = focused ? 'school' : 'school-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }

              return <Ionicons name={iconName} size={32} color={color} />;
            },
            tabBarActiveTintColor: '#4F46E5',
            tabBarInactiveTintColor: '#9CA3AF',
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              marginBottom: 0,
              marginTop: 2,
            },
            tabBarIconStyle: {
              marginTop: 0,
              marginBottom: 0,
            },
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 0,
              height: 82,
              paddingBottom: 8,
              paddingTop: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 12,
            },
            headerStyle: {
              backgroundColor: '#FFFFFF',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            },
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Brain Score' }} />
          <Tab.Screen name="Session" component={SessionScreen} options={{ title: 'Session Analysis' }} />
          <Tab.Screen name="Health" component={HealthScreen} options={{ title: 'Health Data' }} />
          <Tab.Screen name="Learn" component={EducationScreen} options={{ title: 'Learn' }} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
