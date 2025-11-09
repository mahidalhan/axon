import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/designTokens';

interface FormulaBarProps {
  label: string;
  weight: number;  // 0-1 (e.g., 0.4 = 40%)
  value: number;   // Score value
  color: string;
}

export default function FormulaBar({ label, weight, value, color }: FormulaBarProps) {
  const percentage = weight * 100;
  const barWidth = `${value}%`;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.weight}>{percentage.toFixed(0)}%</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: barWidth, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  weight: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.bold,
    color: colors.gradients.neuroplasticity.start,
    backgroundColor: colors.gradients.neuroplasticity.start + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  value: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    minWidth: 32,
    textAlign: 'right',
  },
  barBackground: {
    height: 8,
    backgroundColor: 'rgba(229, 231, 235, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
});
