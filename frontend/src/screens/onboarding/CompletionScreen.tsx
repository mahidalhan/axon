import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants/designTokens';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface CompletionScreenProps {
  navigation: any;
}

export default function CompletionScreen({ navigation }: CompletionScreenProps) {
  const { completeOnboarding, userName } = useOnboarding();

  const handleStart = async () => {
    await completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color={colors.status.excellent} />
        </View>

        <Text style={styles.title}>
          Nice to meet you, {userName}!
        </Text>
        
        <Text style={styles.subtitle}>
          AXON is your brain companion, helping you identify and maximize your peak cognitive windows.
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <Ionicons name="flash" size={24} color={colors.gradients.currentNeuroState.start} />
            <Text style={styles.featureText}>Track real-time brain states</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="analytics" size={24} color={colors.gradients.neuroplasticity.start} />
            <Text style={styles.featureText}>Optimize timing with science</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="moon" size={24} color={colors.gradients.sleepConsolidation.start} />
            <Text style={styles.featureText}>Improve sleep consolidation</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleStart}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Start Using AXON</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxxl,
  },
  featuresContainer: {
    gap: spacing.lg,
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  featureText: {
    fontSize: typography.sizes.body,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  footer: {
    padding: spacing.xl,
  },
  ctaButton: {
    backgroundColor: colors.gradients.neuroplasticity.start,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
});
