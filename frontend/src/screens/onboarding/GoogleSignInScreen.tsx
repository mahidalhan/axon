import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useOnboarding } from '../../contexts/OnboardingContext';

WebBrowser.maybeCompleteAuthSession();

const EMERGENT_AUTH_URL = 'https://auth.emergentagent.com';

interface GoogleSignInScreenProps {
  navigation: any;
}

export default function GoogleSignInScreen({ navigation }: GoogleSignInScreenProps) {
  const [loading, setLoading] = useState(false);
  const { setUserName } = useOnboarding();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      const redirectUrl = Linking.createURL('/');
      const authUrl = `${EMERGENT_AUTH_URL}/?redirect=${encodeURIComponent(redirectUrl)}`;
      
      console.log('[Auth] Opening auth:', authUrl);
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      
      if (result.type === 'success' && result.url) {
        const hashParams = new URLSearchParams(result.url.split('#')[1] || '');
        const sessionId = hashParams.get('session_id');
        
        if (sessionId) {
          const response = await fetch('https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data', {
            headers: { 'X-Session-ID': sessionId },
          });
          
          if (response.ok) {
            const userData = await response.json();
            console.log('[Auth] User:', userData.name);
            
            // Save user's name from Google
            await setUserName(userData.name);
            
            // Skip name input, go straight to completion
            navigation.navigate('Completion');
          }
        }
      }
    } catch (error) {
      console.error('[Auth] Error:', error);
      Alert.alert('Error', 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // If they skip, ask for name manually
    navigation.navigate('NameInput');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="log-in" size={60} color="#6366F1" />
        </View>

        <Text style={styles.title}>Sign in to save your data</Text>
        
        <Text style={styles.description}>
          Your sessions, insights, and progress{'\n'}
          synced across all your devices.
        </Text>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#1F2937" />
          ) : (
            <>
              <Ionicons name="logo-google" size={24} color="#1F2937" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1F2937',
    gap: 12,
    marginBottom: 16,
    minHeight: 56,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
});
