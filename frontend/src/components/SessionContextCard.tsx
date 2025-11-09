import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassmorphicCard from './GlassmorphicCard';
import { colors, typography, spacing } from '../constants/designTokens';
import { appCopy } from '../constants/copy';

interface SessionContextCardProps {
  startTime: string;
  endTime: string;
  duration: number;
  postExerciseHours: number | null;
  circadianPhase: 'morning_peak' | 'afternoon_dip' | 'evening_peak' | 'sleep';
  peakMoments: number;
  flowMinutes?: number;
}

export default function SessionContextCard({
  startTime,
  endTime,
  duration,
  postExerciseHours,
  circadianPhase,
  peakMoments,
  flowMinutes,
}: SessionContextCardProps) {
  const getCircadianLabel = () => {
    return appCopy.session.circadianPhase[circadianPhase] || 'Active period';
  };

  const getTimingContext = () => {
    if (postExerciseHours && postExerciseHours >= 1 && postExerciseHours <= 4) {
      return `${Math.round(postExerciseHours)}h post-exercise (optimal window)`;
    } else if (postExerciseHours && postExerciseHours < 1) {
      return 'Immediately post-exercise';
    }
    return null;
  };

  const timingContext = getTimingContext();

  return (
    <GlassmorphicCard style={styles.card} elevated>
      <View style={styles.header}>
        <Ionicons name="location" size={20} color={colors.gradients.currentNeuroState.start} />
        <Text style={styles.headerText}>{appCopy.session.contextTitle}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.iconRow}>
          <Ionicons name="time-outline" size={18} color={colors.text.secondary} />
          <Text style={styles.label}>TIME</Text>
        </View>
        <Text style={styles.value}>
          {startTime} - {endTime} ({duration} min)
        </Text>
      </View>

      {timingContext && (
        <View style={styles.section}>
          <View style={styles.iconRow}>
            <Ionicons name="fitness-outline" size={18} color={colors.text.secondary} />
            <Text style={styles.label}>TIMING</Text>
          </View>
          <Text style={styles.value}>{timingContext}</Text>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.iconRow}>
          <Ionicons name="sunny-outline" size={18} color={colors.text.secondary} />
          <Text style={styles.label}>CIRCADIAN PHASE</Text>
        </View>
        <Text style={styles.value}>{getCircadianLabel()}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.iconRow}>
          <Ionicons name="flash-outline" size={18} color={colors.chart.gammaPeak} />
          <Text style={styles.label}>PERFORMANCE</Text>
        </View>
        <Text style={styles.value}>
          {peakMoments} {appCopy.session.gammaPeaks}
          {flowMinutes && ` • ${flowMinutes} min in flow`}
        </Text>
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          Your brain was primed for deep work and peak cognitive tasks.
        </Text>
      </View>
    </GlassmorphicCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.3)',
  },
  headerText: {
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  section: {
    marginBottom: spacing.md,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    lineHeight: 22,
  },
  summaryBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.gradients.neuroplasticity.start,
  },
  summaryText: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    lineHeight: 20,
  },
});
