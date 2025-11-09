import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScoreRing from '../../components/ScoreRing';
import { colors, typography, spacing, borderRadius } from '../../constants/designTokens';
import { appCopy } from '../../constants/copy';

interface ScoreEducationScreenProps {
  navigation: any;
  scoreType: 'currentNeuroState' | 'neuroplasticity' | 'sleepConsolidation';
  step: number;
  totalSteps: number;
}

const SCORE_CONFIG = {
  currentNeuroState: {
    value: 72,
    gradientColors: [colors.gradients.currentNeuroState.start, colors.gradients.currentNeuroState.end] as [string, string],
    bullets: [
      'Deep work that demands focus',
      'Complex problem-solving',
      'Creative breakthroughs',
      'Strategic thinking',
    ],
  },
  neuroplasticity: {
    value: 78,
    gradientColors: [colors.gradients.neuroplasticity.start, colors.gradients.neuroplasticity.end] as [string, string],
    bullets: [
      'Form new neural connections',
      'Master new skills',
      'Adapt to challenges',
      'Build mental resilience',
    ],
  },
  sleepConsolidation: {
    value: 82,
    gradientColors: [colors.gradients.sleepConsolidation.start, colors.gradients.sleepConsolidation.end] as [string, string],
    bullets: [
      'Memory formation quality',
      'Neural recovery strength',
      'Brain rewiring overnight',
      'Deep sleep consolidation',
    ],
  },
};

export default function ScoreEducationScreen({
  navigation,
  scoreType,
  step,
  totalSteps,
}: ScoreEducationScreenProps) {
  const config = SCORE_CONFIG[scoreType];
  const scoreInfo = appCopy.scores[scoreType];

  const handleNext = () => {
    if (step === 6) {
      navigation.navigate('Completion');
    } else if (step === 4) {
      navigation.navigate('ScoreEducation2');
    } else if (step === 5) {
      navigation.navigate('ScoreEducation3');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{step} of {totalSteps}</Text>
        </View>

        <View style={styles.scoreContainer}>
          <ScoreRing
            value={config.value}
            label={scoreInfo.title}
            subtitle={scoreInfo.subtitle}
            gradientColors={config.gradientColors}
            size={140}
            strokeWidth={12}
            isPrimary={true}
          />
        </View>

        <Text style={styles.description}>{scoreInfo.description}</Text>

        <View style={styles.bulletSection}>
          <Text style={styles.bulletTitle}>Perfect for:</Text>
          {config.bullets.map((bullet, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: config.gradientColors[0] }]} />
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.scienceNote}>
          <Text style={styles.scienceText}>
            Based on neuroscience research from Huberman Lab and peer-reviewed studies.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
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
  scoreContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  description: {
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: spacing.xl,
  },
  bulletSection: {
    marginBottom: spacing.xl,
  },
  bulletTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  bulletText: {
    flex: 1,
    fontSize: typography.sizes.bodySmall,
    color: colors.text.primary,
    lineHeight: 20,
  },
  scienceNote: {
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.sm,
  },
  scienceText: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    padding: spacing.xl,
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: colors.text.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  ctaText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
});
