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

interface PrivacyScreenProps {
  navigation: any;
}

export default function PrivacyScreen({ navigation }: PrivacyScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={80} color={colors.gradients.sleepConsolidation.start} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Privacy by design</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          All EEG data is processed locally on your device.{'\n\n'}
          We never sell or share your information with third parties.
        </Text>

        {/* Links */}
        <View style={styles.linksContainer}>
          <TouchableOpacity style={styles.link}>
            <Ionicons name="document-text-outline" size={20} color={colors.gradients.neuroplasticity.start} />
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.gradients.neuroplasticity.start} />
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CTA Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('GoogleSignIn')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Accept and continue</Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>
          By tapping on "Accept and continue", you agree to our{'\n'}
          Terms of Service and Privacy Policy.
        </Text>
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
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.gradients.sleepConsolidation.start + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxxl,
  },
  linksContainer: {
    gap: spacing.lg,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkText: {
    fontSize: typography.sizes.body,
    color: colors.gradients.neuroplasticity.start,
    fontWeight: typography.weights.semibold,
  },
  footer: {
    padding: spacing.xl,
  },
  ctaButton: {
    backgroundColor: colors.text.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ctaText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  disclaimer: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
