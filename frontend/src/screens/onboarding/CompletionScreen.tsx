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
    // Navigation will automatically switch to main app
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name=\"checkmark-circle\" size={100} color={colors.status.excellent} />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Nice to meet you, {userName}!
        </Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>
          AXON is your brain companion, helping you identify and maximize your peak cognitive windows.
        </Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <Ionicons name=\"flash\" size={24} color={colors.gradients.currentNeuroState.start} />
            <Text style={styles.featureText}>Track real-time brain states</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name=\"analytics\" size={24} color={colors.gradients.neuroplasticity.start} />
            <Text style={styles.featureText}>Optimize timing with science</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name=\"moon\" size={24} color={colors.gradients.sleepConsolidation.start} />
            <Text style={styles.featureText}>Improve sleep consolidation</Text>
          </View>
        </View>
      </View>

      {/* CTA Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleStart}
          activeOpacity={0.8}
        >\n          <Text style={styles.ctaText}>Start Using AXON</Text>\n        </TouchableOpacity>\n      </View>\n    </SafeAreaView>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    backgroundColor: colors.background.secondary,\n  },\n  content: {\n    flex: 1,\n    alignItems: 'center',\n    justifyContent: 'center',\n    paddingHorizontal: spacing.xl,\n  },\n  iconContainer: {\n    marginBottom: spacing.xxxl,\n  },\n  title: {\n    fontSize: typography.sizes.h2,\n    fontWeight: typography.weights.bold,\n    color: colors.text.primary,\n    textAlign: 'center',\n    marginBottom: spacing.lg,\n  },\n  subtitle: {\n    fontSize: typography.sizes.body,\n    color: colors.text.secondary,\n    textAlign: 'center',\n    lineHeight: 24,\n    marginBottom: spacing.xxxl,\n  },\n  featuresContainer: {\n    gap: spacing.lg,\n    width: '100%',\n  },\n  featureRow: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    gap: spacing.md,\n    paddingVertical: spacing.sm,\n  },\n  featureText: {\n    fontSize: typography.sizes.body,\n    color: colors.text.primary,\n    fontWeight: typography.weights.medium,\n  },\n  footer: {\n    padding: spacing.xl,\n  },\n  ctaButton: {\n    backgroundColor: colors.gradients.neuroplasticity.start,\n    paddingVertical: spacing.lg,\n    borderRadius: borderRadius.md,\n    alignItems: 'center',\n  },\n  ctaText: {\n    fontSize: typography.sizes.body,\n    fontWeight: typography.weights.bold,\n    color: colors.white,\n  },\n});\n