import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import PrivacyScreen from '../screens/onboarding/PrivacyScreen';
import GoogleSignInScreen from '../screens/onboarding/GoogleSignInScreen';
import NameInputScreen from '../screens/onboarding/NameInputScreen';
import ScoreEducationScreen from '../screens/onboarding/ScoreEducationScreen';
import CompletionScreen from '../screens/onboarding/CompletionScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="GoogleSignIn" component={GoogleSignInScreen} />
      <Stack.Screen name="NameInput" component={NameInputScreen} />
      <Stack.Screen 
        name="ScoreEducation1" 
        component={(props) => (
          <ScoreEducationScreen 
            {...props} 
            scoreType="currentNeuroState"
            step={4}
            totalSteps={7}
          />
        )}
      />
      <Stack.Screen 
        name="ScoreEducation2" 
        component={(props) => (
          <ScoreEducationScreen 
            {...props} 
            scoreType="neuroplasticity"
            step={5}
            totalSteps={7}
          />
        )}
      />
      <Stack.Screen 
        name="ScoreEducation3" 
        component={(props) => (
          <ScoreEducationScreen 
            {...props} 
            scoreType="sleepConsolidation"
            step={6}
            totalSteps={7}
          />
        )}
      />
      <Stack.Screen name="Completion" component={CompletionScreen} />
    </Stack.Navigator>
  );
}
