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
import { colors, typography, spacing, borderRadius } from '../../constants/designTokens';
import { useOnboarding } from '../../contexts/OnboardingContext';

WebBrowser.maybeCompleteAuthSession();

const EMERGENT_AUTH_URL = 'https://auth.emergentagent.com';
const REDIRECT_URL = 'https://sciencebuild.preview.emergentagent.com'; // Will be updated with actual URL

interface GoogleSignInScreenProps {
  navigation: any;
}

export default function GoogleSignInScreen({ navigation }: GoogleSignInScreenProps) {
  const { setCurrentStep } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // Emergent Auth flow
      const authUrl = `${EMERGENT_AUTH_URL}/?redirect=${encodeURIComponent(REDIRECT_URL)}`;
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URL);
      
      if (result.type === 'success') {
        // Extract session_id from URL fragment
        const url = result.url;
        const hashParams = new URLSearchParams(url.split('#')[1]);
        const sessionId = hashParams.get('session_id');
        
        if (sessionId) {
          // Call backend to exchange session_id for user data
          // TODO: Implement in Phase 2
          console.log('[Auth] Session ID:', sessionId);
          Alert.alert('Success', 'Signed in successfully!');
          setCurrentStep(2);
          navigation.navigate('NameInput');
        }
      } else if (result.type === 'cancel') {
        console.log('[Auth] User cancelled');
      }
    } catch (error) {
      console.error('[Auth] Error:', error);
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setCurrentStep(2);
    navigation.navigate('NameInput');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '14%' }]} />
          </View>
          <Text style={styles.progressText}>1 of 7</Text>
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="log-in" size={60} color={colors.gradients.neuroplasticity.start} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Sign in to save your data</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          Your sessions, insights, and progress{'\n'}
          synced across all your devices.
        </Text>

        <View style={{ flex: 1 }} />

        {/* Google Sign-In Button */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <>
              <Ionicons name="logo-google" size={24} color={colors.text.primary} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Skip Option */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading}
          activeOpacity={0.7}
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
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  progressContainer: {
    marginBottom: spacing.xxxl,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(229, 231, 235, 0.3)',
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.gradients.neuroplasticity.start,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gradients.neuroplasticity.start + '15',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.text.primary,
    gap: spacing.md,
    marginBottom: spacing.lg,
    minHeight: 56,
  },
  googleButtonText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  skipButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipText: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
  },
});
