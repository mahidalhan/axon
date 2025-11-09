import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{step} of {totalSteps}</Text>
        </View>

        {/* Score Ring */}
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

        {/* Description */}
        <Text style={styles.description}>{scoreInfo.description}</Text>

        {/* Bullets */}
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

        {/* Science Note */}
        <View style={styles.scienceNote}>
          <Text style={styles.scienceText}>
            Based on neuroscience research from Huberman Lab and peer-reviewed studies.
          </Text>
        </View>
      </View>

      {/* CTA Button */}
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
}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    backgroundColor: colors.background.secondary,\n  },\n  content: {\n    flex: 1,\n    paddingHorizontal: spacing.xl,\n    paddingTop: spacing.xl,\n  },\n  progressContainer: {\n    marginBottom: spacing.xxxl,\n  },\n  progressBar: {\n    height: 4,\n    backgroundColor: 'rgba(229, 231, 235, 0.3)',\n    borderRadius: 2,\n    marginBottom: spacing.sm,\n  },\n  progressFill: {\n    height: 4,\n    backgroundColor: colors.gradients.neuroplasticity.start,\n    borderRadius: 2,\n  },\n  progressText: {\n    fontSize: typography.sizes.caption,\n    color: colors.text.tertiary,\n    textAlign: 'center',\n  },\n  scoreContainer: {\n    alignItems: 'center',\n    marginBottom: spacing.xxxl,\n  },\n  description: {\n    fontSize: typography.sizes.h4,\n    fontWeight: typography.weights.semibold,\n    color: colors.text.primary,\n    textAlign: 'center',\n    lineHeight: 28,\n    marginBottom: spacing.xl,\n  },\n  bulletSection: {\n    marginBottom: spacing.xl,\n  },\n  bulletTitle: {\n    fontSize: typography.sizes.body,\n    fontWeight: typography.weights.bold,\n    color: colors.text.primary,\n    marginBottom: spacing.md,\n  },\n  bulletRow: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    marginBottom: spacing.md,\n  },\n  bulletDot: {\n    width: 8,\n    height: 8,\n    borderRadius: 4,\n    marginRight: spacing.md,\n  },\n  bulletText: {\n    flex: 1,\n    fontSize: typography.sizes.bodySmall,\n    color: colors.text.primary,\n    lineHeight: 20,\n  },\n  scienceNote: {\n    padding: spacing.md,\n    backgroundColor: colors.background.primary,\n    borderRadius: borderRadius.sm,\n  },\n  scienceText: {\n    fontSize: typography.sizes.caption,\n    color: colors.text.secondary,\n    textAlign: 'center',\n    lineHeight: 16,\n  },\n  footer: {\n    padding: spacing.xl,\n  },\n  ctaButton: {\n    flexDirection: 'row',\n    backgroundColor: colors.text.primary,\n    paddingVertical: spacing.lg,\n    borderRadius: borderRadius.md,\n    alignItems: 'center',\n    justifyContent: 'center',\n    gap: spacing.sm,\n  },\n  ctaText: {\n    fontSize: typography.sizes.body,\n    fontWeight: typography.weights.bold,\n    color: colors.white,\n  },\n});\n