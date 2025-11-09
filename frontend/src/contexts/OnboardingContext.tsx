import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingContextType {
  isOnboardingComplete: boolean;
  userName: string | null;
  currentStep: number;
  totalSteps: number;
  setUserName: (name: string) => void;
  completeOnboarding: () => Promise<void>;
  setCurrentStep: (step: number) => void;
  resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: '@axon_onboarding_complete',
  USER_NAME: '@axon_user_name',
  ONBOARDING_STEP: '@axon_onboarding_step',
};

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [userName, setUserNameState] = useState<string | null>(null);
  const [currentStep, setCurrentStepState] = useState(0);
  const [loading, setLoading] = useState(true);
  const totalSteps = 7;

  useEffect(() => {
    loadOnboardingState();
  }, []);

  const loadOnboardingState = async () => {
    try {
      const [complete, name, step] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE),
        AsyncStorage.getItem(STORAGE_KEYS.USER_NAME),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_STEP),
      ]);

      setIsOnboardingComplete(complete === 'true');
      setUserNameState(name);
      setCurrentStepState(step ? parseInt(step) : 0);
    } catch (error) {
      console.error('Error loading onboarding state:', error);
    } finally {
      setLoading(false);
    }
  };

  const setUserName = async (name: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name);
      setUserNameState(name);
    } catch (error) {
      console.error('Error saving user name:', error);
    }
  };

  const setCurrentStep = async (step: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_STEP, step.toString());
      setCurrentStepState(step);
    } catch (error) {
      console.error('Error saving onboarding step:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
      setIsOnboardingComplete(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ONBOARDING_COMPLETE,
        STORAGE_KEYS.USER_NAME,
        STORAGE_KEYS.ONBOARDING_STEP,
      ]);
      setIsOnboardingComplete(false);
      setUserNameState(null);
      setCurrentStepState(0);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingComplete,
        userName,
        currentStep,
        totalSteps,
        setUserName,
        completeOnboarding,
        setCurrentStep,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
